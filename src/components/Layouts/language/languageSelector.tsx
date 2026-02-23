"use client";

import { cn } from "@/lib/utils"; // If you use cn() utility; otherwise remove it
import { useLanguage } from "./language-context";

export function LanguageSelector() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="flex rounded-full border  border-gray-300 dark:border-dark-3 overflow-hidden">
      <button
        onClick={() => language !== "urdu" && toggleLanguage()}
        className={cn(
          "px-4 py-2 text-sm transition-colors",
          language === "urdu"
            ? "bg-primary text-white dark:bg-primary"
            : "bg-transparent text-gray-700 dark:text-dark-5"
        )}
      >
        اردو
      </button>

      <button
        onClick={() => language !== "english" && toggleLanguage()}
        className={cn(
          "px-4 py-2 text-sm transition-colors",
          language === "english"
            ? "bg-primary text-white dark:bg-primary"
            : "bg-transparent text-gray-700 dark:text-dark-5"
        )}
      >
        EN
      </button>
    </div>
  );
}
