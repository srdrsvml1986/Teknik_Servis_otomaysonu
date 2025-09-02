import React, { useState, useEffect } from 'react';
import { Search, Clock, User, Database } from 'lucide-react';
import { auditApi } from '../services/api';
import { AuditLog } from '../types';
import { format } from 'date-fns';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

export const AuditLogs: React.FC = () => {
  const { toasts, removeToast, error: showError } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operationFilter, setOperationFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    let filtered = logs.filter(log =>
      log.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.performed_by_user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (operationFilter !== 'all') {
      filtered = filtered.filter(log => log.operation === operationFilter);
    }

    if (tableFilter !== 'all') {
      filtered = filtered.filter(log => log.table_name === tableFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, operationFilter, tableFilter]);

  const loadLogs = async () => {
    try {
      const data = await auditApi.getAll();
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      showError('Yükleme Hatası', 'Denetim kayıtları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const uniqueTables = Array.from(new Set(logs.map(log => log.table_name)));

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Denetim Kayıtları</h1>
        <p className="text-gray-600 mt-2">Tüm veritabanı işlemlerini ve kullanıcı aktivitelerini takip edin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Kayıt ID, kullanıcı e-postası veya tablo adıyla arayın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-4">
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm İşlemler</option>
            <option value="INSERT">Ekleme</option>
            <option value="UPDATE">Güncelleme</option>
            <option value="DELETE">Silme</option>
          </select>
          
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Tablolar</option>
            {uniqueTables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tablo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zaman Damgası
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detaylar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getOperationColor(log.operation)}`}>
                      {log.operation === 'INSERT' ? 'EKLEME' :
                       log.operation === 'UPDATE' ? 'GÜNCELLEME' : 'SİLME'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{log.table_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {log.record_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {log.performed_by_user?.email || 'Sistem'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(log.performed_at), 'dd MMM yyyy HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Denetim Kaydı Detayları</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">İşlem Bilgileri</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">İşlem:</span> {selectedLog.operation === 'INSERT' ? 'Ekleme' : selectedLog.operation === 'UPDATE' ? 'Güncelleme' : 'Silme'}</div>
                  <div><span className="font-medium">Tablo:</span> {selectedLog.table_name}</div>
                  <div><span className="font-medium">Kayıt ID:</span> {selectedLog.record_id}</div>
                  <div><span className="font-medium">Kullanıcı:</span> {selectedLog.performed_by_user?.email || 'Sistem'}</div>
                  <div><span className="font-medium">Zaman:</span> {format(new Date(selectedLog.performed_at), 'dd MMM yyyy HH:mm:ss')}</div>
                </div>
              </div>
            </div>

            {selectedLog.old_data && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Eski Veri</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_data && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Yeni Veri</h4>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};