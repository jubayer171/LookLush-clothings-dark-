"use client"

import Link from "next/link"
import { ShoppingBag, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { AccountDropdown } from "@/components/account-dropdown"
import { motion } from "framer-motion"

export function Navbar() {
  const { user } = useAuth()
  const { getTotalItems, setIsOpen } = useCart()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold gradient-text">
          LookLush
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="hover:text-purple-400 transition-colors">
            Products
          </Link>
          <Link href="/about" className="hover:text-purple-400 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-purple-400 transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <AccountDropdown />
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:text-purple-400">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="relative hover:text-purple-400">
            <ShoppingBag className="w-5 h-5" />
            {getTotalItems() > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {getTotalItems()}
              </motion.span>
            )}
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
