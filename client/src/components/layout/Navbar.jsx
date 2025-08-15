import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState, useAuthActions } from '../../context/AuthContext';
import { Home, User, Search, LogOut, Send, Menu, X } from 'lucide-react';

function Navbar() {
  const { user, isAuthenticated } = useAuthState();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const commonLinks = (
     <>
        <Link to="/" className="flex items-center hover:text-twitter-blue px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            <Home size={20} className="mr-1" /> Anasayfa
        </Link>
        <Link to="/search" className="flex items-center hover:text-twitter-blue px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            <Search size={20} className="mr-1" /> Ara
        </Link>
        {user && (
            <Link to={`/profile/${user.id || user._id}`} className="flex items-center hover:text-twitter-blue px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
            <User size={20} className="mr-1" /> Profilim
            </Link>
        )}
        <button
            onClick={handleLogout}
            className="flex items-center text-left w-full hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium"
        >
            <LogOut size={20} className="mr-1" /> Çıkış Yap
        </button>
     </>
  );

  if (!isAuthenticated) {
    // Giriş yapılmamışsa Navbar'ı gösterme veya farklı bir Navbar gösterilebilir.
    // Şimdilik App.jsx korumalı rotalarda olduğu için bu duruma pek gelinmeyecek.
    return null; 
  }

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-twitter-blue font-bold text-xl flex items-center">
              <Send size={28} className="mr-2 transform -rotate-45" /> MiniTweet
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {commonLinks}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-twitter-blue focus:outline-none">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobil Menü */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {commonLinks}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;