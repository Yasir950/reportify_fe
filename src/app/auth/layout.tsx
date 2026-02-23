import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import 'leaflet/dist/leaflet.css';

import { Providers } from "../providers";
import NextTopLoader from "nextjs-toploader";
import { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-2 dark:bg-[#020d1a]">
        <Providers>
          <NextTopLoader color="#1eb346" showSpinner={false} />

          {/* No sidebar, no header */}
          <main>
            {children}
          </main>

        </Providers>
      </body>
    </html>
  );
}
