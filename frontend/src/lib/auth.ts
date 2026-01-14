import { writable, derived } from 'svelte/store';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// Auth store
function createAuthStore() {
  const { subscribe, set, update } = writable<{
    user: User | null;
    session: Session | null;
    loading: boolean;
  }>({
    user: null,
    session: null,
    loading: true
  });

  return {
    subscribe,
    set,
    
    // Initialize auth state
    async initialize() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        set({
          user: session?.user ?? null,
          session: session,
          loading: false
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          set({
            user: session?.user ?? null,
            session: session,
            loading: false
          });
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({ user: null, session: null, loading: false });
      }
    },

    // Sign in with email/password
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    },

    // Sign out
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  };
}

export const auth = createAuthStore();

// Derived store for checking if user is logged in
export const isLoggedIn = derived(auth, $auth => !!$auth.user);

// Derived store for checking if still loading
export const isAuthLoading = derived(auth, $auth => $auth.loading);
