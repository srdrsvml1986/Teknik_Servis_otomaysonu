import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthUser extends User {
  role: 'admin' | 'authenticated';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session retrieval error:', error);
        // Clear any invalid session data
        supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        const role = session.user.app_metadata?.role || 'authenticated';
        setUser({ ...session.user, role });
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(async (error) => {
      console.error('Session retrieval error:', error);
      // Clear invalid session data
      await supabase.auth.signOut();
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          const role = session.user.app_metadata?.role || 'authenticated';
          setUser({ ...session.user, role });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, role: 'admin' | 'authenticated' = 'authenticated') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role
        }
      }
    });
    return { error };
  };

  const updateUser = async (userId: string, userData: { email?: string; password?: string; role?: 'admin' | 'authenticated' }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId,
          email: userData.email,
          password: userData.password,
          role: userData.role

        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı güncellenemedi');
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı silinemedi');
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getAllUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-all-users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcılar yüklenemedi');
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    deleteUser,
    getAllUsers,
  };
};