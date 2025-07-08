"use client"

import type React from "react"

import { motion } from "framer-motion"
import { User, ArrowRight, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"
import { useUserManagement } from "@/contexts/user-management-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { login, user } = useAuth()
  const { users, addUser } = useUserManagement()
  const router = useRouter()
  const { toast } = useToast()

  const [isSignUp, setIsSignUp] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  if (user) {
    router.push("/")
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(loginData.email, loginData.password)

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back to LookLush!",
      })
      router.push("/")
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === signUpData.email)
    if (existingUser) {
      toast({
        title: "Account already exists",
        description: "An account with this email already exists. Please login instead.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Create new user account
    try {
      addUser({
        email: signUpData.email,
        password: signUpData.password,
        isAdmin: false,
        isActive: true,
      })

      toast({
        title: "Account created successfully!",
        description: "Your account has been created. You can now login.",
      })

      // Reset form and switch to login
      setSignUpData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
      })
      setIsSignUp(false)
      setLoginData({
        email: signUpData.email,
        password: "",
      })
    } catch (error) {
      toast({
        title: "Account creation failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="glass-effect border-gray-800">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`w-16 h-16 bg-gradient-to-r ${
                    isSignUp ? "from-green-500 to-emerald-500" : "from-purple-500 to-pink-500"
                  } rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {isSignUp ? <UserPlus className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                </motion.div>
                <CardTitle className="text-2xl gradient-text">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
                <p className="text-gray-400">
                  {isSignUp ? "Join LookLush and start your style journey" : "Sign in to your LookLush account"}
                </p>
              </CardHeader>
              <CardContent>
                {!isSignUp ? (
                  // Login Form
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter your password"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                ) : (
                  // Sign Up Form
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        minLength={6}
                        className="bg-gray-800 border-gray-700"
                        placeholder="Create a password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        className="bg-gray-800 border-gray-700"
                        placeholder="Confirm your password"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                      <UserPlus className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {/* Toggle between Login and Sign Up */}
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm mb-3">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      // Reset forms when switching
                      setLoginData({ email: "", password: "" })
                      setSignUpData({ email: "", password: "", confirmPassword: "", fullName: "" })
                    }}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                  >
                    {isSignUp ? "Sign In Instead" : "Create New Account"}
                  </Button>
                </div>

                {/* Demo Accounts Section - Only show on login */}
                {!isSignUp && (
                  <div className="mt-6 p-4 glass-effect rounded-lg">
                    <h3 className="text-sm font-medium text-white mb-2">Demo Accounts:</h3>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>
                        <strong>Admin:</strong> admin@looklush.com / admin123
                      </p>
                      <p>
                        <strong>Customer:</strong> user@example.com / user123
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
