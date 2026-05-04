"use client";

import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
}

export function LineChart({ data, xKey, yKey }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
      </ReLineChart>
    </ResponsiveContainer>
  );
}