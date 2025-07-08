"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Product {
  id: string
  sku: string
  name: string
  price: number
  minPrice: number
  maxPrice: number
  description: string
  category: string
  colors: string[]
  sizes: string[]
  inStock: boolean
  stockQuantity: number
  images: string[]
}

interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "sku"> & { sku?: string }) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
  updateStock: (id: string, quantity: number) => void
  generateSKU: () => string
  isSkuUnique: (sku: string, excludeId?: string) => boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Function to generate unique SKU
const generateUniqueSKU = (existingProducts: Product[] = []): string => {
  const generateRandomSKU = (): string => {
    const prefix = "LLX" // LookLush prefix
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = prefix + "-"

    // Generate 3 letters
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * 26)) // Only letters for first part
    }

    result += "-"

    // Generate 3 numbers
    for (let i = 0; i < 3; i++) {
      result += Math.floor(Math.random() * 10).toString()
    }

    return result
  }

  let sku = generateRandomSKU()
  let attempts = 0
  const maxAttempts = 100

  // Ensure uniqueness
  while (existingProducts.some((p) => p.sku === sku) && attempts < maxAttempts) {
    sku = generateRandomSKU()
    attempts++
  }

  return sku
}

const initialProducts: Product[] = [
  {
    id: "1",
    sku: "LLX-DRS-001",
    name: "Midnight Elegance Dress",
    price: 299,
    minPrice: 250,
    maxPrice: 400,
    description: "A stunning black dress perfect for evening occasions",
    category: "Dresses",
    colors: ["black", "navy", "burgundy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true,
    stockQuantity: 25,
    images: [
      "/placeholder.svg?height=600&width=400&text=Dress+Front",
      "/placeholder.svg?height=600&width=400&text=Dress+Back",
      "/placeholder.svg?height=600&width=400&text=Dress+Detail",
    ],
  },
  {
    id: "2",
    sku: "LLX-BLZ-002",
    name: "Urban Chic Blazer",
    price: 199,
    minPrice: 150,
    maxPrice: 300,
    description: "Modern blazer for the contemporary professional",
    category: "Blazers",
    colors: ["black", "charcoal", "navy"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    stockQuantity: 15,
    images: [
      "/placeholder.svg?height=600&width=400&text=Blazer+Front",
      "/placeholder.svg?height=600&width=400&text=Blazer+Side",
    ],
  },
  {
    id: "3",
    sku: "LLX-ACC-003",
    name: "Luxury Silk Scarf",
    price: 89,
    minPrice: 60,
    maxPrice: 120,
    description: "Premium silk scarf with elegant patterns",
    category: "Accessories",
    colors: ["black", "gold", "silver"],
    sizes: ["One Size"],
    inStock: true,
    stockQuantity: 50,
    images: ["/placeholder.svg?height=400&width=400&text=Scarf+Pattern"],
  },
]

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts)
      // Ensure all products have SKUs (for backward compatibility)
      const productsWithSKUs = parsedProducts.map((product: any) => ({
        ...product,
        sku: product.sku || generateUniqueSKU(parsedProducts),
      }))
      setProducts(productsWithSKUs)
      localStorage.setItem("products", JSON.stringify(productsWithSKUs))
    } else {
      setProducts(initialProducts)
      localStorage.setItem("products", JSON.stringify(initialProducts))
    }
  }, [])

  const generateSKU = (): string => {
    return generateUniqueSKU(products)
  }

  const isSkuUnique = (sku: string, excludeId?: string): boolean => {
    return !products.some((p) => p.sku === sku && p.id !== excludeId)
  }

  const addProduct = (productData: Omit<Product, "id" | "sku"> & { sku?: string }) => {
    const sku = productData.sku && productData.sku.trim() ? productData.sku.trim() : generateUniqueSKU(products)

    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      sku,
    }

    const updatedProducts = [...products, newProduct]
    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
  }

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    const updatedProducts = products.map((product) => (product.id === id ? { ...product, ...updatedProduct } : product))
    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
  }

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id)
    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
  }

  const getProduct = (id: string) => {
    return products.find((product) => product.id === id)
  }

  const updateStock = (id: string, quantity: number) => {
    const updatedProducts = products.map((product) =>
      product.id === id
        ? {
            ...product,
            stockQuantity: Math.max(0, quantity),
            inStock: quantity > 0,
          }
        : product,
    )
    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        updateStock,
        generateSKU,
        isSkuUnique,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
