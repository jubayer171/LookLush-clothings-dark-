"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  password: string
  isAdmin: boolean
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

interface UserManagementContextType {
  users: User[]
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  toggleUserStatus: (id: string) => void
  getUserById: (id: string) => User | undefined
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined)

const defaultUsers: User[] = [
  {
    id: "1",
    email: "admin@looklush.com",
    password: "admin123",
    isAdmin: true,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    isAdmin: false,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
]

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const savedUsers = localStorage.getItem("systemUsers")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      setUsers(defaultUsers)
      localStorage.setItem("systemUsers", JSON.stringify(defaultUsers))
    }
  }, [])

  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("systemUsers", JSON.stringify(updatedUsers))
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...updates } : user))
    setUsers(updatedUsers)
    localStorage.setItem("systemUsers", JSON.stringify(updatedUsers))
  }

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem("systemUsers", JSON.stringify(updatedUsers))
  }

  const toggleUserStatus = (id: string) => {
    const updatedUsers = users.map((user) => (user.id === id ? { ...user, isActive: !user.isActive } : user))
    setUsers(updatedUsers)
    localStorage.setItem("systemUsers", JSON.stringify(updatedUsers))
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
  }

  return (
    <UserManagementContext.Provider value={{ users, addUser, updateUser, deleteUser, toggleUserStatus, getUserById }}>
      {children}
    </UserManagementContext.Provider>
  )
}

export function useUserManagement() {
  const context = useContext(UserManagementContext)
  if (context === undefined) {
    throw new Error("useUserManagement must be used within a UserManagementProvider")
  }
  return context
}
