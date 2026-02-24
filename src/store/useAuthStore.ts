import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  stadtname: string;

  signUp: (stadtname: string, password: string) => Promise<void>;
  signIn: (stadtname: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

function toSyntheticEmail(stadtname: string): string {
  const slug = stadtname
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9-]/g, '');
  return `${slug}@dividata.local`;
}

function getDisplayName(user: User): string {
  return user.user_metadata?.stadtname || user.email?.split('@')[0] || '';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  stadtname: '',

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          stadtname: getDisplayName(session.user),
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            user: session.user,
            session,
            isAuthenticated: true,
            stadtname: getDisplayName(session.user),
          });
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            stadtname: '',
          });
        }
      });
    } catch {
      set({ loading: false });
    }
  },

  signUp: async (stadtname, password) => {
    set({ loading: true, error: null });
    const email = toSyntheticEmail(stadtname);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { stadtname } },
    });
    if (error) {
      let msg = error.message;
      if (msg.includes('already registered')) {
        msg = 'Dieser Stadtname ist bereits registriert.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
      }
      set({ loading: false, error: msg });
      return;
    }
    if (data.user) {
      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        stadtname: getDisplayName(data.user),
        loading: false,
      });
    }
  },

  signIn: async (stadtname, password) => {
    set({ loading: true, error: null });
    const email = toSyntheticEmail(stadtname);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) {
        msg = 'Ungültige Anmeldedaten. Bitte überprüfen Sie Stadtname und Passwort.';
      }
      set({ loading: false, error: msg });
      return;
    }
    set({
      user: data.user,
      session: data.session,
      isAuthenticated: true,
      stadtname: getDisplayName(data.user),
      loading: false,
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      stadtname: '',
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
