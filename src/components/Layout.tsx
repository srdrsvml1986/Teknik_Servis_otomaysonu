import React from 'react';
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Settings, 
  Users, 
  ClipboardList, 
  FileText, 
  LogOut, 
  User,
  Search,
  Home,
  UserCog
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <Settings className="h-8 w-8 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">Saysan İnşaat</span>                   
                  </div>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4 inline mr-2" />
                  Servis Takibi
                </Link>
                
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Yönetim Paneli</span>
                  </Link>
                 
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-6 w-6 text-blue-400" />
                  <span className="text-lg font-bold">Saysan İnşaat Ve Hırdavat</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Profesyonel teknik servis hizmetleri
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">İletişim</h3>
                <div className="space-y-2">
                  <a 
                    href="tel:05323491850" 
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span>📞</span>
                    <span>0532 349 18 50</span>
                  </a>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span>📍</span>
                    <span>Osmaniye İli Sanayi Sitesi</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Hizmetler</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Teknik Servis</li>
                  <li>Müşteri Takibi</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2025 Saysan İnşaat Ve Hırdavat. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Saysan İnşaat</span>
              </Link>
              
              {/* Dashboard Navigation - Only show when user is logged in and not on home page */}
              {user && location.pathname !== '/' && (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/customers"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/customers') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Müşteriler
                  </Link>
                  <Link
                    to="/services"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/services') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4 inline mr-2" />
                    Servis Kayıtları
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/users"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/users') 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <UserCog className="h-4 w-4 inline mr-2" />
                        Kullanıcılar
                      </Link>
                      <Link
                        to="/reports"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/reports') 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <FileText className="h-4 w-4 inline mr-2" />
                        Raporlar
                      </Link>
                      <Link
                        to="/audit"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive('/audit') 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Search className="h-4 w-4 inline mr-2" />
                        Denetim Kayıtları
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user && isActive('/') && (
                <Link
                  to="/dashboard"
                 className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                 <Settings className="h-4 w-4" />
                 <span>Yönetim Paneli</span>
                </Link>
              )}
              
           
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  onBlur={() => setTimeout(() => setShowProfileDropdown(false), 150)}
                >
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Profilim
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">Saysan İnşaat Ve Hırdavat</span>
              </div>
              <p className="text-gray-300 text-sm">
                Profesyonel teknik servis hizmetleri
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <div className="space-y-2">
                <a 
                  href="tel:05323491850" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>📞</span>
                  <span>0532 349 18 50</span>
                </a>
                <div className="flex items-center space-x-2 text-gray-300">
                  <span>📍</span>
                  <span>Osmaniye İli Sanayi Sitesi</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Hizmetler</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Teknik Servis</li>
                <li>Müşteri Takibi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Saysan İnşaat Ve Hırdavat. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};