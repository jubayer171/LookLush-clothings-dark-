"use client"

import { motion } from "framer-motion"
import { Package, ArrowLeft, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { useOrders } from "@/contexts/order-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const { orders } = useOrders()
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Your Orders</h1>
            <p className="text-gray-400 text-lg">Track and manage your purchases</p>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
              <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
              <Button
                onClick={() => router.push("/products")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Start Shopping
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders
                .slice()
                .reverse()
                .map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-gray-800">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white flex items-center">
                              <Package className="w-5 h-5 mr-2" />
                              Order #{order.id.slice(-8)}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={
                                order.status === "delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : order.status === "shipped"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : order.status === "processing"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                              }
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-xl font-bold gradient-text mt-2">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {order.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center space-x-4 p-3 glass-effect rounded-lg">
                              <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden">
                                {item.product.images && item.product.images.length > 0 ? (
                                  <img
                                    src={item.product.images[0] || "/placeholder.svg"}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                    {item.product.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{item.product.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {item.selectedColor} • {item.selectedSize} • Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-white">
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
