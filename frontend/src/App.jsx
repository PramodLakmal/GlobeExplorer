import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CountryDetailPage from './pages/CountryDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';

function App() {
  const { loading } = useAuth();

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/country/:code" element={<CountryDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
      </div>
  );
}

export default App;
