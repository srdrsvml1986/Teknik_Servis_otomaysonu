import React, { useState } from 'react';
import { Search, Package, MapPin, Clock, FileText, X, Activity } from 'lucide-react';
import { serviceApi } from '../services/api';
import { ServiceRecord, ServiceQuery, ServiceUpdate } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

export const CustomerPortal: React.FC = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [query, setQuery] = useState<ServiceQuery>({});
  const [results, setResults] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [queryType, setQueryType] = useState<'personal' | 'tracking'>('personal');
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [serviceUpdates, setServiceUpdates] = useState<ServiceUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const handleSearch = async () => {
    if (queryType === 'personal' && (!query.first_name || !query.last_name || !query.phone)) {
      showError('Eksik Bilgi', 'Lütfen tüm kişisel bilgi alanlarını doldurun');
      return;
    }
    if (queryType === 'tracking' && !query.tracking_number) {
      showError('Eksik Bilgi', 'Lütfen takip numarasını girin');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await serviceApi.queryByCustomerInfo(query);
      setResults(data);
      if (data.length === 0) {
        showError('Sonuç Bulunamadı', 'Arama kriterlerinizle eşleşen servis kaydı bulunamadı');
      } else {
        success('Arama Tamamlandı', `${data.length} servis kaydı bulundu`);
      }
    } catch (error) {
      console.error('Search error:', error);
      showError('Arama Hatası', 'Servis kayıtları aranırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = async (service: ServiceRecord) => {
    setSelectedService(service);
    setLoadingUpdates(true);
    try {
      const updates = await serviceApi.getUpdates(service.id);
      setServiceUpdates(updates);
    } catch (error) {
      console.error('Error loading service updates:', error);
      showError('Yükleme Hatası', 'Servis detayları yüklenirken hata oluştu');
    } finally {
      setLoadingUpdates(false);
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

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Servis Durumunuzu Takip Edin
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Donanım servis talebinizin güncel durumunu kontrol etmek için aşağıdaki bilgileri girin
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setQueryType('personal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                queryType === 'personal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kişisel Bilgilerle Ara
            </button>
            <button
              onClick={() => setQueryType('tracking')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                queryType === 'tracking'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Takip Numarasıyla Ara
            </button>
          </div>

          {queryType === 'personal' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <input
                  type="text"
                  value={query.first_name || ''}
                  onChange={(e) => setQuery({ ...query, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınızı girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                <input
                  type="text"
                  value={query.last_name || ''}
                  onChange={(e) => setQuery({ ...query, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Soyadınızı girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  value={query.phone || ''}
                  onChange={(e) => setQuery({ ...query, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Telefon numaranızı girin"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Takip Numarası
              </label>
              <input
                type="text"
                value={query.tracking_number || ''}
                onChange={(e) => setQuery({ ...query, tracking_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Takip numarasını girin (örn: TS20250103-1234)"
              />
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>{loading ? 'Aranıyor...' : 'Servis Kayıtlarını Ara'}</span>
          </button>
        </div>

        {results?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Bulunan Servis Kayıtları</h2>
            {results.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {record.product_name}
                    </h3>
                    <p className="text-gray-600">Seri: {record.product_serial}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                    {record.status === 'pending' ? 'BEKLEMEDE' :
                     record.status === 'in_progress' ? 'İŞLEMDE' :
                     record.status === 'completed' ? 'TAMAMLANDI' : 'İPTAL EDİLDİ'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Package className="h-4 w-4" />
                    <button
                      onClick={() => handleServiceClick(record)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      #{record.tracking_number}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{record.service_center}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Oluşturulma: {formatDate(record.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Güncelleme: {formatDate(record.updated_at)}
                    </span>
                  </div>
                </div>

                {record.description && (
                  <div className="border-t pt-4">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Servis Açıklaması</p>
                        <p className="text-gray-600">{record.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {hasSearched && results?.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Servis Kaydı Bulunamadı</h3>
            <p className="text-gray-600">
              Arama kriterlerinizle eşleşen herhangi bir servis kaydı bulamadık. 
              Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.
            </p>
          </div>
        )}

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Servis Detayları - #{selectedService.tracking_number}
                </h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Service Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ürün Bilgileri</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Ürün:</span> {selectedService.product_name}</div>
                      <div><span className="font-medium">Seri:</span> {selectedService.product_serial}</div>
                      <div><span className="font-medium">Servis Merkezi:</span> {selectedService.service_center}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Güncel Durum</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedService.status)}`}>
                      {selectedService.status === 'pending' ? 'BEKLEMEDE' :
                       selectedService.status === 'in_progress' ? 'İŞLEMDE' :
                       selectedService.status === 'completed' ? 'TAMAMLANDI' : 'İPTAL EDİLDİ'}
                    </span>
                    {selectedService.description && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">{selectedService.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Servis Zaman Çizelgesi</span>
                </h4>
                
                {loadingUpdates ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceUpdates && serviceUpdates?.length > 0 ? (
                      serviceUpdates.map((update, index) => (
                        <div key={update.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            </div>
                            {index < (serviceUpdates?.length || 0) - 1 && (
                              <div className="w-0.5 h-6 bg-gray-200 mx-auto mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{update.action}</p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(update.performed_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Servis güncellemesi bulunmuyor</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};