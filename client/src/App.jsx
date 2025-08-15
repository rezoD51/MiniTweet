import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import Navbar from './components/layout/Navbar'; // Navbar'ı layout klasörüne taşıdım
import NotFoundPage from './pages/NotFoundPage';
import Spinner from './components/ui/Spinner'; // Spinner bileşeni

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthState();
  console.log("ProtectedRoute - Durum:", { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; // Çocuk Rotaları render etmek için Outlet kullanılır
}

// Giriş yapmış kullanıcıların login ve register sayfalarına gitmesini engelle
function GuestRoute() {
  const { isAuthenticated, loading } = useAuthState();
  console.log("GuestRoute - Durum:", { isAuthenticated, loading });
   if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}


function AppLayout() {
  // Bu bileşen Navbar ve ana içerik alanını kapsar
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-2 sm:px-4 py-4 mt-16"> {/* Navbar yüksekliği için margin */}
        <Outlet /> {/* Sayfa içeriği burada render edilecek */}
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Misafir Rotaları (Login, Register) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Korumalı Rotalar (Anasayfa, Profil, vb.) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}> {/* Korumalı rotalar için Navbar'ı içeren layout */}
            <Route path="/" element={<HomePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Route>
        
        {/* Navbar'sız rotalar için (örneğin 404) veya farklı layout'lar */}
         <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;