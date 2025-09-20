import React from "react";

type Point = { x: number; y: number };

export const LineChart: React.FC<{
  points: Point[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
}> = ({ points, width = 480, height = 220, color = "#10b981", fill = "rgba(16,185,129,0.15)" }) => {
  if (!points.length) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const pad = 16;
  const scaleX = (x: number) =>
    pad + ((x - minX) / Math.max(1, maxX - minX)) * (width - pad * 2);
  const scaleY = (y: number) =>
    height - pad - ((y - minY) / Math.max(1, maxY - minY)) * (height - pad * 2);

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.x)} ${scaleY(p.y)}`)
    .join(" ");

  const areaD = `${pathD} L ${scaleX(points[points.length - 1].x)} ${height - pad} L ${scaleX(points[0].x)} ${height - pad} Z`;

  return (
    <svg width={width} height={height} className="w-full h-auto">
      <path d={areaD} fill={fill} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
};
