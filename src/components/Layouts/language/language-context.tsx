"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface LanguageContextProps {
  language: "urdu" | "english";
  setLanguage: (lang: "urdu" | "english") => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"urdu" | "english">("english");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "urdu" || saved === "english") {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: "urdu" | "english") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // 👉 Add toggleLanguage for convenience
  const toggleLanguage = () => {
    const next = language === "urdu" ? "english" : "urdu";
    changeLanguage(next);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: changeLanguage, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Update the interface to include toggleLanguage
interface LanguageContextProps {
  language: "urdu" | "english";
  setLanguage: (lang: "urdu" | "english") => void;
  toggleLanguage: () => void; // added
}


export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
