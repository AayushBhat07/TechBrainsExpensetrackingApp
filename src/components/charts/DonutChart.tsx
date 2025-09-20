import React from "react";

type DonutDatum = { name: string; value: number; color: string };

export const DonutChart: React.FC<{
  data: DonutDatum[];
  size?: number;
  innerRadius?: number;
}> = ({ data, size = 260, innerRadius = 80 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  let cumulative = 0;

  const arcs = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    const endAngle = ((cumulative + d.value) / total) * 2 * Math.PI;
    cumulative += d.value;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const x0 = cx + radius * Math.cos(startAngle);
    const y0 = cy + radius * Math.sin(startAngle);
    const x1 = cx + radius * Math.cos(endAngle);
    const y1 = cy + radius * Math.sin(endAngle);

    const xi0 = cx + innerRadius * Math.cos(endAngle);
    const yi0 = cy + innerRadius * Math.sin(endAngle);
    const xi1 = cx + innerRadius * Math.cos(startAngle);
    const yi1 = cy + innerRadius * Math.sin(startAngle);

    const dPath = [
      `M ${x0} ${y0}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1}`,
      `L ${xi0} ${yi0}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      "Z",
    ].join(" ");

    return <path key={i} d={dPath} fill={d.color} opacity={0.9} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs}
    </svg>
  );
};
