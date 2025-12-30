"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type WindowProps = {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function Window({
  title,
  icon: Icon,
  children,
  className,
}: WindowProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200",
        className
      )}
    >
      {/* Title Bar */}
      <div className="h-10 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-blue-400" />}
          <span className="text-sm font-medium text-white/90">{title}</span>
        </div>
        <button
          onClick={() => router.push("/ios")}
          className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {children}
      </div>
    </div>
  );
}
