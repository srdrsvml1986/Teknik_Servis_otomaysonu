/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Customer {
  id: string;
  first_name: string; // Ad
  last_name: string; // Soyad
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  tracking_number: string; // Takip Numarası
  customer_id: string; // Müşteri ID
  created_by: string; // Oluşturan
  product_name: string; // Ürün Adı
  product_serial: string; // Seri Numarası
  service_center: string; // Servis Merkezi
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description?: string; // Açıklama
  created_at: string;
  updated_at: string;
  customer?: Customer;
  created_by_user?: { email: string };
}

export interface ServiceUpdate {
  id: string;
  service_id: string; // Servis ID
  action: string; // İşlem
  performed_by: string; // Gerçekleştiren
  performed_at: string;
  performed_by_user?: { email: string };
}

export interface AuditLog {
  id: string;
  table_name: string; // Tablo Adı
  record_id: string; // Kayıt ID
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  performed_by: string; // Gerçekleştiren
  performed_at: string;
  old_data?: any;
  new_data?: any;
  performed_by_user?: { email: string };
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    role?: 'admin' | 'authenticated'; // Rol
  };
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceQuery {
  first_name?: string; // Ad
  last_name?: string; // Soyad
  phone?: string;
  tracking_number?: string; // Takip Numarası
}