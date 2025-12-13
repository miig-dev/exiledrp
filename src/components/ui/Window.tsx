import { cn } from "@shadcn/ui";
import * as React from "react";

export interface WindowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
}

export function Window({
  title,
  icon,
  className,
  children,
  ...props
}: WindowProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20 p-6 mb-8",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-2xl">{icon}</span>}
          {title && (
            <h2 className="font-semibold text-lg text-white drop-shadow">
              {title}
            </h2>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
