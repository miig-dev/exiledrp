"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DesktopIconProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const DesktopIcon = ({
  icon: Icon,
  label,
  onClick,
  className,
}: DesktopIconProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all duration-200 w-28 group cursor-pointer",
        className
      )}
    >
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/90 via-blue-600/90 to-blue-700/90 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/20">
          <Icon className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
        {/* Effet de brillance au survol */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <span className="text-xs font-semibold text-white text-center drop-shadow-lg break-words line-clamp-2 leading-tight px-1 group-hover:text-blue-300 transition-colors">
        {label}
      </span>
    </button>
  );
};
