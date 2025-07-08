"use client"

import { motion } from "framer-motion"
import { ArrowRight, Star, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { CartDrawer } from "@/components/cart-drawer"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <CartDrawer />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 gradient-text">LookLush</h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Style. Elegance. Comfort.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-4 group"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose LookLush?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience fashion like never before with our premium quality and exceptional service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Star,
                title: "Premium Quality",
                description: "Crafted with the finest materials and attention to detail",
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                icon: Zap,
                title: "Fast Delivery",
                description: "Lightning-fast shipping to get your style delivered quickly",
                gradient: "from-blue-400 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Secure Shopping",
                description: "Your data and payments are protected with enterprise-grade security",
                gradient: "from-green-400 to-emerald-500",
              },
              {
                icon: Star,
                title: "Unique Designs",
                description: "Exclusive pieces that make you stand out from the crowd",
                gradient: "from-purple-400 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center glass-effect p-6 rounded-xl hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto text-center"
          >
            {[
              { number: "10K+", label: "Happy Customers" },
              { number: "500+", label: "Premium Products" },
              { number: "50+", label: "Countries Served" },
            ].map((stat, index) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">{stat.number}</div>
                <div className="text-gray-400 text-base sm:text-lg">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="container mx-auto text-center"
        >
          <div className="glass-effect p-8 sm:p-12 rounded-2xl max-w-3xl mx-auto border border-purple-500/20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Ready to Transform Your Style?
            </h2>
            <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
              Join thousands of fashion enthusiasts who trust LookLush for their style needs. Discover your perfect look
              today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4"
                >
                  Start Shopping Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent px-8 py-4"
                >
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
