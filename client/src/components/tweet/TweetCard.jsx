import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Edit3 } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuthState } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import Button from '../ui/Button'; // Button bileşenini import et

function TweetCard({ tweet, onDelete, onLikeUnlike }) {
  const { user: currentUser } = useAuthState();
  const [isLikedByMe, setIsLikedByMe] = useState(tweet.likes.some(like => like === currentUser?._id || like?._id === currentUser?._id));
  const [likeCount, setLikeCount] = useState(tweet.likes.length);
  const [error, setError] = useState('');
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  if (!tweet || !tweet.user) {
    return <div className="p-4 border-b border-gray-200">Tweet verisi yüklenemedi.</div>;
  }

  const timeAgo = tweet.createdAt ? formatDistanceToNowStrict(parseISO(tweet.createdAt), { addSuffix: true, locale: tr }) : 'bilinmeyen zaman';
  const isOwner = currentUser && (currentUser._id === tweet.user._id || currentUser.id === tweet.user._id);

  const handleLikeUnlike = async () => {
    if (!currentUser || isLoadingLike) return;
    setIsLoadingLike(true);
    setError('');
    try {
      let response;
      if (isLikedByMe) {
        response = await apiClient.post(`/tweets/${tweet._id}/unlike`);
        setIsLikedByMe(false);
        setLikeCount(prev => prev - 1);
      } else {
        response = await apiClient.post(`/tweets/${tweet._id}/like`);
        setIsLikedByMe(true);
        setLikeCount(prev => prev + 1);
      }
      if (onLikeUnlike) onLikeUnlike(response.data); // Üst bileşeni güncellemek için
    } catch (err) {
      console.error("Like/Unlike error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Bir hata oluştu.");
      // Başarısız olursa durumu geri alabiliriz
      if (isLikedByMe) { // Unlike başarısızsa, like'ı geri ekle
        setIsLikedByMe(true);
        setLikeCount(prev => prev + 1);
      } else { // Like başarısızsa, like'ı geri çıkar
        setIsLikedByMe(false);
        setLikeCount(prev => prev - 1);
      }
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !window.confirm("Bu tweet'i silmek istediğinizden emin misiniz?")) return;
    try {
      await apiClient.delete(`/tweets/${tweet._id}`);
      if (onDelete) onDelete(tweet._id);
    } catch (err) {
      console.error("Delete error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Tweet silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex space-x-3">
        <Link to={`/profile/${tweet.user._id}`}>
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={tweet.user.profilePicture || 'https://via.placeholder.com/150'}
            alt={tweet.user.username}
          />
        </Link>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Link to={`/profile/${tweet.user._id}`} className="font-bold text-gray-900 hover:underline">
                {tweet.user.username}
              </Link>
              <span className="text-gray-500 text-sm">· {timeAgo}</span>
            </div>
            {isOwner && (
              <Button onClick={handleDelete} variant="danger" size="sm" className="p-1">
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          <p className="text-gray-800 text-sm whitespace-pre-wrap">{tweet.content}</p>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex items-center space-x-6 pt-2 text-gray-500">
            <button
              onClick={handleLikeUnlike}
              disabled={isLoadingLike}
              className={`flex items-center space-x-1 hover:text-red-500 focus:outline-none ${isLikedByMe ? 'text-red-500' : ''}`}
            >
              <Heart size={18} fill={isLikedByMe ? 'currentColor' : 'none'} />
              <span className="text-xs">{likeCount}</span>
            </button>
            {/* <button className="flex items-center space-x-1 hover:text-twitter-blue focus:outline-none">
              <MessageCircle size={18} />
              <span className="text-xs">{tweet.replies?.length || 0}</span>
            </button> */}
            {/* Diğer etkileşim butonları (retweet, share) eklenebilir */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TweetCard;