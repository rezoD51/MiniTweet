import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { useAuthState } from '../../context/AuthContext';
import Button from '../ui/Button'; // Button bileşenini import et

function TweetForm({ onTweetPosted }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthState();
  const remainingChars = 280 - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Tweet içeriği boş olamaz.');
      return;
    }
    if (content.length > 280) {
      setError('Tweet 280 karakteri geçemez.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/tweets', { content });
      setContent('');
      if (onTweetPosted) {
        onTweetPosted(response.data); // Yeni tweet'i üst bileşene gönder
      }
    } catch (err) {
      console.error("Tweet post error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Tweet gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null; // Giriş yapmamışsa formu gösterme

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={user.profilePicture || 'https://via.placeholder.com/150'}
            alt={user.username}
          />
          <div className="flex-1">
            <textarea
              className="w-full p-2 text-lg border border-gray-300 rounded-md focus:ring-twitter-blue focus:border-twitter-blue resize-none placeholder-gray-500"
              rows="3"
              placeholder="Neler oluyor?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if(error) setError('');
              }}
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2 ml-16">{error}</p>}
        <div className="flex items-center justify-end mt-2 space-x-3">
          <span className={`text-sm ${remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {remainingChars}
          </span>
          <Button type="submit" variant="primary" size="md" loading={isLoading} disabled={!content.trim() || remainingChars < 0}>
            Tweetle
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TweetForm;