"use client"

import type React from "react"
import React from "react"

import { motion } from "framer-motion"
import { CreditCard, MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/contexts/cart-context"

export default function CheckoutPage() {
  const { items, getSelectedItems, getSelectedTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useOrders()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([])
  const [checkoutMode, setCheckoutMode] = useState<'cart' | 'buyNow'>('cart')

  // Initialize checkout items based on mode
  React.useEffect(() => {
    const mode = sessionStorage.getItem('checkoutMode')
    const buyNowItem = sessionStorage.getItem('buyNowItem')
    
    if (mode === 'buyNow' && buyNowItem) {
      setCheckoutMode('buyNow')
      setCheckoutItems([JSON.parse(buyNowItem)])
      // Clear the session storage
      sessionStorage.removeItem('buyNowItem')
      sessionStorage.removeItem('checkoutMode')
    } else {
      setCheckoutMode('cart')
      setCheckoutItems(getSelectedItems())
    }
  }, [getSelectedItems])

  const getTotalPrice = () => {
    return checkoutItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create order
    const order = {
      items: checkoutItems,
      total: getTotalPrice() * 1.08, // Including tax
      status: "pending" as const,
      orderDate: new Date().toISOString(),
      shippingAddress: {
        name: "Customer", // This would come from the form
        email: user?.email || "customer@example.com",
        address: "Address from form",
        city: "",
        state: "",
        zipCode: "",
      },
    }

    addOrder(order)

    // Clear cart only if it was a cart checkout
    if (checkoutMode === 'cart') {
      // Remove only the selected items from cart
      checkoutItems.forEach(item => {
        // This would need to be implemented in cart context
        // For now, we'll clear the entire cart
      })
      clearCart()
    }

    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
    })

    router.push("/")
    setIsProcessing(false)
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">No items to checkout</h1>
            <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold gradient-text mb-8 text-center"
          >
            {checkoutMode === 'buyNow' ? 'Quick Checkout' : 'Checkout'}
          </motion.h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Information */}
                <Card className="glass-effect border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" required className="bg-gray-800 border-gray-700" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        defaultValue={user?.email || ""}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" required className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" required className="bg-gray-800 border-gray-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="glass-effect border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required className="bg-gray-800 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" required className="bg-gray-800 border-gray-700" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" required className="bg-gray-800 border-gray-700" />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-effect border-gray-800 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white">
                    Order Summary
                    {checkoutMode === 'buyNow' && (
                      <span className="text-sm font-normal text-purple-400 ml-2">(Quick Purchase)</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checkoutItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{item.product.name}</h4>
                        <p className="text-xs text-gray-400">
                          {item.selectedColor} • {item.selectedSize} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-white font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <Separator className="bg-gray-700" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Tax</span>
                      <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="gradient-text">${(getTotalPrice() * 1.08).toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
