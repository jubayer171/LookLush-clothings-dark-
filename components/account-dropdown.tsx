"use client"

import { useState } from "react"
import { User, ShoppingBag, Package, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useOrders } from "@/contexts/order-context"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function AccountDropdown() {
  const { user, logout } = useAuth()
  const { items, getTotalItems, getTotalPrice } = useCart()
  const { orders } = useOrders()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const recentOrders = orders.slice(-3).reverse()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:text-purple-400"
      >
        <User className="w-4 h-4" />
        <span>Account</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <Card className="glass-effect border-gray-800 shadow-2xl">
                <CardContent className="p-6 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-800">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.isAdmin ? "Admin" : "Customer"}</p>
                    </div>
                  </div>

                  {/* Cart Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Cart
                      </h3>
                      <Badge variant="secondary">{getTotalItems()} items</Badge>
                    </div>
                    {items.length > 0 ? (
                      <div className="space-y-2">
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-300 truncate">{item.product.name}</span>
                              <span className="text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} more items</p>}
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-gray-800">
                          <span className="text-white">Total:</span>
                          <span className="gradient-text">${getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Your cart is empty</p>
                    )}
                  </div>

                  {/* Recent Orders */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-white flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Recent Orders
                    </h3>
                    {recentOrders.length > 0 ? (
                      <div className="space-y-2">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex justify-between items-center text-sm">
                            <div>
                              <p className="text-gray-300">Order #{order.id.slice(-6)}</p>
                              <p className="text-xs text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white">${order.total.toFixed(2)}</p>
                              <Badge
                                variant="secondary"
                                className={
                                  order.status === "delivered"
                                    ? "bg-green-500/20 text-green-400"
                                    : order.status === "shipped"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No orders yet</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-3 border-t border-gray-800">
                    <Link href="/orders" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start border-gray-700 bg-transparent">
                        <Package className="w-4 h-4 mr-2" />
                        View All Orders
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
