import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button'; // Eğer takip/takipten çıkar butonu eklenecekse

function UserCard({ user, onFollowToggle, isFollowing }) {
  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
      <Link to={`/profile/${user._id}`} className="flex items-center space-x-3">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={user.profilePicture || 'https://via.placeholder.com/150'}
          alt={user.username}
        />
        <div>
          <p className="font-semibold text-gray-800 hover:underline">{user.username}</p>
          {/* <p className="text-sm text-gray-500">@{user.username}</p> */}
        </div>
      </Link>
      {onFollowToggle && (
        <Button 
          onClick={() => onFollowToggle(user._id, isFollowing)}
          variant={isFollowing ? 'outline-gray' : 'primary'}
          size="sm"
        >
          {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
        </Button>
      )}
    </div>
  );
}

export default UserCard;