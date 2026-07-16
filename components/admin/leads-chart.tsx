"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function LeadsChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6B7080", fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "#E6E6DF" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6B7080", fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ fill: "rgba(39,67,224,0.06)" }}
            contentStyle={{
              border: "1px solid #E6E6DF",
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
            labelFormatter={(l) => `${l} ago`}
            formatter={(v) => [`${v}`, "leads"]}
          />
          <Bar dataKey="count" fill="#2743E0" radius={[3, 3, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
