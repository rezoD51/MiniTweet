import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import UserCard from '../components/user/UserCard';
import Spinner from '../components/ui/Spinner';
import { useAuthState, useAuthActions } from '../context/AuthContext';
import { Search as SearchIcon } from 'lucide-react';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuthState();
  const { updateUserContext } = useAuthActions(); // Takip durumunu context'te güncellemek için

  // Debounce için
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await apiClient.get(`/users/search?q=${searchTerm}`);
        setResults(response.data);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.response?.data?.message || 'Arama sırasında bir hata oluştu.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms bekleme

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFollowToggle = useCallback(async (targetUserId, isCurrentlyFollowing) => {
    if (!currentUser) return;
    // Optimistic UI: Önce arayüzü güncelle, sonra API isteği yap
    const originalResults = [...results];
    const updatedResults = results.map(user => {
        if (user._id === targetUserId) {
            return { ...user, isOptimisticFollowing: !isCurrentlyFollowing }; // Geçici bir flag
        }
        return user;
    });
    setResults(updatedResults);

    try {
      let response;
      if (isCurrentlyFollowing) {
        response = await apiClient.post(`/users/${targetUserId}/unfollow`);
      } else {
        response = await apiClient.post(`/users/${targetUserId}/follow`);
      }
      // AuthContext'teki kullanıcı bilgilerini güncelle (takip listesi)
      if (response.data.following) {
        updateUserContext({ following: response.data.following });
        // Gerçek takip durumunu yansıtmak için results'ı tekrar API'den gelen bilgiye göre güncellemeye gerek yok,
        // çünkü `currentUser.following` değişince UserCard prop'u güncellenecek.
      }
    } catch (err) {
      console.error("Follow/Unfollow error from search:", err);
      setError(err.response?.data?.message || "Takip işlemi sırasında bir hata oluştu.");
      setResults(originalResults); // Hata durumunda eski haline getir
    }
  }, [currentUser, results, updateUserContext]);


  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold mb-4">Kullanıcı Ara</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-twitter-blue focus:border-twitter-blue sm:text-sm"
              placeholder="Kullanıcı adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading && <div className="p-6 text-center"><Spinner size="md" /></div>}
        {error && <div className="text-center text-red-500 p-6">{error}</div>}
        
        {!loading && !error && searchTerm.trim() && results.length === 0 && (
          <p className="text-center text-gray-500 p-6">"{searchTerm}" ile eşleşen kullanıcı bulunamadı.</p>
        )}

        {!loading && results.length > 0 && (
          <div>
            {results.map(user => {
                if (user._id === currentUser?._id) return null; // Kendini listede gösterme
                const isFollowing = currentUser?.following?.some(followedUser => followedUser === user._id || followedUser._id === user._id);
                return (
                    <UserCard 
                        key={user._id} 
                        user={user} 
                        onFollowToggle={handleFollowToggle}
                        isFollowing={user.isOptimisticFollowing !== undefined ? user.isOptimisticFollowing : isFollowing}
                    />
                );
            })}
          </div>
        )}
         {!searchTerm.trim() && !loading && (
            <p className="text-center text-gray-500 p-6">Aramak için bir şeyler yazın.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;