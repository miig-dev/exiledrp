"use client";

import { Footer } from "@/components/layout/Footer";
import { TRPCProvider } from "@/components/TRPCProvider";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TRPCProvider>
      {/* Script anti-F12/clic droit */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
              // Désactive le clic droit
              document.addEventListener('contextmenu', e => e.preventDefault());
              // Désactive F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
              document.addEventListener('keydown', function(e) {
                if (
                  e.key === 'F12' ||
                  (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                  (e.ctrlKey && e.key === 'U')
                ) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              });
            `,
        }}
      />
      {children}
      <Footer />
    </TRPCProvider>
  );
};
