import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, TranslationData } from '../i18n/translations';

export type Language = 'ru' | 'en' | 'ky';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationData;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'ru',
  setLang: () => {},
  t: TRANSLATIONS.ru,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('atelier_lang');
    if (saved === 'ru' || saved === 'en' || saved === 'ky') return saved;
    return 'ru';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('atelier_lang', newLang);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
