import * as React from "react";
import { cn } from "@shadcn/ui";

interface AppLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, header, footer, className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
      {header && <header className="w-full border-b border-border py-4 px-6">{header}</header>}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">{children}</main>
      {footer && <footer className="w-full border-t border-border py-4 px-6">{footer}</footer>}
    </div>
  );
}
