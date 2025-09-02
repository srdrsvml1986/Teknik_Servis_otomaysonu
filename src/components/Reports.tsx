import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Download,
  Calendar
} from 'lucide-react';
import { serviceApi, customerApi } from '../services/api';
import { ServiceRecord, Customer } from '../types';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import * as XLSX from 'xlsx';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

export const Reports: React.FC = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, customersData] = await Promise.all([
        serviceApi.getAll(),
        customerApi.getAll(),
      ]);
      setServices(servicesData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Yükleme Hatası', 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const serviceDate = new Date(service.created_at);
    const startDate = startOfDay(new Date(dateRange.start));
    const endDate = endOfDay(new Date(dateRange.end));
    return serviceDate >= startDate && serviceDate <= endDate;
  });

  const statusStats = {
    pending: filteredServices.filter(s => s.status === 'pending').length,
    in_progress: filteredServices.filter(s => s.status === 'in_progress').length,
    completed: filteredServices.filter(s => s.status === 'completed').length,
    cancelled: filteredServices.filter(s => s.status === 'cancelled').length,
  };

  const serviceCenterStats = filteredServices.reduce((acc, service) => {
    acc[service.service_center] = (acc[service.service_center] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const staffPerformance = filteredServices.reduce((acc, service) => {    
    const userId = service.created_by;
    const userKey = `User ${userId.substring(0, 8)}`;
    if (!acc[userName]) {
      acc[userKey] = { total: 0, completed: 0 };
    }
    acc[userKey].total++;
    if (service.status === 'completed') {
      acc[userKey].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const exportReport = () => {
    // Summary Report
    const summaryData = [
      { Metric: 'Total Services', Value: filteredServices.length },
      { Metric: 'Pending Services', Value: statusStats.pending },
      { Metric: 'In Progress Services', Value: statusStats.in_progress },
      { Metric: 'Completed Services', Value: statusStats.completed },
      { Metric: 'Cancelled Services', Value: statusStats.cancelled },
      { Metric: 'Total Customers', Value: customers.length },
    ];

    // Service Center Report
    const serviceCenterData = Object.entries(serviceCenterStats).map(([center, count]) => ({
      'Service Center': center,
      'Total Services': count,
      'Percentage': `${((count / filteredServices.length) * 100).toFixed(1)}%`,
    }));

    // Staff Performance Report
    const staffData = Object.entries(staffPerformance).map(([userName, stats]) => ({
      'Staff Member': userName,
      'Total Services': stats.total,
      'Completed Services': stats.completed,
      'Completion Rate': `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
    }));

    // Detailed Services Report
    const servicesData = filteredServices.map(service => ({
      'Tracking Number': service.tracking_number,
      'Customer': `${service.customer?.first_name} ${service.customer?.last_name}`,
      'Product Name': service.product_name,
      'Serial Number': service.product_serial,
      'Service Center': service.service_center,
      'Status': service.status,
      'Created At': formatDateTime(service.created_at),
      'Updated At': formatDateTime(service.updated_at),
      'Description': service.description || '',
    }));

    const workbook = XLSX.utils.book_new();
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const serviceCenterSheet = XLSX.utils.json_to_sheet(serviceCenterData);
    const staffSheet = XLSX.utils.json_to_sheet(staffData);
    const servicesSheet = XLSX.utils.json_to_sheet(servicesData);
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, serviceCenterSheet, 'Service Centers');
    XLSX.utils.book_append_sheet(workbook, staffSheet, 'Staff Performance');
    XLSX.utils.book_append_sheet(workbook, servicesSheet, 'Detailed Services');
    
    XLSX.writeFile(workbook, `service-report-${dateRange.start}-to-${dateRange.end}.xlsx`);
    success('Rapor Dışa Aktarıldı', 'Excel raporu başarıyla indirildi');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raporlar ve Analitik</h1>
          <p className="text-gray-600 mt-2">Servis performansını ve personel verimliliğini analiz edin</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Rapor Dışa Aktar</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-700">Tarih Aralığı:</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Servis</p>
              <p className="text-2xl font-bold text-gray-900">{filteredServices.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlanma Oranı</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredServices.length > 0 
                  ? `${((statusStats.completed / filteredServices.length) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Müşteriler</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ort. Çözüm Süresi</p>
              <p className="text-2xl font-bold text-gray-900">2.5 gün</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Servis Durum Dağılımı</h3>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'in_progress' ? 'bg-yellow-500' :
                    status === 'pending' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status === 'pending' ? 'Beklemede' :
                     status === 'in_progress' ? 'İşlemde' :
                     status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({filteredServices.length > 0 ? ((count / filteredServices.length) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Centers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Servis Merkezi Performansı</h3>
          <div className="space-y-3">
            {Object.entries(serviceCenterStats)
              .sort(([,a], [,b]) => b - a)
              .map(([center, count]) => (
              <div key={center} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{center}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({filteredServices.length > 0 ? ((count / filteredServices.length) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personel Performansı</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Servis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamamlanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamamlanma Oranı
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(staffPerformance)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([userKey, stats]) => (
                <tr key={userKey}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Kullanıcı {userKey.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.completed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {((stats.completed / stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};