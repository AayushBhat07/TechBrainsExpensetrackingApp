import React from "react";
import { cn } from "@/lib/utils";

export const LinearProgressBar: React.FC<{
  percentage: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}> = ({ percentage, height = 8, color = "#10b981", backgroundColor = "rgba(255,255,255,0.15)", className }) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div
      className={cn("w-full rounded-full overflow-hidden", className)}
      style={{ height, backgroundColor }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
};
