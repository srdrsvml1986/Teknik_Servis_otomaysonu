import React from 'react';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <Settings className="h-8 w-8 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">Saysan İnşaat</span>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <a href="tel:05323491850" className="hover:text-blue-600 transition-colors">
                        0532 349 18 50
                      </a>
                      <span>Osmaniye İli Sanayi Sitesi</span>
                    </div>
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
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Personel Girişi
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Saysan İnşaat</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4 inline mr-2" />
                  Yönetim Paneli
                </Link>   
         
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto">
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