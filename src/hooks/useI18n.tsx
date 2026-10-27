import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { getTranslation, TranslationKey } from '../i18n';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('icd_language') as LanguageCode;
      if (saved && ['en', 'hi', 'gu'].includes(saved)) return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('icd_language', lang);
      document.documentElement.lang = lang;
      if (lang === 'gu') {
        document.documentElement.classList.add('lang-gu');
      } else {
        document.documentElement.classList.remove('lang-gu');
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'gu') {
      document.documentElement.classList.add('lang-gu');
    } else {
      document.documentElement.classList.remove('lang-gu');
    }
  }, [language]);

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
