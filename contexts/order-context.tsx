"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CartItem } from "./cart-context"

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  orderDate: string
  shippingAddress: {
    name: string
    email: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Omit<Order, "id">) => void
  getOrderById: (id: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders")
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  const addOrder = (order: Omit<Order, "id">) => {
    const newOrder = { ...order, id: Date.now().toString() }
    const updatedOrders = [...orders, newOrder]
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  return <OrderContext.Provider value={{ orders, addOrder, getOrderById }}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
