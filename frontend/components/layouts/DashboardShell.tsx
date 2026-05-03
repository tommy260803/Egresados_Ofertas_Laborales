import * as React from "react"

export interface DashboardShellProps {
  children?: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-1 py-2 sm:px-0">
      {children}
    </div>
  )
}
