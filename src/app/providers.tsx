"use client";

import { LanguageProvider } from "@/components/Layouts/language/language-context";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
       <LanguageProvider>
      <SidebarProvider>{children}</SidebarProvider>
       </LanguageProvider>
    </ThemeProvider>
  );
}
