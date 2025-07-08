"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Package, ShoppingCart, Upload, X, Mail, Users, Copy, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/contexts/auth-context"
import { useProducts, type Product } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useContact } from "@/contexts/contact-context"
import { useMessages } from "@/contexts/messages-context"
import { useUserManagement } from "@/contexts/user-management-context"
import { useAuditLog } from "@/contexts/audit-log-context"

export default function AdminPage() {
  const { user } = useAuth()
  const { products, addProduct, updateProduct, deleteProduct, updateStock, generateSKU, isSkuUnique } = useProducts()
  const { items } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const { contactInfo, updateContactInfo } = useContact()
  const { messages, markAsRead, deleteMessage, getUnreadCount } = useMessages()
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useUserManagement()
  const { logs, addLog, clearLogs, getLogsByCategory } = useAuditLog()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    price: "",
    minPrice: "",
    maxPrice: "",
    description: "",
    category: "",
    colors: "",
    sizes: "",
    inStock: true,
    stockQuantity: "",
    images: [] as string[],
  })

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState("all") // all, in-stock, out-of-stock, low-stock
  const [priceFilter, setPriceFilter] = useState("all") // all, under-100, 100-300, over-300
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name") // name, price, stock, date-added
  const [sortOrder, setSortOrder] = useState("asc") // asc, desc
  const [showFilters, setShowFilters] = useState(false)

  const [contactFormData, setContactFormData] = useState({
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    instagram: "",
    twitter: "",
    facebook: "",
    weekdays: "",
    weekends: "",
  })
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isMessagesDialogOpen, setIsMessagesDialogOpen] = useState(false)
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    isAdmin: false,
    isActive: true,
  })
  const [isAuditLogDialogOpen, setIsAuditLogDialogOpen] = useState(false)
  const [selectedLogCategory, setSelectedLogCategory] = useState<string>("all")

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    setContactFormData({
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: contactInfo.address,
      city: contactInfo.city,
      state: contactInfo.state,
      zipCode: contactInfo.zipCode,
      instagram: contactInfo.socialMedia.instagram,
      twitter: contactInfo.socialMedia.twitter,
      facebook: contactInfo.socialMedia.facebook,
      weekdays: contactInfo.businessHours.weekdays,
      weekends: contactInfo.businessHours.weekends,
    })
  }, [contactInfo])

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))]
    return uniqueCategories.sort()
  }, [products])

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search filter (SKU, name, description)
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)

      // Stock filter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && product.stockQuantity > 5) ||
        (stockFilter === "low-stock" && product.stockQuantity > 0 && product.stockQuantity <= 5) ||
        (stockFilter === "out-of-stock" && product.stockQuantity === 0)

      // Price filter
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-100" && product.price < 100) ||
        (priceFilter === "100-300" && product.price >= 100 && product.price <= 300) ||
        (priceFilter === "over-300" && product.price > 300)

      // Category filter
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

      return matchesSearch && matchesStock && matchesPrice && matchesCategory
    })

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          comparison = a.price - b.price
          break
        case "stock":
          comparison = a.stockQuantity - b.stockQuantity
          break
        case "date-added":
          comparison = Number.parseInt(a.id) - Number.parseInt(b.id) // Using ID as proxy for date added
          break
        case "sku":
          comparison = a.sku.localeCompare(b.sku)
          break
        default:
          comparison = 0
      }

      return sortOrder === "desc" ? -comparison : comparison
    })

    return filtered
  }, [products, searchQuery, stockFilter, priceFilter, categoryFilter, sortBy, sortOrder])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setStockFilter("all")
    setPriceFilter("all")
    setCategoryFilter("all")
    setSortBy("name")
    setSortOrder("asc")
  }

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (stockFilter !== "all") count++
    if (priceFilter !== "all") count++
    if (categoryFilter !== "all") count++
    if (sortBy !== "name" || sortOrder !== "asc") count++
    return count
  }, [searchQuery, stockFilter, priceFilter, categoryFilter, sortBy, sortOrder])

  if (!user || !user.isAdmin) {
    return null
  }

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      price: "",
      minPrice: "",
      maxPrice: "",
      description: "",
      category: "",
      colors: "",
      sizes: "",
      inStock: true,
      stockQuantity: "",
      images: [],
    })
    setEditingProduct(null)
    setNewImageUrl("")
  }

  const generateNewSKU = () => {
    const newSKU = generateSKU()
    setFormData({ ...formData, sku: newSKU })
  }

  const copySKU = (sku: string) => {
    navigator.clipboard.writeText(sku)
    toast({
      title: "SKU Copied",
      description: `SKU "${sku}" has been copied to clipboard.`,
    })
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] })
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
  }

  const addPlaceholderImage = () => {
    const placeholderUrl = `/placeholder.svg?height=600&width=400&text=Product+Image+${formData.images.length + 1}`
    setFormData({ ...formData, images: [...formData.images, placeholderUrl] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const price = Number.parseFloat(formData.price)
    const minPrice = Number.parseFloat(formData.minPrice)
    const maxPrice = Number.parseFloat(formData.maxPrice)

    if (price < minPrice || price > maxPrice) {
      toast({
        title: "Invalid price",
        description: `Price must be between $${minPrice} and $${maxPrice}`,
        variant: "destructive",
      })
      return
    }

    // Validate SKU uniqueness
    if (formData.sku && !isSkuUnique(formData.sku, editingProduct?.id)) {
      toast({
        title: "SKU already exists",
        description: "This SKU is already in use. Please choose a different one.",
        variant: "destructive",
      })
      return
    }

    const productData = {
      sku: formData.sku,
      name: formData.name,
      price,
      minPrice,
      maxPrice,
      description: formData.description,
      category: formData.category,
      colors: formData.colors.split(",").map((c) => c.trim()),
      sizes: formData.sizes.split(",").map((s) => s.trim()),
      inStock: formData.inStock,
      stockQuantity: Number.parseInt(formData.stockQuantity),
      images: formData.images,
    }

    if (editingProduct) {
      const oldProduct = products.find((p) => p.id === editingProduct.id)
      updateProduct(editingProduct.id, productData)

      // Log the changes
      const changes = []
      if (oldProduct?.sku !== productData.sku)
        changes.push({ field: "sku", oldValue: oldProduct?.sku, newValue: productData.sku })
      if (oldProduct?.name !== productData.name)
        changes.push({ field: "name", oldValue: oldProduct?.name, newValue: productData.name })
      if (oldProduct?.price !== productData.price)
        changes.push({ field: "price", oldValue: oldProduct?.price, newValue: productData.price })
      if (oldProduct?.stockQuantity !== productData.stockQuantity)
        changes.push({ field: "stock", oldValue: oldProduct?.stockQuantity, newValue: productData.stockQuantity })

      addLog({
        adminEmail: user.email,
        adminId: user.id,
        action: "Product Updated",
        category: "product",
        details: {
          itemId: editingProduct.id,
          itemName: productData.name,
          changes,
          description: `Updated product "${productData.name}" (SKU: ${productData.sku})`,
        },
      })

      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      })
    } else {
      addProduct(productData)

      addLog({
        adminEmail: user.email,
        adminId: user.id,
        action: "Product Added",
        category: "product",
        details: {
          itemName: productData.name,
          description: `Added new product "${productData.name}" with SKU: ${productData.sku || "Auto-generated"} and price $${productData.price}`,
        },
      })

      toast({
        title: "Product added",
        description: "New product has been added successfully.",
      })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku || "",
      name: product.name,
      price: product.price?.toString() ?? "",
      minPrice: product.minPrice !== undefined ? product.minPrice.toString() : "",
      maxPrice: product.maxPrice !== undefined ? product.maxPrice.toString() : "",
      description: product.description ?? "",
      category: product.category ?? "",
      colors: (product.colors ?? []).join(", "),
      sizes: (product.sizes ?? []).join(", "),
      inStock: product.inStock ?? true,
      stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity.toString() : "0",
      images: product.images ?? [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id)
    deleteProduct(id)

    addLog({
      adminEmail: user.email,
      adminId: user.id,
      action: "Product Deleted",
      category: "product",
      details: {
        itemId: id,
        itemName: product?.name || "Unknown Product",
        description: `Deleted product "${product?.name || "Unknown Product"}" (SKU: ${product?.sku})`,
      },
    })

    toast({
      title: "Product deleted",
      description: "Product has been deleted successfully.",
    })
  }

  const handleStockUpdate = (id: string, newStock: number) => {
    const product = products.find((p) => p.id === id)
    const oldStock = product?.stockQuantity || 0

    updateStock(id, newStock)

    addLog({
      adminEmail: user.email,
      adminId: user.id,
      action: "Stock Updated",
      category: "stock",
      details: {
        itemId: id,
        itemName: product?.name || "Unknown Product",
        changes: [{ field: "stock", oldValue: oldStock, newValue: newStock }],
        description: `Updated stock for "${product?.name}" (SKU: ${product?.sku}) from ${oldStock} to ${newStock}`,
      },
    })

    toast({
      title: "Stock updated",
      description: "Stock quantity has been updated successfully.",
    })
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const oldContactInfo = { ...contactInfo }

    updateContactInfo({
      email: contactFormData.email,
      phone: contactFormData.phone,
      address: contactFormData.address,
      city: contactFormData.city,
      state: contactFormData.state,
      zipCode: contactFormData.zipCode,
      socialMedia: {
        instagram: contactFormData.instagram,
        twitter: contactFormData.twitter,
        facebook: contactFormData.facebook,
      },
      businessHours: {
        weekdays: contactFormData.weekdays,
        weekends: contactFormData.weekends,
      },
    })

    const changes = []
    if (oldContactInfo.email !== contactFormData.email)
      changes.push({ field: "email", oldValue: oldContactInfo.email, newValue: contactFormData.email })
    if (oldContactInfo.phone !== contactFormData.phone)
      changes.push({ field: "phone", oldValue: oldContactInfo.phone, newValue: contactFormData.phone })
    if (oldContactInfo.address !== contactFormData.address)
      changes.push({ field: "address", oldValue: oldContactInfo.address, newValue: contactFormData.address })

    addLog({
      adminEmail: user.email,
      adminId: user.id,
      action: "Contact Info Updated",
      category: "contact",
      details: {
        changes,
        description: "Updated store contact information",
      },
    })

    toast({
      title: "Contact info updated",
      description: "Contact information has been updated successfully.",
    })

    setIsContactDialogOpen(false)
  }

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) return { text: "Out of Stock", color: "bg-red-500/20 text-red-400" }
    if (stockQuantity <= 5) return { text: "Low Stock", color: "bg-yellow-500/20 text-yellow-400" }
    return { text: "In Stock", color: "bg-green-500/20 text-green-400" }
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()

    const existingUser = users.find((u) => u.email === userFormData.email)
    if (existingUser) {
      toast({
        title: "User already exists",
        description: "A user with this email already exists.",
        variant: "destructive",
      })
      return
    }

    addUser({
      email: userFormData.email,
      password: userFormData.password,
      isAdmin: userFormData.isAdmin,
      isActive: userFormData.isActive,
    })

    addLog({
      adminEmail: user.email,
      adminId: user.id,
      action: "User Created",
      category: "user",
      details: {
        itemName: userFormData.email,
        description: `Created new ${userFormData.isAdmin ? "admin" : "customer"} account for ${userFormData.email}`,
      },
    })

    toast({
      title: "User created",
      description: "New user has been created successfully.",
    })

    setIsCreateUserDialogOpen(false)
    setUserFormData({ email: "", password: "", isAdmin: false, isActive: true })
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === "1") {
      toast({
        title: "Cannot delete",
        description: "Cannot delete the main admin account.",
        variant: "destructive",
      })
      return
    }

    const userToDelete = users.find((u) => u.id === userId)
    deleteUser(userId)

    addLog({
      adminEmail: user.email,
      adminId: user.id,
      action: "User Deleted",
      category: "user",
      details: {
        itemId: userId,
        itemName: userToDelete?.email || "Unknown User",
        description: `Deleted user account: ${userToDelete?.email}`,
      },
    })

    toast({
      title: "User deleted",
      description: "User has been deleted successfully.",
    })
  }

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Unread Messages",
      value: getUnreadCount(),
      icon: Mail,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Admin Actions",
      value: logs.length,
      icon: ShoppingCart,
      color: "from-yellow-500 to-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <CartDrawer />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your LookLush store inventory</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                      >
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Products Management */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-effect border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Inventory Management</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={resetForm}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* SKU Field */}
                      <div>
                        <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                            className="bg-gray-800 border-gray-700"
                            placeholder="Leave empty for auto-generation or enter custom SKU"
                          />
                          <Button
                            type="button"
                            onClick={generateNewSKU}
                            variant="outline"
                            className="border-gray-700 bg-transparent whitespace-nowrap"
                          >
                            Generate SKU
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Format: LLX-ABC-123 (Leave empty for automatic generation)
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                            placeholder="e.g., Dresses, Blazers, Accessories"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="price">Current Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="minPrice">Min Price ($)</Label>
                          <Input
                            id="minPrice"
                            type="number"
                            step="0.01"
                            value={formData.minPrice}
                            onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxPrice">Max Price ($)</Label>
                          <Input
                            id="maxPrice"
                            type="number"
                            step="0.01"
                            value={formData.maxPrice}
                            onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="colors">Colors (comma separated)</Label>
                          <Input
                            id="colors"
                            value={formData.colors}
                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                            placeholder="black, navy, burgundy"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sizes">Sizes (comma separated)</Label>
                          <Input
                            id="sizes"
                            value={formData.sizes}
                            onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                            placeholder="XS, S, M, L, XL"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="stockQuantity">Stock Quantity</Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inStock">Stock Status</Label>
                          <Select
                            value={formData.inStock.toString()}
                            onValueChange={(value) => setFormData({ ...formData, inStock: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">In Stock</SelectItem>
                              <SelectItem value="false">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Image Management */}
                      <div className="space-y-4">
                        <Label>Product Images</Label>

                        {/* Add Image URL */}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter image URL"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button
                            type="button"
                            onClick={addImage}
                            variant="outline"
                            className="border-gray-700 bg-transparent"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Add URL
                          </Button>
                          <Button
                            type="button"
                            onClick={addPlaceholderImage}
                            variant="outline"
                            className="border-gray-700 bg-transparent"
                          >
                            Add Placeholder
                          </Button>
                        </div>

                        {/* Image Preview */}
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-700"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {editingProduct ? "Update Product" : "Add Product"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="border-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Section */}
                <div className="space-y-4 mb-6">
                  {/* Search Bar */}
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by SKU, name, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="border-gray-700 bg-transparent"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-2 bg-purple-500/20 text-purple-400">{activeFilterCount}</Badge>
                      )}
                    </Button>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" onClick={clearFilters} className="text-gray-400 hover:text-white">
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Filter Options */}
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass-effect p-4 rounded-lg border border-gray-700"
                    >
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Stock Filter */}
                        <div>
                          <Label className="text-sm text-gray-300">Stock Status</Label>
                          <Select value={stockFilter} onValueChange={setStockFilter}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Stock</SelectItem>
                              <SelectItem value="in-stock">In Stock (5+)</SelectItem>
                              <SelectItem value="low-stock">Low Stock (1-5)</SelectItem>
                              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Price Filter */}
                        <div>
                          <Label className="text-sm text-gray-300">Price Range</Label>
                          <Select value={priceFilter} onValueChange={setPriceFilter}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Prices</SelectItem>
                              <SelectItem value="under-100">Under $100</SelectItem>
                              <SelectItem value="100-300">$100 - $300</SelectItem>
                              <SelectItem value="over-300">Over $300</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Category Filter */}
                        <div>
                          <Label className="text-sm text-gray-300">Category</Label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort By */}
                        <div>
                          <Label className="text-sm text-gray-300">Sort By</Label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="sku">SKU</SelectItem>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="stock">Stock</SelectItem>
                              <SelectItem value="date-added">Date Added</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort Order */}
                        <div>
                          <Label className="text-sm text-gray-300">Order</Label>
                          <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Results Summary */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>
                      Showing {filteredProducts.length} of {products.length} products
                    </span>
                    {searchQuery && <span>Search results for "{searchQuery}"</span>}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-300">Product</TableHead>
                        <TableHead className="text-gray-300">SKU</TableHead>
                        <TableHead className="text-gray-300">Category</TableHead>
                        <TableHead className="text-gray-300">Price Range</TableHead>
                        <TableHead className="text-gray-300">Stock</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                            {searchQuery || activeFilterCount > 0
                              ? "No products match your search criteria"
                              : "No products found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => {
                          const stockStatus = getStockStatus(product.stockQuantity)
                          return (
                            <TableRow key={product.id} className="border-gray-800">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                      <img
                                        src={product.images[0] || "/placeholder.svg"}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                        {product.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium">{product.name}</div>
                                    <div className="text-gray-400 text-sm">${product.price}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-purple-400 font-mono">
                                    {product.sku}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copySKU(product.sku)}
                                    className="text-gray-400 hover:text-white p-1 h-6 w-6"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-400">{product.category}</TableCell>
                              <TableCell className="text-gray-400">
                                ${product.minPrice} - ${product.maxPrice}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={product.stockQuantity !== undefined ? product.stockQuantity.toString() : ""}
                                    onChange={(e) =>
                                      handleStockUpdate(product.id, Number.parseInt(e.target.value, 10) || 0)
                                    }
                                    className="w-20 h-8 bg-gray-800 border-gray-700 text-center"
                                  />
                                  <span className="text-gray-400 text-sm">units</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(product)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info Management */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-effect border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Contact Information</CardTitle>
                <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Contact Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Contact Information</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact-email">Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={contactFormData.email}
                            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact-phone">Phone</Label>
                          <Input
                            id="contact-phone"
                            value={contactFormData.phone}
                            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contact-address">Address</Label>
                        <Input
                          id="contact-address"
                          value={contactFormData.address}
                          onChange={(e) => setContactFormData({ ...contactFormData, address: e.target.value })}
                          required
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="contact-city">City</Label>
                          <Input
                            id="contact-city"
                            value={contactFormData.city}
                            onChange={(e) => setContactFormData({ ...contactFormData, city: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact-state">State</Label>
                          <Input
                            id="contact-state"
                            value={contactFormData.state}
                            onChange={(e) => setContactFormData({ ...contactFormData, state: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact-zip">ZIP Code</Label>
                          <Input
                            id="contact-zip"
                            value={contactFormData.zipCode}
                            onChange={(e) => setContactFormData({ ...contactFormData, zipCode: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Social Media</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="contact-instagram">Instagram</Label>
                            <Input
                              id="contact-instagram"
                              value={contactFormData.instagram}
                              onChange={(e) => setContactFormData({ ...contactFormData, instagram: e.target.value })}
                              placeholder="@username"
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact-twitter">Twitter</Label>
                            <Input
                              id="contact-twitter"
                              value={contactFormData.twitter}
                              onChange={(e) => setContactFormData({ ...contactFormData, twitter: e.target.value })}
                              placeholder="@username"
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact-facebook">Facebook</Label>
                            <Input
                              id="contact-facebook"
                              value={contactFormData.facebook}
                              onChange={(e) => setContactFormData({ ...contactFormData, facebook: e.target.value })}
                              placeholder="PageName"
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Business Hours</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contact-weekdays">Weekdays (Mon-Fri)</Label>
                            <Input
                              id="contact-weekdays"
                              value={contactFormData.weekdays}
                              onChange={(e) => setContactFormData({ ...contactFormData, weekdays: e.target.value })}
                              placeholder="9:00 AM - 8:00 PM"
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact-weekends">Weekends (Sat-Sun)</Label>
                            <Input
                              id="contact-weekends"
                              value={contactFormData.weekends}
                              onChange={(e) => setContactFormData({ ...contactFormData, weekends: e.target.value })}
                              placeholder="10:00 AM - 6:00 PM"
                              className="bg-gray-800 border-gray-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          Update Contact Info
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsContactDialogOpen(false)}
                          className="border-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Contact Details</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-400">
                          Email: <span className="text-white">{contactInfo.email}</span>
                        </p>
                        <p className="text-gray-400">
                          Phone: <span className="text-white">{contactInfo.phone}</span>
                        </p>
                        <p className="text-gray-400">
                          Address:{" "}
                          <span className="text-white">
                            {contactInfo.address}, {contactInfo.city}, {contactInfo.state} {contactInfo.zipCode}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Business Hours</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-400">
                          Weekdays: <span className="text-white">{contactInfo.businessHours.weekdays}</span>
                        </p>
                        <p className="text-gray-400">
                          Weekends: <span className="text-white">{contactInfo.businessHours.weekends}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Social Media</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-400">
                          Instagram: <span className="text-white">{contactInfo.socialMedia.instagram}</span>
                        </p>
                        <p className="text-gray-400">
                          Twitter: <span className="text-white">{contactInfo.socialMedia.twitter}</span>
                        </p>
                        <p className="text-gray-400">
                          Facebook: <span className="text-white">{contactInfo.socialMedia.facebook}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Messages Management */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="glass-effect border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Customer Messages
                  {getUnreadCount() > 0 && (
                    <Badge className="ml-2 bg-red-500/20 text-red-400">{getUnreadCount()} unread</Badge>
                  )}
                </CardTitle>
                <Dialog open={isMessagesDialogOpen} onOpenChange={setIsMessagesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      <Mail className="w-4 h-4 mr-2" />
                      View All Messages
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Customer Messages</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No messages yet</p>
                      ) : (
                        messages
                          .slice()
                          .reverse()
                          .map((message) => (
                            <div
                              key={message.id}
                              className={`glass-effect p-4 rounded-lg border ${
                                message.isRead ? "border-gray-700" : "border-blue-500/50"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-white">{message.name}</h4>
                                  <p className="text-sm text-gray-400">{message.email}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleDateString()}
                                  </span>
                                  {!message.isRead && <Badge className="bg-blue-500/20 text-blue-400">New</Badge>}
                                </div>
                              </div>
                              <h5 className="font-medium text-white mb-2">{message.subject}</h5>
                              <p className="text-gray-300 text-sm mb-3">{message.message}</p>
                              <div className="flex space-x-2">
                                {!message.isRead && (
                                  <Button
                                    size="sm"
                                    onClick={() => markAsRead(message.id)}
                                    className="bg-blue-500 hover:bg-blue-600"
                                  >
                                    Mark as Read
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteMessage(message.id)}
                                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages
                    .slice(-3)
                    .reverse()
                    .map((message) => (
                      <div key={message.id} className="glass-effect p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-white">{message.name}</h4>
                            <p className="text-sm text-gray-400">{message.subject}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleDateString()}
                            </span>
                            {!message.isRead && <Badge className="bg-blue-500/20 text-blue-400">New</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  {messages.length === 0 && <p className="text-gray-400 text-center py-4">No messages yet</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Management */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <Card className="glass-effect border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
                <div className="flex space-x-2">
                  <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                          <Label htmlFor="user-email">Email</Label>
                          <Input
                            id="user-email"
                            type="email"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-password">Password</Label>
                          <Input
                            id="user-password"
                            type="password"
                            value={userFormData.password}
                            onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                            required
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="user-admin">Account Type</Label>
                            <Select
                              value={userFormData.isAdmin.toString()}
                              onValueChange={(value) => setUserFormData({ ...userFormData, isAdmin: value === "true" })}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">Customer</SelectItem>
                                <SelectItem value="true">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="user-status">Status</Label>
                            <Select
                              value={userFormData.isActive.toString()}
                              onValueChange={(value) =>
                                setUserFormData({ ...userFormData, isActive: value === "true" })
                              }
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex space-x-4 pt-4">
                          <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          >
                            Create User
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateUserDialogOpen(false)}
                            className="border-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>User Management</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-800">
                              <TableHead className="text-gray-300">Email</TableHead>
                              <TableHead className="text-gray-300">Type</TableHead>
                              <TableHead className="text-gray-300">Status</TableHead>
                              <TableHead className="text-gray-300">Created</TableHead>
                              <TableHead className="text-gray-300">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id} className="border-gray-800">
                                <TableCell className="text-white">{user.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      user.isAdmin ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                    }
                                  >
                                    {user.isAdmin ? "Admin" : "Customer"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                    }
                                  >
                                    {user.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleUserStatus(user.id)}
                                      className="text-blue-400 hover:text-blue-300"
                                    >
                                      {user.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-400 hover:text-red-300"
                                      disabled={user.id === "1"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-effect p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Total Users</h4>
                    <p className="text-2xl font-bold gradient-text">{users.length}</p>
                  </div>
                  <div className="glass-effect p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Active Users</h4>
                    <p className="text-2xl font-bold text-green-400">{users.filter((u) => u.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes History Section */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <Card className="glass-effect border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Changes History
                  <Badge className="ml-2 bg-blue-500/20 text-blue-400">{logs.length} total actions</Badge>
                </CardTitle>
                <div className="flex space-x-2">
                  <Dialog open={isAuditLogDialogOpen} onOpenChange={setIsAuditLogDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                        <Package className="w-4 h-4 mr-2" />
                        View All Changes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-6xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                          <span>Admin Changes History</span>
                          <div className="flex items-center space-x-2">
                            <Select value={selectedLogCategory} onValueChange={setSelectedLogCategory}>
                              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="product">Products</SelectItem>
                                <SelectItem value="stock">Stock Updates</SelectItem>
                                <SelectItem value="contact">Contact Info</SelectItem>
                                <SelectItem value="user">User Management</SelectItem>
                                <SelectItem value="message">Messages</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearLogs}
                              className="border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                            >
                              Clear History
                            </Button>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(selectedLogCategory === "all" ? logs : getLogsByCategory(selectedLogCategory))
                          .slice(0, 100)
                          .map((log) => (
                            <div key={log.id} className="glass-effect p-4 rounded-lg border border-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                  <Badge
                                    className={
                                      log.category === "product"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : log.category === "stock"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : log.category === "contact"
                                            ? "bg-green-500/20 text-green-400"
                                            : log.category === "user"
                                              ? "bg-purple-500/20 text-purple-400"
                                              : "bg-gray-500/20 text-gray-400"
                                    }
                                  >
                                    {log.category}
                                  </Badge>
                                  <h4 className="font-semibold text-white">{log.action}</h4>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">by {log.adminEmail}</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{log.details.description}</p>
                              {log.details.changes && log.details.changes.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium text-gray-400">Changes:</p>
                                  {log.details.changes.map((change, index) => (
                                    <div key={index} className="text-xs text-gray-500 ml-2">
                                      <span className="font-medium">{change.field}:</span>{" "}
                                      <span className="text-red-400">{String(change.oldValue)}</span> →{" "}
                                      <span className="text-green-400">{String(change.newValue)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        {(selectedLogCategory === "all" ? logs : getLogsByCategory(selectedLogCategory)).length ===
                          0 && <p className="text-gray-400 text-center py-8">No changes recorded yet</p>}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="glass-effect p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              log.category === "product"
                                ? "bg-blue-500/20 text-blue-400"
                                : log.category === "stock"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : log.category === "contact"
                                    ? "bg-green-500/20 text-green-400"
                                    : log.category === "user"
                                      ? "bg-purple-500/20 text-purple-400"
                                      : "bg-gray-500/20 text-gray-400"
                            }
                          >
                            {log.category}
                          </Badge>
                          <div>
                            <h4 className="font-medium text-white text-sm">{log.action}</h4>
                            <p className="text-xs text-gray-400">{log.details.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">by {log.adminEmail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-gray-400 text-center py-4">No changes recorded yet</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
