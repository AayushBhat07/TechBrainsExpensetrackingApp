import React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "warning" | "danger" | "success" | "data";
type Size = "sm" | "md" | "lg" | "responsive";

export function GlassCard({
  children,
  className,
  variant = "default",
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
}) {
  const variantClasses: Record<Variant, string> = {
    default: "bg-white/60 border-[#E8E8E8]",
    primary: "bg-white/60 border-[#E8E8E8]",
    warning: "bg-yellow-500/10 border-yellow-400/30",
    danger: "bg-red-500/10 border-red-400/30",
    success: "bg-emerald-500/10 border-emerald-400/30",
    data: "bg-white/60 border-[#E8E8E8]",
  };
  const sizeClasses: Record<Size, string> = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    responsive: "p-4 md:p-6",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-[9px] text-foreground",
        variantClasses[variant],
        sizeClasses[size],
        "shadow-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
