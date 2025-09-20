import React from "react";

type BarDatum = Record<string, string | number>;

export const BarChart: React.FC<{
  data: BarDatum[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}> = ({ data, xKey, yKey, color = "#3b82f6", height = 220 }) => {
  const width = 480;
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const values = data.map((d) => Number(d[yKey] || 0));
  const max = Math.max(1, ...values);
  const barW = innerW / data.length - 12;

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {data.map((d, i) => {
        const v = Number(d[yKey] || 0);
        const h = (v / max) * innerH;
        const x = padding + i * (innerW / data.length) + 6;
        const y = height - padding - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={6}
              fill={color}
              opacity={0.9}
            />
            <text
              x={x + barW / 2}
              y={height - 6}
              textAnchor="middle"
              className="fill-foreground/60 text-[10px]"
            >
              {String(d[xKey])}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
