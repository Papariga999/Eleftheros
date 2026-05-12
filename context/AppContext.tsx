import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Lang } from '../constants/strings';
import { clearToken } from '../services/api';

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  showPro: boolean;
  setShowPro: (v: boolean) => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
}

const AppContext = createContext<AppState>({} as AppState);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('el');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('lang').then(v => {
      if (v === 'el' || v === 'en') setLangState(v);
    });
    AsyncStorage.getItem('isLoggedIn').then(v => {
      if (v === '1') setIsLoggedIn(true);
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('lang', l);
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    AsyncStorage.setItem('isLoggedIn', '1');
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setShowPro(false);
    setEditingProfile(false);
    AsyncStorage.removeItem('isLoggedIn');
    clearToken();
  }, []);

  return (
    <AppContext.Provider value={{ lang, setLang, isLoggedIn, login, logout, showPro, setShowPro, editingProfile, setEditingProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
