"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  timestamp: string
  isRead: boolean
}

interface MessagesContextType {
  messages: ContactMessage[]
  addMessage: (message: Omit<ContactMessage, "id" | "timestamp" | "isRead">) => void
  markAsRead: (id: string) => void
  deleteMessage: (id: string) => void
  getUnreadCount: () => number
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    const savedMessages = localStorage.getItem("contactMessages")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  const addMessage = (messageData: Omit<ContactMessage, "id" | "timestamp" | "isRead">) => {
    const newMessage: ContactMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
    }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem("contactMessages", JSON.stringify(updatedMessages))
  }

  const markAsRead = (id: string) => {
    const updatedMessages = messages.map((msg) => (msg.id === id ? { ...msg, isRead: true } : msg))
    setMessages(updatedMessages)
    localStorage.setItem("contactMessages", JSON.stringify(updatedMessages))
  }

  const deleteMessage = (id: string) => {
    const updatedMessages = messages.filter((msg) => msg.id !== id)
    setMessages(updatedMessages)
    localStorage.setItem("contactMessages", JSON.stringify(updatedMessages))
  }

  const getUnreadCount = () => {
    return messages.filter((msg) => !msg.isRead).length
  }

  return (
    <MessagesContext.Provider value={{ messages, addMessage, markAsRead, deleteMessage, getUnreadCount }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider")
  }
  return context
}
