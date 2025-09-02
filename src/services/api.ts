import { supabase } from '../lib/supabase';
import { Customer, ServiceRecord, ServiceQuery, AuditLog, User } from '../types';

export const customerApi = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async importFromExcel(customers: Omit<Customer, 'id' | 'created_at' | 'updated_at'>[]): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customers)
      .select();
    
    if (error) throw error;
    return data || [];
  },
};

export const serviceApi = {
  async getAll(): Promise<ServiceRecord[]> {
    const { data, error } = await supabase
      .from('service_records')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(record: Omit<ServiceRecord, 'id' | 'tracking_number' | 'created_at' | 'updated_at'>): Promise<ServiceRecord> {
    const { data, error } = await supabase
      .from('service_records')
      .insert(record)
      .select(`
        *,
        customer:customers(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, record: Partial<ServiceRecord>): Promise<ServiceRecord> {
    const { data, error } = await supabase
      .from('service_records')
      .update(record)
      .eq('id', id)
      .select(`
        *,
        customer:customers(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async queryByCustomerInfo(query: ServiceQuery): Promise<ServiceRecord[]> {
    let queryBuilder = supabase
      .from('service_records')
      .select(`
        *,
        customer:customers(*)
      `);

    // Eğer takip numarası varsa, direkt takip numarasına göre ara
    if (query.tracking_number) {
      queryBuilder = queryBuilder.eq('tracking_number', query.tracking_number);
    } else if (query.first_name && query.last_name && query.phone) {
      // Müşteri bilgilerine göre ara
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('first_name', query.first_name)
        .eq('last_name', query.last_name)
        .eq('phone', query.phone);

      if (customerError) throw customerError;
      
      if (!customers || customers.length === 0) {
        return [];
      }

      const customerIds = customers.map(c => c.id);
      queryBuilder = queryBuilder.in('customer_id', customerIds);
    } else {
      return [];
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getUpdates(serviceId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('service_updates')
      .select('*')
      .eq('service_id', serviceId)
      .order('performed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addUpdate(serviceId: string, action: string, performedBy: string): Promise<void> {
    const { error } = await supabase
      .from('service_updates')
      .insert({
        service_id: serviceId,
        action,
        performed_by: performedBy
      });
    
    if (error) throw error;
  }
};

export const auditApi = {
  async getAll(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *
      `)
      .order('performed_at', { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    return data || [];
  },
};

