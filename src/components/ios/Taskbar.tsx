"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { Grid, LogOut, Menu, User } from "lucide-react";
import { useEffect, useState } from "react";

export function Taskbar() {
  const [time, setTime] = useState(new Date());
  const [isStartOpen, setIsStartOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#1c1c1c]/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 z-50">
      {/* Start Button & Pinned Apps */}
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsStartOpen(!isStartOpen)}
          className={cn(
            "p-2 rounded hover:bg-white/10 transition-colors",
            isStartOpen && "bg-white/10"
          )}
        >
          <Menu className="w-6 h-6 text-blue-400" />
        </button>
        {/* TODO: Liste des apps ouvertes */}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-4 ml-auto text-xs text-white/80">
        <div className="flex flex-col items-end leading-tight">
          <span>{format(time, "HH:mm")}</span>
          <span>{format(time, "dd/MM/yyyy")}</span>
        </div>
      </div>

      {/* Start Menu (Popup) */}
      {isStartOpen && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-6 flex flex-col animate-in slide-in-from-bottom-5">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-[#2c2c2c] border-none rounded-t-md px-4 py-2 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-6 gap-4 content-start">
            <AppShortcut icon={Grid} label="Bureau" />
            <AppShortcut icon={User} label="Profil" />
            {/* Autres apps ici */}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                U
              </div>
              <span className="font-medium">Utilisateur</span>
            </div>
            <button
              onClick={() => (window.location.href = "/auth/signout")}
              className="p-2 hover:bg-white/10 rounded transition-colors text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type AppShortcutProps = {
  icon: LucideIcon;
  label: string;
};

function AppShortcut({ icon: Icon, label }: AppShortcutProps) {
  return (
    <button className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors group">
      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <span className="text-xs text-center text-gray-300 group-hover:text-white">
        {label}
      </span>
    </button>
  );
}
