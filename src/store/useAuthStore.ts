import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  userId: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  stadtname: string;

  signIn: (stadtname: string, password: string) => Promise<void>;
  signOut: () => void;
  initialize: () => void;
  clearError: () => void;
}

const SESSION_KEY = 'dividata_session';

interface StoredSession {
  userId: string;
  stadtname: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  stadtname: '',

  initialize: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session: StoredSession = JSON.parse(stored);
        set({
          userId: session.userId,
          stadtname: session.stadtname,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  signIn: async (stadtname, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.rpc('verify_login', {
        input_stadtname: stadtname,
        input_password: password,
      });

      if (error) {
        set({ loading: false, error: 'Anmeldefehler. Bitte versuchen Sie es erneut.' });
        return;
      }

      if (data?.success) {
        const session: StoredSession = { userId: data.user_id, stadtname: data.stadtname };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        set({
          userId: data.user_id,
          stadtname: data.stadtname,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false, error: 'Ungültige Anmeldedaten. Bitte überprüfen Sie Stadtname und Passwort.' });
      }
    } catch {
      set({ loading: false, error: 'Anmeldefehler. Bitte versuchen Sie es erneut.' });
    }
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
    set({
      userId: null,
      isAuthenticated: false,
      stadtname: '',
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
