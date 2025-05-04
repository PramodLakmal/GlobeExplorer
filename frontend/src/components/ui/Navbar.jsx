import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug effect to log user state
  useEffect(() => {
    console.log('Navbar - Auth state:', { 
      user, 
      isAuthenticated: !!user,
      hasToken: !!localStorage.getItem('token') 
    });
  }, [user]);

  // Track scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-900 shadow-lg py-2'
          : 'bg-transparent backdrop-blur-sm py-4'
      }`}
    >
      <div className="container-main">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              scrolled 
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white'
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 transition-transform duration-500 group-hover:rotate-45"
              >
                <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
              </svg>
            </div>
            <h1 className={`text-2xl font-extrabold transition-colors duration-300 ${
              scrolled 
                ? 'text-gray-800 dark:text-white' 
                : 'text-white'
            }`}>
              <span className="text-blue-600">Globe</span>Explorer
            </h1>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" scrolled={scrolled}>Home</NavLink>
            <NavLink to="/explore" scrolled={scrolled}>Explore</NavLink>
            
            {user ? (
              <>
                <NavLink to="/favorites" scrolled={scrolled}>Favorites</NavLink>
                <div className="relative group">
                  <button 
                    className={`flex items-center space-x-1 font-medium transition-colors duration-300 ${
                      scrolled 
                        ? 'text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <span>
                      {user && user.name ? user.name.split(' ')[0] : 'User'}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user && user.email ? user.email : 'No email'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" scrolled={scrolled}>Login</NavLink>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden transition-colors duration-300 ${
              scrolled 
                ? 'text-gray-800 dark:text-white' 
                : 'text-white'
            } focus:outline-none`}
            aria-label="Toggle Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden fixed inset-x-0 top-[60px] bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 space-y-3">
            <MobileNavLink to="/" toggle={toggleMenu}>Home</MobileNavLink>
            <MobileNavLink to="/explore" toggle={toggleMenu}>Explore</MobileNavLink>
            {user ? (
              <>
                <MobileNavLink to="/favorites" toggle={toggleMenu}>Favorites</MobileNavLink>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                  <div className="px-2 py-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user && user.email ? user.email : 'No email'}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="w-full flex items-center space-x-2 text-left px-2 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" toggle={toggleMenu}>Login</MobileNavLink>
                <Link
                  to="/register"
                  onClick={toggleMenu}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-center text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Desktop navigation link component
const NavLink = ({ to, children, scrolled }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`relative font-medium transition-colors duration-300 ${
        scrolled
          ? 'text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400'
          : 'text-white/90 hover:text-white'
      }`}
    >
      {children}
      <span 
        className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 ${
          isActive ? 'w-full' : 'group-hover:w-full'
        }`}
      />
    </Link>
  );
};

// Mobile navigation link component
const MobileNavLink = ({ to, children, toggle }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={toggle}
      className={`block px-2 py-2 font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar; 