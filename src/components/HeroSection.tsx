import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { motion } from "framer-motion";
import { ArrowRight, Receipt, Users, TrendingUp, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

export function HeroSection({ onGetStarted, isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-8 text-center">
        <AnimatedGroup className="space-y-8">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Trusted by thousands of users worldwide
          </motion.div>

          {/* Main Headline */}
          <div className="space-y-4">
            <TextEffect
              as="h1"
              className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight"
            >
              Split expenses.
            </TextEffect>
            <TextEffect
              as="h1"
              className="text-6xl md:text-7xl font-bold text-gray-600 tracking-tight leading-tight"
            >
              Stay friends.
            </TextEffect>
          </div>

          {/* Subtitle */}
          <TextEffect
            as="p"
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            The simplest way to track shared expenses with roommates, family, and friends. 
            Real-time balances, receipt uploads, and automatic settlement calculations.
          </TextEffect>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg group transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Tracking"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg border-2 hover:bg-gray-50 transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Feature Icons */}
          <div className="flex justify-center items-center gap-8 pt-12">
            {[
              { icon: Users, label: "Group Management" },
              { icon: Receipt, label: "Expense Tracking" },
              { icon: TrendingUp, label: "Real-time Insights" }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                className="flex flex-col items-center gap-2 text-gray-600"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedGroup>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
}
