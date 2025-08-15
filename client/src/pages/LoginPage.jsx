import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthActions, useAuthState } from '../context/AuthContext';
import Button from '../components/ui/Button';

function LoginPage() {
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const { login, clearError } = useAuthActions();
  const { error, loading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    // Component unmount olduğunda hatayı temizle
    return () => {
      if(error) clearError();
    }
  }, [isAuthenticated, navigate, error, clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
     if (error) clearError(); // Yazmaya başlayınca hatayı temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      // Başarılı giriş sonrası AuthContext'teki useEffect veya App.jsx yönlendirmeyi yapar
    } catch (err) {
      // Hata AuthContext'te set ediliyor, burada loglamak isteğe bağlı
      console.error("Login page caught error:", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MiniTweet'e Giriş Yap
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="emailOrUsername" className="sr-only">Email veya Kullanıcı Adı</label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue focus:z-10 sm:text-sm"
                placeholder="Email veya Kullanıcı Adı"
                value={formData.emailOrUsername}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" className="w-full justify-center" loading={loading} disabled={loading}>
              Giriş Yap
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/register" className="font-medium text-twitter-blue hover:text-blue-500">
            Hesabın yok mu? Kayıt ol
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;