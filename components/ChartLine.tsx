// components/ChartLine.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ChartLineProps = {
  values: number[];
  labels: (string | number)[];
};

export function ChartLine({ values = [], labels = [] }: ChartLineProps) {
  // Guard: fallback to dummy data if mismatch or empty
  if (!values?.length || !labels?.length || values.length !== labels.length) {
    return (
      <div className="h-40 flex items-center justify-center text-[var(--muted)] text-sm border border-[var(--border)] rounded-xl">
        No chart data
      </div>
    );
  }

  // build data array that recharts expects
  const data = labels.map((label, i) => ({
    x: String(label),
    y: values[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="x" stroke="var(--muted)" />
        <YAxis stroke="var(--muted)" />
        <Tooltip
          contentStyle={{ backgroundColor: "var(--panel)", border: "1px solid var(--border)" }}
        />
        <Line
          type="monotone"
          dataKey="y"
          stroke="var(--brand, #4f46e5)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
