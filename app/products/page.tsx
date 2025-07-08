"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { useProducts } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const { products } = useProducts()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stockQuantity === 0) {
      toast({
        title: "Out of stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      })
      return
    }

    addToCart(product, product.colors[0], product.sizes[0])
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) return { text: "Out of Stock", color: "bg-red-500/20 text-red-400" }
    if (stockQuantity <= 5) return { text: "Low Stock", color: "bg-yellow-500/20 text-yellow-400" }
    return { text: "In Stock", color: "bg-green-500/20 text-green-400" }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">Our Collection</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover our curated selection of premium fashion pieces
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product.stockQuantity)

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -10 }}
                >
                  <Link href={`/products/${product.id}`}>
                    <Card className="glass-effect border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300" />
                              <div className="text-6xl font-bold text-white/10 group-hover:text-white/20 transition-all duration-300">
                                {product.name.charAt(0)}
                              </div>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleFavorite(product.id)
                            }}
                          >
                            <Heart
                              className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                          </Button>

                          {/* Stock Badge */}
                          <Badge className={`absolute top-2 left-2 ${stockStatus.color}`}>{stockStatus.text}</Badge>

                          {/* Admin SKU Badge */}
                          {user?.isAdmin && (
                            <Badge className="absolute bottom-2 left-2 bg-purple-500/20 text-purple-400 font-mono text-xs">
                              {product.sku}
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-400 transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="space-y-1">
                            <span className="text-2xl font-bold gradient-text">${product.price}</span>
                            <div className="text-xs text-gray-500">
                              Range: ${product.minPrice} - ${product.maxPrice}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{product.category}</span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">Colors:</span>
                            <div className="flex space-x-1">
                              {product.colors.slice(0, 3).map((color) => (
                                <div
                                  key={color}
                                  className="w-4 h-4 rounded-full border border-gray-600"
                                  style={{
                                    backgroundColor:
                                      color === "black"
                                        ? "#000"
                                        : color === "navy"
                                          ? "#1e3a8a"
                                          : color === "burgundy"
                                            ? "#7c2d12"
                                            : color === "charcoal"
                                              ? "#374151"
                                              : color === "gold"
                                                ? "#fbbf24"
                                                : color === "silver"
                                                  ? "#9ca3af"
                                                  : color,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 border-purple-500/50 hover:bg-purple-500/10 bg-transparent"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={(e) => handleQuickAdd(product, e)}
                            disabled={product.stockQuantity === 0}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
