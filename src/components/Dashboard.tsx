import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Clock,
  Package,
  MapPin,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { customerApi, serviceApi } from '../services/api';
import { Customer, ServiceRecord } from '../types';
import { formatDate } from '../utils/dateUtils';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalServices: 0,
    pendingServices: 0,
    completedToday: 0,
  });
  const [recentServices, setRecentServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [customers, services] = await Promise.all([
        customerApi.getAll(),
        serviceApi.getAll(),
      ]);

      const today = new Date().toDateString();
      const completedToday = services.filter(
        s => s.status === 'completed' && 
        new Date(s.updated_at).toDateString() === today
      ).length;

      setStats({
        totalCustomers: customers.length,
        totalServices: services.length,
        pendingServices: services.filter(s => s.status === 'pending').length,
        completedToday,
      });

      setRecentServices(services.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Hoş geldiniz, {user?.email}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Teknik servis operasyonlarınızın genel görünümü
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Toplam Müşteri</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Toplam Servis</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalServices}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Bekleyen Servisler</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingServices}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Bugün Tamamlanan</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Son Servis Kayıtları</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentServices.length > 0 ? (
            recentServices.map((service) => (
              <div key={service.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">{service.product_name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">#{service.tracking_number}</p>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                    {service.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{service.customer?.first_name} {service.customer?.last_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{service.service_center}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(service.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">Henüz servis kaydı yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};