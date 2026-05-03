import * as React from "react"
export { BarChart } from "./BarChart"

// Placeholder components for LineChart and PieChart
export function LineChart({ data, xKey, yKey }: { data: Record<string, unknown>[]; xKey?: string; yKey?: string }) {
  return React.createElement("div", { className: "h-64 flex items-center justify-center text-muted-foreground" }, "Line Chart - Coming Soon")
}

export function PieChart({ data, nameKey, valueKey }: { data: Record<string, unknown>[]; nameKey?: string; valueKey?: string }) {
  return React.createElement("div", { className: "h-64 flex items-center justify-center text-muted-foreground" }, "Pie Chart - Coming Soon")
}

