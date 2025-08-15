import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuthState, useAuthActions } from '../context/AuthContext';
import TweetCard from '../components/tweet/TweetCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
// parseISO ve format fonksiyonlarını date-fns'ten import edin
import { format, parseISO } from 'date-fns'; // <<< BU SATIRI EKLEYİN VEYA KONTROL EDİN
import { tr } from 'date-fns/locale'; // Türkçe lokali için
import { CalendarDays } from 'lucide-react';


function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuthState();
  const { updateUserContext } = useAuthActions();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser && (currentUser._id === userId || currentUser.id === userId);

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      // Backend'den /api/users/:id hem kullanıcı bilgisini hem de tweetlerini döndürüyor
      const response = await apiClient.get(`/users/${userId}`);
      setProfileUser(response.data.user);
      setTweets(response.data.tweets);
      // Takip durumunu kontrol et (eğer kendi profilin değilse)
      if (currentUser && currentUser.following && !isOwnProfile) {
        setIsFollowing(currentUser.following.some(followedUser => followedUser === userId || followedUser._id === userId));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || 'Profil yüklenirken bir hata oluştu.');
      if(err.response?.status === 404) navigate('/404'); // Kullanıcı bulunamazsa 404'e yönlendir
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser, isOwnProfile, navigate]);

  useEffect(() => {
    if (token) { // Token varsa (kullanıcı giriş yapmışsa) profili çek
        fetchProfileData();
    }
  }, [userId, token, fetchProfileData]); // userId veya token değiştiğinde yeniden çek

  const handleFollowToggle = async () => {
    if (isOwnProfile || followLoading) return;
    setFollowLoading(true);
    try {
      let response;
      if (isFollowing) {
        response = await apiClient.post(`/users/${userId}/unfollow`);
        setIsFollowing(false);
      } else {
        response = await apiClient.post(`/users/${userId}/follow`);
        setIsFollowing(true);
      }
      // AuthContext'teki kullanıcı bilgilerini güncelle
      if (response.data.following) {
        updateUserContext({ following: response.data.following });
      }
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
      setError(err.response?.data?.message || "Takip işlemi sırasında bir hata oluştu.");
    } finally {
      setFollowLoading(false);
    }
  };
  
  const handleDeleteTweet = (tweetId) => {
    setTweets(prevTweets => prevTweets.filter(tweet => tweet._id !== tweetId));
  };

  const handleLikeUnlikeTweet = (updatedTweet) => {
    setTweets(prevTweets => 
      prevTweets.map(tweet => tweet._id === updatedTweet._id ? updatedTweet : tweet)
    );
  };


  if (loading) {
    return <div className="flex justify-center items-center mt-20"><Spinner size="lg" /></div>;
  }

  if (error && !profileUser) { // Eğer profil yüklenememişse ve hata varsa
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }
  
  if (!profileUser) { // ProfilUser hala null ise (örneğin 404'e yönlendirme sonrası)
    return <div className="text-center text-gray-500 mt-10">Kullanıcı bulunamadı.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Profil Banner (İsteğe Bağlı) */}
            {/* <div className="h-40 bg-gray-300"></div> */}
            
            <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center space-x-4">
                        <img 
                            src={profileUser.profilePicture || 'https://via.placeholder.com/150'} 
                            alt={profileUser.username}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white -mt-12 md:-mt-16 object-cover"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
                            <p className="text-sm text-gray-500">@{profileUser.username}</p>
                        </div>
                    </div>
                    {!isOwnProfile && currentUser && (
                        <Button 
                            onClick={handleFollowToggle} 
                            variant={isFollowing ? 'outline-gray' : 'primary'} 
                            size="md" 
                            loading={followLoading}
                            className="mt-4 sm:mt-0 w-full sm:w-auto"
                        >
                            {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                        </Button>
                    )}
                     {isOwnProfile && (
                        <Button 
                            onClick={() => alert("Profil düzenleme henüz eklenmedi.")} // TODO: Profil düzenleme modal/sayfası
                            variant="outline-gray" 
                            size="md" 
                            className="mt-4 sm:mt-0 w-full sm:w-auto"
                        >
                            Profili Düzenle
                        </Button>
                    )}
                </div>

                {profileUser.bio && <p className="text-gray-700 mt-4">{profileUser.bio}</p>}
                
                <div className="mt-4 text-sm text-gray-500 flex items-center">
                    <CalendarDays size={16} className="mr-1.5"/>
                    Katılma tarihi: {profileUser.createdAt ? format(parseISO(profileUser.createdAt), 'MMMM yyyy', { locale: tr }) : 'Bilinmiyor'}
                </div>

                <div className="mt-4 flex space-x-4 border-t border-gray-200 pt-4">
                    <div>
                        <span className="font-bold text-gray-900">{profileUser.following?.length || 0}</span>
                        <span className="text-gray-500 ml-1">Takip Edilen</span>
                    </div>
                    <div>
                        <span className="font-bold text-gray-900">{profileUser.followers?.length || 0}</span>
                        <span className="text-gray-500 ml-1">Takipçi</span>
                    </div>
                     <div>
                        <span className="font-bold text-gray-900">{tweets.length}</span>
                        <span className="text-gray-500 ml-1">Tweet</span>
                    </div>
                </div>
                 {error && <div className="text-red-500 text-sm mt-2">{error}</div>} {/* Takip etme gibi işlemlerdeki hatalar için */}
            </div>

            {/* Tweetler Tab */}
            <div className="border-t border-gray-200">
                <h2 className="p-4 text-lg font-semibold text-gray-800">Tweetler</h2>
                {tweets.length === 0 && (
                    <p className="text-center text-gray-500 p-6">{isOwnProfile ? "Henüz hiç tweet atmadın." : "Bu kullanıcının henüz hiç tweeti yok."}</p>
                )}
                <div>
                    {tweets.map(tweet => (
                       <TweetCard 
                            key={tweet._id} 
                            tweet={tweet} 
                            onDelete={isOwnProfile ? handleDeleteTweet : undefined} // Sadece kendi tweetlerini silebilir
                            onLikeUnlike={handleLikeUnlikeTweet}
                        />
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

export default ProfilePage;