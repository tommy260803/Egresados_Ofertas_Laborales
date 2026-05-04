"use client";

import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
}

export function PieChart({ data, nameKey, valueKey }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        No hay datos disponibles
      </div>
    );
  }

  // Asegurar que los valores sean numéricos para evitar errores de proporción
  const sanitizedData = data.map(item => ({
    ...item,
    [valueKey]: typeof item[valueKey] === 'string' ? parseFloat(item[valueKey]) : item[valueKey]
  })).filter(item => !isNaN(item[valueKey]) && item[valueKey] > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RePieChart>
        <Pie
          data={sanitizedData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ [nameKey]: name, [valueKey]: value }) => `${name}: ${value}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
        >
          {sanitizedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}%`, name]} />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  );
}
