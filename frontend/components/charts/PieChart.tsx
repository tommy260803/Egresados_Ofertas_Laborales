"use client";

import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function PieChart({ data, nameKey, valueKey }: { data: any[]; nameKey: string; valueKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RePieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  );
}