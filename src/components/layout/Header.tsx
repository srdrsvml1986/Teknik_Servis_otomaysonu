import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings
} from 'lucide-react';
import Navigation from './Navigation.tsx';

export default function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Teknik Servis
              </span>
              <span className="text-xl font-bold text-gray-900 sm:hidden">
                Servis
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && location.pathname !== '/' && (
            <Navigation />
          )}

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Panel Button */}
            {(location.pathname == '/') && (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Yönetim Paneli</span>
              </Link>
            )}

            {user ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm font-medium">
                     
                    </span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        {user.email}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none ${
                    location.pathname === '/' ? 'hidden' : ''
                  }`}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {user && isMobileMenuOpen && location.pathname !== '/' && (
          <Navigation isMobile onItemClick={() => setIsMobileMenuOpen(false)} />
        )}
      </div>
    </nav>
  )
}
