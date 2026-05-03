"use client";

import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function BarChart({ data, xKey, yKey }: { data: Record<string, unknown>[]; xKey: string; yKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={yKey} fill="#82ca9d" />
      </ReBarChart>
    </ResponsiveContainer>
  );
}