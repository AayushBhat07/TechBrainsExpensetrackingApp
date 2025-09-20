import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/HeroSection";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Receipt, 
  Users, 
  TrendingUp, 
  Bell, 
  Camera, 
  PieChart,
  ArrowRight,
  Check,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SplitWise</span>
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isAuthenticated ? "Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} isAuthenticated={isAuthenticated} />

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage shared expenses
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Designed for simplicity and built for real-time collaboration
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Group Management",
                description: "Create and manage groups for roommates, family, or friends. Invite members with simple codes.",
              },
              {
                icon: Receipt,
                title: "Expense Tracking",
                description: "Log expenses with categories, descriptions, and automatic split calculations.",
              },
              {
                icon: Camera,
                title: "Receipt Upload",
                description: "Snap photos of receipts to keep digital records of all your expenses.",
              },
              {
                icon: TrendingUp,
                title: "Real-time Balances",
                description: "See who owes what instantly with live balance updates and settlement suggestions.",
              },
              {
                icon: PieChart,
                title: "Spending Insights",
                description: "Analyze spending patterns by category with detailed monthly reports.",
              },
              {
                icon: Bell,
                title: "Payment Reminders",
                description: "Gentle reminders help ensure everyone settles their balances on time.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-gray-600 text-lg">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create or Join",
                description: "Start a new group or join an existing one with an invite code.",
              },
              {
                step: "2", 
                title: "Add Expenses",
                description: "Log shared expenses and choose how to split them among group members.",
              },
              {
                step: "3",
                title: "Settle Up",
                description: "View balances and settle debts with built-in payment tracking.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Stop the awkward money conversations
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                No more mental math, forgotten IOUs, or uncomfortable reminders. 
                SplitWise handles the complexity so you can focus on what matters.
              </p>
              <div className="space-y-4">
                {[
                  "Automatic balance calculations",
                  "Transparent expense history", 
                  "Fair settlement suggestions",
                  "Receipt storage and organization",
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center"
                  >
                    <Check className="w-5 h-5 text-gray-700 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="bg-white p-8 rounded-lg border border-gray-200 shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your balance</span>
                  <span className="text-2xl font-bold text-green-600">+$24.50</span>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full mr-3"></div>
                        <span className="text-gray-700">Alice owes you</span>
                      </div>
                      <span className="font-medium text-gray-900">$12.25</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full mr-3"></div>
                        <span className="text-gray-700">Bob owes you</span>
                      </div>
                      <span className="font-medium text-gray-900">$12.25</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to simplify your shared expenses?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who have made expense splitting effortless
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">SplitWise</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built with ❤️ for better shared living
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}