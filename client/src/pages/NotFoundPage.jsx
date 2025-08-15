import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <AlertTriangle size={64} className="text-yellow-500 mb-6" />
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Sayfa Bulunamadı</p>
      <p className="text-lg text-gray-500 mb-8">
        Aradığınız sayfa mevcut değil, taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-twitter-blue text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition-colors duration-150"
      >
        Anasayfaya Dön
      </Link>
    </div>
  );
}

export default NotFoundPage;