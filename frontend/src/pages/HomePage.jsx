import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
// Import the React logo as a fallback
import reactLogo from '../assets/react.svg';

const HomePage = () => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  // Debug effect to check auth state
  useEffect(() => {
    console.log('HomePage - Auth state:', { user });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 dark:opacity-80"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2080')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900"></div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container-main relative z-10 py-24 md:py-32">
          <div className="flex flex-col items-center justify-center">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white leading-tight">
                Discover Our World's
                <span className="block text-blue-200">Incredible Diversity</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
                Explore countries, cultures, and data from around the globe through our interactive platform.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/explore"
                  className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
                >
                  <span>Start Exploring</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                    <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                  </svg>
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center bg-blue-700 text-white hover:bg-blue-800 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1"
                  >
                    <span>Sign Up Free</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="195+" label="Countries" icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 011 1v12a1 1 0 01-1 1H6a3 3 0 01-3-3V6zm3-2a1 1 0 00-1 1v10a1 1 0 001 1h9V4H6z" clipRule="evenodd" />
            </svg>
          } />
          <StatCard value="7+" label="Continents" icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          } />
          <StatCard value="7,000+" label="Languages" icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          } />
          <StatCard value="8B+" label="Population" icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          } />
        </div>
      </div>

      {/* Features Section */}
      <div className="container-main py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Discover the World Like Never Before
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-lg">
            Our platform offers an immersive experience to explore countries and their unique characteristics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            }
            title="Explore Countries"
            description="Browse through detailed information about countries from all continents, including population, capital, languages, and more."
          />

          {/* Feature 2 */}
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            }
            title="Advanced Filtering"
            description="Filter countries by region, language, or search by name to find exactly what you're looking for quickly and efficiently."
          />

          {/* Feature 3 */}
          <FeatureCard 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
            title="Favorites Collection"
            description="Create an account to save your favorite countries and build a personalized collection for quick access to the information you care about."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 mt-12">
        <div className="container-main">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Explore the World?
                </h2>
                <p className="text-blue-100 mb-0 max-w-lg">
                  Start your journey today and discover amazing facts about countries around the globe.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Explore Countries
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center bg-blue-700 text-white hover:bg-blue-800 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ value, label, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors duration-300">
        {icon}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-2">
      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

export default HomePage; 