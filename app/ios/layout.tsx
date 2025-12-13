"use client";

import { DesktopIcon } from "@/components/ios/DesktopIcon";
import { Taskbar } from "@/components/ios/Taskbar";
import {
  Briefcase,
  Calendar,
  Mail,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function IOSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/ios";

  const apps = [
    { label: "Métiers", icon: Briefcase, href: "/ios/profession-center" },
    { label: "Urgences", icon: ShieldAlert, href: "/ios/emergency-live" },
    { label: "Animation", icon: Calendar, href: "/ios/animation-center" },
    { label: "Messagerie", icon: Mail, href: "/ios/mail" },
    { label: "Staff", icon: Users, href: "/ios/staff-center" },
    { label: "Mon Profil", icon: User, href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-[url('/wallpaper-ios.jpg')] bg-cover bg-center overflow-hidden flex flex-col relative text-white select-none">
      {/* Overlay sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Zone Bureau (Desktop Icons) - Masquée car on a maintenant un vrai dashboard */}
      {false && isDashboard && (
        <div className="relative z-10 flex-1 p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
            {apps.map((app) => (
              <DesktopIcon
                key={app.label}
                icon={app.icon}
                label={app.label}
                onClick={() => router.push(app.href)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Zone Dashboard/Fenêtres */}
      {isDashboard ? (
        // Dashboard intégré directement sur le bureau
        <div className="relative z-20 flex-1 overflow-auto">{children}</div>
      ) : (
        // Fenêtres pour les autres pages
        <div className="absolute inset-4 bottom-16 z-20 pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto w-full max-w-6xl h-full max-h-[90%]">
            {children}
          </div>
        </div>
      )}

      <Taskbar />
    </div>
  );
}
