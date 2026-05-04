"use client";

import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export function BarChart({ data, xKey, yKey }: { data: Record<string, any>[]; xKey: string; yKey: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        No hay datos disponibles
      </div>
    );
  }

  // Sanitizar datos para asegurar que xKey existe y yKey es numérico
  const sanitizedData = data
    .map(item => ({
      ...item,
      [yKey]: typeof item[yKey] === 'string' ? parseInt(item[yKey]) : item[yKey]
    }))
    .filter(item => item[xKey] && !isNaN(item[yKey]));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={sanitizedData} margin={{ bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
        <XAxis 
          dataKey={xKey} 
          interval={0} 
          angle={-45} 
          textAnchor="end" 
          height={60}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc' }}
          itemStyle={{ color: '#38bdf8' }}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {sanitizedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}