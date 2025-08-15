import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';
import TweetCard from '../components/tweet/TweetCard';
import TweetForm from '../components/tweet/TweetForm';
import Spinner from '../components/ui/Spinner';
import { useAuthState } from '../context/AuthContext';

function HomePage() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthState(); // Sadece user bilgisini almak için

  useEffect(() => {
    const fetchTweets = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/tweets'); // Bu endpoint anasayfa akışını getirmeli
        setTweets(response.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setError(err.response?.data?.message || 'Tweetler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Kullanıcı yüklendikten sonra tweetleri çek
      fetchTweets();
    }
  }, [user]); // user değiştiğinde (login/logout) tekrar çek

  const handleTweetPosted = (newTweet) => {
    setTweets(prevTweets => [newTweet, ...prevTweets]); // Yeni tweet'i listenin başına ekle
  };
  
  const handleDeleteTweet = (tweetId) => {
    setTweets(prevTweets => prevTweets.filter(tweet => tweet._id !== tweetId));
  };

  const handleLikeUnlikeTweet = (updatedTweet) => {
    setTweets(prevTweets => 
      prevTweets.map(tweet => tweet._id === updatedTweet._id ? updatedTweet : tweet)
    );
  };


  if (loading && tweets.length === 0) { // İlk yüklemede spinner göster
    return <div className="flex justify-center items-center mt-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200">Anasayfa</h1>
        <TweetForm onTweetPosted={handleTweetPosted} />
        {tweets.length === 0 && !loading && (
          <p className="text-center text-gray-500 p-6">
            Takip ettiğiniz kişilerin veya sizin henüz hiç tweetiniz yok. Ya da bir şeyler ters gitti!
          </p>
        )}
        <div>
          {tweets.map(tweet => (
            <TweetCard 
                key={tweet._id} 
                tweet={tweet} 
                onDelete={handleDeleteTweet}
                onLikeUnlike={handleLikeUnlikeTweet}
            />
          ))}
        </div>
         {loading && tweets.length > 0 && <div className="p-4 text-center"><Spinner size="md"/></div>} {/* Daha fazla yükleniyor */}
      </div>
    </div>
  );
}

export default HomePage;