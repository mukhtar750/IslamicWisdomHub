import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  toggleLanguage: () => void;
  initializeLanguage: () => void;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language || "en");
  const isRtl = language === "ar";

  // Set language in i18n and document
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "ar");
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Toggle between English and Arabic
  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
  };

  // Initialize language from localStorage or browser preference
  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Check for Arabic in browser preferences
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "ar") {
        setLanguage("ar");
      }
    }
  };

  // Initialize language on mount (runs only once)
  useEffect(() => {
    initializeLanguage();
  }, []);

  // Set up document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", isRtl);
  }, [isRtl]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        initializeLanguage,
        isRtl
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Create a higher order component to make language provider available globally
export function withLanguageProvider(Component: React.ComponentType) {
  return function WrappedComponent(props: any) {
    return (
      <LanguageProvider>
        <Component {...props} />
      </LanguageProvider>
    );
  };
}
