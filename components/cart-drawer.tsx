"use client"

import { X, Plus, Minus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/contexts/cart-context"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function CartDrawer() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    isOpen, 
    setIsOpen,
    toggleItemSelection,
    selectAllItems,
    getSelectedItems,
    getSelectedTotalPrice,
    getSelectedTotalItems
  } = useCart()

  const selectedItems = getSelectedItems()
  const hasSelectedItems = selectedItems.length > 0
  const allItemsSelected = items.length > 0 && selectedItems.length === items.length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-gray-900 border-l border-gray-800 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold">Shopping Cart</h2>
                {items.length > 0 && (
                  <span className="text-sm text-gray-400">({items.length} items)</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allItemsSelected}
                      onCheckedChange={(checked) => selectAllItems(!!checked)}
                      className="border-gray-600"
                    />
                    <span className="text-sm text-gray-300">Select All</span>
                  </div>
                  {hasSelectedItems && (
                    <span className="text-sm text-purple-400">
                      {getSelectedTotalItems()} selected
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-effect p-4 rounded-lg border-2 transition-colors ${
                        item.selected ? 'border-purple-500/50 bg-purple-500/5' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <Checkbox
                          checked={item.selected || false}
                          onCheckedChange={() => toggleItemSelection(item.product.id, item.selectedColor, item.selectedSize)}
                          className="border-gray-600 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-sm">{item.product.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                              className="text-red-400 hover:text-red-300 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mb-3 ml-7">
                        Color: {item.selectedColor} | Size: {item.selectedSize}
                      </div>

                      <div className="flex items-center justify-between ml-7">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)
                            }
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)
                            }
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {hasSelectedItems && (
              <div className="p-6 border-t border-gray-800">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Selected items ({getSelectedTotalItems()}):</span>
                    <span>${getSelectedTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold gradient-text">${getSelectedTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Checkout Selected Items
                  </Button>
                </Link>
              </div>
            )}

            {items.length > 0 && !hasSelectedItems && (
              <div className="p-6 border-t border-gray-800">
                <p className="text-center text-gray-400 text-sm mb-4">
                  Select items to checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
