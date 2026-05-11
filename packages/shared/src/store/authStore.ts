import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { useUIStore } from './uiStore';

interface UserProfile {
  id: string;
  theme_primary: string;
  theme_light: string;
  theme_heavy: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setSession: (session) => {
    const user = session?.user ?? null;
    set({ session, user, isLoading: false });
    if (user) {
      get().fetchProfile(user.id);
    }
  },
  setProfile: (profile) => {
    if (profile) {
      // 전역 UI 스토어에 색상 동기화
      useUIStore.getState().setThemeColors(profile.theme_primary, profile.theme_light, profile.theme_heavy);
    }
    set({ profile });
  },
  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        get().setProfile(data);
      } else {
        // 프로필이 없는 신규 사용자를 위해 현재 UI 설정값으로 기본값 생성
        const { theme_primary, theme_light, theme_heavy } = useUIStore.getState();
        const defaultProfile = {
          id: userId,
          theme_primary,
          theme_light,
          theme_heavy
        };
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([defaultProfile]);
        
        if (!insertError) get().setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, isLoading: false });
  },
}));
