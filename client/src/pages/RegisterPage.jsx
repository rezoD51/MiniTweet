import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthActions, useAuthState } from '../context/AuthContext';
import Button from '../components/ui/Button';

function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { register, clearError } = useAuthActions();
  const { error, loading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const [clientError, setClientError] = useState('');


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
     return () => {
      if(error) clearError(); // Context'teki hatayı temizle
      if(clientError) setClientError(''); // Client'taki hatayı temizle
    }
  }, [isAuthenticated, navigate, error, clientError, clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (clientError) setClientError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setClientError('Şifreler eşleşmiyor.');
      return;
    }
    if (formData.password.length < 6) {
        setClientError('Şifre en az 6 karakter olmalıdır.');
        return;
    }
    setClientError('');
    
    try {
      await register({ username: formData.username, email: formData.email, password: formData.password });
    } catch (err) {
      console.error("Register page caught error:", err.message);
      // Hata AuthContext'te set edilecek, ama clientError'u da kullanabiliriz
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MiniTweet'e Kayıt Ol
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || clientError) && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error || clientError}</div>}
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">Kullanıcı Adı</label>
              <input
                id="username" name="username" type="text" required minLength="3"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue sm:text-sm"
                placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="email" className="sr-only">Email adresi</label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue sm:text-sm"
                placeholder="Email adresi" value={formData.email} onChange={handleChange}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password" name="password" type="password" required minLength="6"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue sm:text-sm"
                placeholder="Şifre (en az 6 karakter)" value={formData.password} onChange={handleChange}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="confirmPassword" className="sr-only">Şifreyi Onayla</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password" required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue sm:text-sm"
                placeholder="Şifreyi Onayla" value={formData.confirmPassword} onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Button type="submit" variant="primary" className="w-full justify-center" loading={loading} disabled={loading}>
              Kayıt Ol
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-twitter-blue hover:text-blue-500">
            Zaten hesabın var mı? Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;