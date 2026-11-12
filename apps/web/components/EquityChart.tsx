"use client";

// Lightweight SVG equity curve. Each segment is green when the balance went up
// and red when it went down, so wins and losses are visible at a glance.

export default function EquityChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  if (!data || data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-600">
        No equity data yet.
      </div>
    );
  }

  const W = 600;
  const H = 240;
  const pad = { top: 16, right: 14, bottom: 26, left: 44 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (i: number) => pad.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => pad.top + (1 - (v - min) / range) * innerH;

  const segments = data.slice(1).map((d, i) => {
    const prev = data[i];
    const up = d.value >= prev.value;
    return {
      x1: x(i),
      y1: y(prev.value),
      x2: x(i + 1),
      y2: y(d.value),
      up,
    };
  });

  const grid = [0, 1, 2, 3].map((g) => {
    const val = min + (range * g) / 3;
    return { val, gy: y(val) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
      {grid.map((g, i) => (
        <g key={i}>
          <line
            x1={pad.left}
            y1={g.gy}
            x2={pad.left + innerW}
            y2={g.gy}
            stroke="#16283f"
            strokeWidth="1"
          />
          <text
            x={pad.left - 6}
            y={g.gy + 3}
            textAnchor="end"
            fontSize="9"
            fill="#64748b"
            className="mono-num"
          >
            ${g.val.toFixed(2)}
          </text>
        </g>
      ))}

      {segments.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={s.up ? "#22c55e" : "#ef4444"}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      <text x={x(0)} y={pad.top + innerH + 16} textAnchor="start" fontSize="9" fill="#64748b">
        {data[0].label}
      </text>
      <text x={x(data.length - 1)} y={pad.top + innerH + 16} textAnchor="end" fontSize="9" fill="#64748b">
        {data[data.length - 1].label}
      </text>
    </svg>
  );
}
