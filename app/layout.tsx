import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ProductProvider } from "@/contexts/product-context"
import { OrderProvider } from "@/contexts/order-context"
import { MessagesProvider } from "@/contexts/messages-context"
import { UserManagementProvider } from "@/contexts/user-management-context"
import { Toaster } from "@/components/ui/toaster"
import { ContactProvider } from "@/contexts/contact-context"
import { AuditLogProvider } from "@/contexts/audit-log-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LookLush - Modern Fashion Store",
  description: "Discover the latest trends in fashion",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <AuthProvider>
          <AuditLogProvider>
            <ContactProvider>
              <MessagesProvider>
                <UserManagementProvider>
                  <ProductProvider>
                    <OrderProvider>
                      <CartProvider>
                        {children}
                        <Toaster />
                      </CartProvider>
                    </OrderProvider>
                  </ProductProvider>
                </UserManagementProvider>
              </MessagesProvider>
            </ContactProvider>
          </AuditLogProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
