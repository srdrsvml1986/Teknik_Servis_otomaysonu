/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface AuthUser extends User {
  role: 'admin' | 'authenticated';
  profile?: UserProfile | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        if (import.meta.env.DEV) {
          console.error('Session retrieval error:', error);
        }
        // Clear any invalid session data
        supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        const role = session.user.app_metadata?.role || 'authenticated';
        const profile = await fetchUserProfile(session.user.id);
        setUser({ ...session.user, role, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(async (error) => {
      if (import.meta.env.DEV) {
        console.error('Session retrieval error:', error);
      }
      // Clear invalid session data
      await supabase.auth.signOut();
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('Auth state change:', event, session?.user?.id);
        }
        
        if (event === 'TOKEN_REFRESHED') {
          if (import.meta.env.DEV) console.log('Token refreshed successfully');
          return; // Don't process token refresh as a full auth change
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('Auth: User signed out');
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const role = session.user.app_metadata?.role || 'authenticated';
            
            // Profile fetch'i kısa timeout ile sınırla
            const profilePromise = fetchUserProfile(session.user.id);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
            );
            
            const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null;
            setUser({ ...session.user, role, profile });
          } catch {
            // Profile yüklenemezse null profile ile devam et
            setUser({ ...session.user, role: 'authenticated', profile: null });
          } finally {
            setLoading(false);
          }
        } else if (!session?.user) {
          console.log('Auth: No user in session');
          setUser(null);
          setLoading(false);
        }
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

  const getUserById = async (userId: string) => {
    try {
      const { data: allUsers, error } = await getAllUsers();
      
      if (error) {
        return { data: null, error };
      }
      
      const user = allUsers?.find((u: any) => u.id === userId);
      
      if (!user) {
        return { data: null, error: new Error('Kullanıcı bulunamadı') };
      }
      
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    user,
    loading,
    getUserById,
    signIn,
    signUp,
    signOut,
    updateUser,
    deleteUser,
    getAllUsers,
  };
};