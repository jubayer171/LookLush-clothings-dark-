"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userManagement, setUserManagement] = useState<any>(null)

  // We need to get the user management context after it's initialized
  useEffect(() => {
    // This will be set after UserManagementProvider is initialized
    const checkUserManagement = () => {
      try {
        // Try to get users from localStorage to check if user management is ready
        const savedUsers = localStorage.getItem("systemUsers")
        if (savedUsers) {
          setUserManagement({ users: JSON.parse(savedUsers) })
        }
      } catch (error) {
        console.log("User management not ready yet")
      }
    }

    checkUserManagement()

    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get current users from localStorage
    const savedUsers = localStorage.getItem("systemUsers")
    let users = []

    if (savedUsers) {
      users = JSON.parse(savedUsers)
    } else {
      // Fallback to default users if no saved users
      users = [
        {
          id: "1",
          email: "admin@looklush.com",
          password: "admin123",
          isAdmin: true,
          isActive: true,
        },
        {
          id: "2",
          email: "user@example.com",
          password: "user123",
          isAdmin: false,
          isActive: true,
        },
      ]
    }

    // Find user with matching credentials
    const foundUser = users.find((u: any) => u.email === email && u.password === password && u.isActive)

    if (foundUser) {
      const authUser = {
        id: foundUser.id,
        email: foundUser.email,
        isAdmin: foundUser.isAdmin,
      }
      setUser(authUser)
      localStorage.setItem("user", JSON.stringify(authUser))

      // Update last login time
      const updatedUsers = users.map((u: any) =>
        u.id === foundUser.id ? { ...u, lastLogin: new Date().toISOString() } : u,
      )
      localStorage.setItem("systemUsers", JSON.stringify(updatedUsers))

      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
