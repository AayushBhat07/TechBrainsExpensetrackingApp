import React from "react";

type Cell = { date: string; value: number };

export const HeatmapCalendar: React.FC<{
  data: Cell[];
  colorScale?: string[];
}> = ({ data, colorScale = ["#1e293b", "#3b82f6", "#1d4ed8", "#1e40af"] }) => {
  // Simple month grid (7x5) with provided data
  const grid: Array<Cell | null> = Array.from({ length: 35 }, (_, i) => data[i] ?? null);

  const colorFor = (v: number) => {
    if (v <= 0) return colorScale[0];
    if (v < 25) return colorScale[1];
    if (v < 50) return colorScale[2];
    return colorScale[3];
    // Very simplified scale
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {grid.map((cell, i) => (
        <div
          key={i}
          className="w-full aspect-square rounded-md"
          style={{ backgroundColor: cell ? colorFor(cell.value) : "rgba(255,255,255,0.08)" }}
          title={cell ? `${cell.date}: ${cell.value}` : undefined}
        />
      ))}
    </div>
  );
};
