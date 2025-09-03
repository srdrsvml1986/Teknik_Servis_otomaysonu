// Navigation component for the application
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  Wrench,
  User,
  FileText,
  Shield
} from 'lucide-react';

interface NavigationProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const navigationItems = [
  { name: 'Yönetim Paneli', href: '/dashboard', icon: Home },
  { name: 'Müşteriler', href: '/customers', icon: Users },
  { name: 'Servisler', href: '/services', icon: Wrench },
  { name: 'Kullanıcılar', href: '/users', icon: User },
  { name: 'Raporlar', href: '/reports', icon: FileText },
  { name: 'Audit Logs', href: '/audit', icon: Shield },
];

export default function Navigation({ isMobile = false, onItemClick }: NavigationProps) {
  const location = useLocation();

  if (isMobile) {
    return (
      <div className="md:hidden border-t border-gray-200 py-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={onItemClick}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-8">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === item.href
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
