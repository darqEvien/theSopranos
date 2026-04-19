import { create } from 'zustand';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface StoreState {
  user: User | null;
  authLoading: boolean;
  theme: 'dark' | 'light';

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setUser: (user: User | null) => void; // Profil güncellemesi sonrası anlık refresh için
  setSubtitleLanguage: (lang: 'tr' | 'en') => void;
  subtitleLanguage: 'tr' | 'en';
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  authLoading: true,
  theme: 'dark',
  subtitleLanguage: (localStorage.getItem('subtitleLanguage') as 'tr' | 'en') || 'tr',

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setUser: (user) => set({ user }),
  setSubtitleLanguage: async (lang) => {
    localStorage.setItem('subtitleLanguage', lang);
    set({ subtitleLanguage: lang });
    
    // Firebase senkronizasyonu
    const user = get().user;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { subtitleLanguage: lang }, { merge: true });
      } catch (err) {
        console.error("Altyazı tercihi Firebase'e kaydedilemedi:", err);
      }
    }
  },
}));

// Firebase Auth dinleyicisi — global duruma(user) otomatik yansıtır
onAuthStateChanged(auth, async (user) => {
  useStore.setState({ user, authLoading: false });
  
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().subtitleLanguage) {
        const lang = userSnap.data().subtitleLanguage as 'tr' | 'en';
        localStorage.setItem('subtitleLanguage', lang);
        useStore.setState({ subtitleLanguage: lang });
      }
    } catch (err) {
      console.error("Altyazı tercihi Firebase'den alınamadı:", err);
    }
  }
});