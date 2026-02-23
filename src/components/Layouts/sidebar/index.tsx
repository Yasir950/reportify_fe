"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { useLanguage } from "../language/language-context";

// 👉 NEW: Import Language Hook

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // 👉 NEW: Get current language
  const { language } = useLanguage();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    // Expand menu if sub-route is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title.en)) {
              toggleExpanded(item.title.en);
            }
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-4 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label.en} className="mb-6">
                
                {/* 👉 LANGUAGE CHECK */}
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6"
                    style={{ direction: language === "urdu" ? "rtl" : "ltr" }}
                >
                  {language === "urdu" ? section.label.ur : section.label.en}
                </h2>

                <nav role="navigation" aria-label={section.label.en}>
                  <ul className="space-y-2">
                    {section.items.map((item) => {
                      const itemTitle = language === "urdu" ? item.title.ur : item.title.en;

                      return (
                        <li key={item.title.en}>
                          {item.items.length ? (
                            <div>
                              <MenuItem
                                isActive={item.items.some(({ url }) => url === pathname)}
                                onClick={() => toggleExpanded(item.title.en)}
                              >
                                <item.icon className="size-6 shrink-0" aria-hidden="true" />

                                <span style={{ direction: language === "urdu" ? "rtl" : "ltr" }}>
                                  {itemTitle}
                                </span>

                                <ChevronUp
                                  className={cn(
                                    "ml-auto rotate-180 transition-transform duration-200",
                                    expandedItems.includes(item.title.en) && "rotate-0",
                                  )}
                                  aria-hidden="true"
                                />
                              </MenuItem>

                              {expandedItems.includes(item.title.en) && (
                                <ul
                                  className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                  role="menu"
                                  style={{ direction: language === "urdu" ? "rtl" : "ltr" }}
                                >
                                  {item.items.map((subItem) => {
                                    const subTitle =
                                      language === "urdu"
                                        ? subItem.title.ur
                                        : subItem.title.en;

                                    return (
                                      <li key={subItem.title.en} role="none">
                                        <MenuItem
                                          as="link"
                                          href={subItem.url}
                                          isActive={pathname === subItem.url}
                                        >
                                          <span>{subTitle}</span>
                                        </MenuItem>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          ) : (
                            // Non-collapsible Items
                            <MenuItem
                              className="flex items-center gap-3 py-3"
                              as="link"
                              href={
                                "url" in item
                                  ? item.url + ""
                                  : "/" + item.title.en.toLowerCase().split(" ").join("-")
                              }
                              isActive={pathname === item.url}
                            >
                              <item.icon className="size-6 shrink-0" aria-hidden="true" />

                              <span style={{ direction: language === "urdu" ? "rtl" : "ltr" }}>
                                {itemTitle}
                              </span>
                            </MenuItem>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
