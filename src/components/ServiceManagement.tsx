import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  MapPin
} from 'lucide-react';
import { serviceApi, customerApi } from '../services/api';
import { ServiceRecord, Customer } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

export const ServiceManagement: React.FC = () => {
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<{
    customer_id: string;
    product_name: string;
    product_serial: string;
    service_center: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    description: string;
  }>({
    customer_id: '',
    product_name: '',
    product_serial: '',
    service_center: '',
    status: 'pending',
    description: '',
  });
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [customers, customerSearchTerm]);

  useEffect(() => {
    let filtered = services.filter(service =>
      service.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.product_serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.customer && 
        `${service.customer.first_name} ${service.customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === statusFilter);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, statusFilter]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        const oldStatus = editingService.status;
        await serviceApi.update(editingService.id, formData);
        
        if (oldStatus !== formData.status) {
          await serviceApi.addUpdate(
            editingService.id,
            `Durum "${getStatusText(oldStatus)}" durumundan "${getStatusText(formData.status)}" durumuna değiştirildi`,
            user!.id
          );
        }
        success('Servis Güncellendi', 'Servis kaydı başarıyla güncellendi');
      } else {
        const newService = await serviceApi.create({
          ...formData,
          created_by: user!.id,
        });
        
        await serviceApi.addUpdate(
          newService.id,
          'Servis kaydı oluşturuldu',
          user!.id
        );
        success('Servis Oluşturuldu', 'Yeni servis kaydı başarıyla oluşturuldu');
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      showError('Kaydetme Hatası', 'Servis kaydı kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu servis kaydını silmek istediğinizden emin misiniz?')) return;
    
    try {
      await serviceApi.delete(id);
      await loadData();
      success('Servis Silindi', 'Servis kaydı başarıyla silindi');
    } catch (error) {
      console.error('Error deleting service:', error);
      showError('Silme Hatası', 'Servis kaydı silinirken hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      product_name: '',
      product_serial: '',
      service_center: '',
      status: 'pending',
      description: '',
    });
    setCustomerSearchTerm('');
    setIsCustomerDropdownOpen(false);
    setEditingService(null);
    setShowModal(false);
  };

  const handleEdit = (service: ServiceRecord) => {
    setFormData({
      customer_id: service.customer_id,
      product_name: service.product_name,
      product_serial: service.product_serial,
      service_center: service.service_center,
      status: service.status,
      description: service.description || '',
    });
    const selectedCustomer = customers.find(c => c.id === service.customer_id);
    if (selectedCustomer) {
      setCustomerSearchTerm(`${selectedCustomer.first_name} ${selectedCustomer.last_name}`);
    }
    setEditingService(service);
    setShowModal(true);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'in_progress': return 'İşlemde';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
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

  if (loading && services.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Servis Yönetimi</h1>
            <p className="text-gray-600 mt-2">Servis kayıtlarını yönetin ve ilerlemeyi takip edin</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Servis Kaydı</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Takip numarası, ürün, seri veya müşteri adıyla arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="in_progress">İşlemde</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servis Detayları
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{service.tracking_number}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {service.service_center}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.customer?.first_name} {service.customer?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{service.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{service.product_name}</div>
                      <div className="text-sm text-gray-500">Seri: {service.product_serial}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                        {service.status === 'pending' ? 'BEKLEMEDE' :
                         service.status === 'in_progress' ? 'İŞLEMDE' :
                         service.status === 'completed' ? 'TAMAMLANDI' : 'İPTAL EDİLDİ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(service.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingService ? 'Servis Kaydını Düzenle' : 'Yeni Servis Kaydı'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Müşteri *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={!formData.customer_id}
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setIsCustomerDropdownOpen(true);
                        if (!e.target.value) {
                          setFormData({ ...formData, customer_id: '' });
                        }
                      }}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Müşteri adı veya telefon ile arayın..."
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  
                  {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setFormData({ ...formData, customer_id: customer.id });
                            setCustomerSearchTerm(`${customer.first_name} ${customer.last_name}`);
                            setIsCustomerDropdownOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isCustomerDropdownOpen && filteredCustomers.length === 0 && customerSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                      <div className="text-gray-500 text-sm">Müşteri bulunamadı</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ürün Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="örn: Laptop Model XYZ"
                    />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seri Numarası *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_serial}
                    onChange={(e) => setFormData({ ...formData, product_serial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: SN123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servis Merkezi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.service_center}
                    onChange={(e) => setFormData({ ...formData, service_center: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="örn: Merkez Servis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'cancelled' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="in_progress">İşlemde</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Servis talebini veya sorunu açıklayın..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : editingService ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};