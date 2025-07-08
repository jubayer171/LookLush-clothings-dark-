"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart, Heart, Star, Zap, Shield, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { ImageGallery } from "@/components/image-gallery"
import { useProducts } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProduct, products } = useProducts()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const product = getProduct(params.id as string)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product not found</h1>
          <Button onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Please select options",
        description: "Please select both color and size before adding to cart.",
        variant: "destructive",
      })
      return
    }

    if (product.stockQuantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    if (quantity > product.stockQuantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stockQuantity} items available in stock.`,
        variant: "destructive",
      })
      return
    }

    addToCart(product, selectedColor, selectedSize, quantity)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Please select options",
        description: "Please select both color and size before purchasing.",
        variant: "destructive",
      })
      return
    }

    if (product.stockQuantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    // Store the buy now item in sessionStorage for checkout
    const buyNowItem = {
      product,
      quantity,
      selectedColor,
      selectedSize,
      selected: true,
    }
    
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
    sessionStorage.setItem('checkoutMode', 'buyNow')
    
    toast({
      title: "Proceeding to checkout",
      description: "Redirecting to checkout for this item...",
    })

    // Redirect to checkout
    setTimeout(() => {
      router.push("/checkout")
    }, 1500)
  }

  const getStockStatus = () => {
    if (product.stockQuantity === 0) return { text: "Out of Stock", color: "bg-red-500/20 text-red-400" }
    if (product.stockQuantity <= 5) return { text: "Low Stock", color: "bg-yellow-500/20 text-yellow-400" }
    return { text: "In Stock", color: "bg-green-500/20 text-green-400" }
  }

  const stockStatus = getStockStatus()

  // Get related products (same category, excluding current product)
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-effect border-gray-800 overflow-hidden">
                <CardContent className="p-8">
                  <ImageGallery images={product.images} productName={product.name} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-gray-400">(4.8) 124 reviews</span>
                      <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-4xl gradient-text font-bold">${product.price}</p>
                  <p className="text-gray-400">
                    Price range: ${product.minPrice} - ${product.maxPrice}
                  </p>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">{product.description}</p>
              </div>

              {/* Product Options */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Color</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 h-12">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-5 h-5 rounded-full border border-gray-600"
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
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 h-12">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Quantity</label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 h-12 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(5, product.stockQuantity) }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stockQuantity === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                  <Button variant="outline" className="border-purple-500/50 hover:bg-purple-500/10 py-6 bg-transparent">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  variant="outline"
                  className="w-full border-purple-500/50 hover:bg-purple-500/10 text-lg py-6 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Truck, text: "Free Shipping" },
                  { icon: Shield, text: "Secure Payment" },
                  { icon: Star, text: "Premium Quality" },
                ].map((feature, index) => (
                  <div key={index} className="glass-effect p-4 rounded-lg text-center">
                    <feature.icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-gray-300">{feature.text}</p>
                  </div>
                ))}
              </div>

              {/* Product Details */}
              <div className="glass-effect p-6 rounded-lg">
                <h3 className="font-semibold text-white mb-4 text-lg">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white ml-2">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Colors:</span>
                    <span className="text-white ml-2">{product.colors.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Sizes:</span>
                    <span className="text-white ml-2">{product.sizes.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Availability:</span>
                    <span className="text-white ml-2">{stockStatus.text}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* You May Like Section */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-8"
            >
              <Separator className="bg-gray-800" />
              <div>
                <h2 className="text-3xl font-bold text-white mb-8 text-center">You May Also Like</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct, index) => (
                    <motion.div
                      key={relatedProduct.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="glass-effect border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            {relatedProduct.images && relatedProduct.images.length > 0 ? (
                              <img
                                src={relatedProduct.images[0] || "/placeholder.svg"}
                                alt={relatedProduct.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="text-4xl font-bold text-white/10">{relatedProduct.name.charAt(0)}</div>
                            )}
                          </div>
                          <h3 className="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                            {relatedProduct.name}
                          </h3>
                          <p className="text-lg font-bold gradient-text">${relatedProduct.price}</p>
                          <Button
                            onClick={() => router.push(`/products/${relatedProduct.id}`)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 border-purple-500/50 hover:bg-purple-500/10 bg-transparent"
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
