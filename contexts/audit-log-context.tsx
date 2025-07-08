"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface AuditLogEntry {
  id: string
  timestamp: string
  adminEmail: string
  adminId: string
  action: string
  category: "product" | "contact" | "user" | "stock" | "message" | "system"
  details: {
    itemId?: string
    itemName?: string
    changes?: {
      field: string
      oldValue: any
      newValue: any
    }[]
    description: string
  }
}

interface AuditLogContextType {
  logs: AuditLogEntry[]
  addLog: (log: Omit<AuditLogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
  getLogsByCategory: (category: string) => AuditLogEntry[]
  getLogsByAdmin: (adminId: string) => AuditLogEntry[]
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined)

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])

  useEffect(() => {
    const savedLogs = localStorage.getItem("auditLogs")
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs))
    }
  }, [])

  const addLog = (logData: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newLog: AuditLogEntry = {
      ...logData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }

    const updatedLogs = [newLog, ...logs].slice(0, 1000) // Keep only last 1000 entries
    setLogs(updatedLogs)
    localStorage.setItem("auditLogs", JSON.stringify(updatedLogs))
  }

  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem("auditLogs")
  }

  const getLogsByCategory = (category: string) => {
    return logs.filter((log) => log.category === category)
  }

  const getLogsByAdmin = (adminId: string) => {
    return logs.filter((log) => log.adminId === adminId)
  }

  return (
    <AuditLogContext.Provider value={{ logs, addLog, clearLogs, getLogsByCategory, getLogsByAdmin }}>
      {children}
    </AuditLogContext.Provider>
  )
}

export function useAuditLog() {
  const context = useContext(AuditLogContext)
  if (context === undefined) {
    throw new Error("useAuditLog must be used within an AuditLogProvider")
  }
  return context
}
