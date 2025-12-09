import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";

const OrderSuccess = memo(() => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);

  const accentStyle = {
    backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
  };

  useEffect(() => {
    // Trigger confetti after mount
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="relative mb-8"
        >
          {/* Animated Rings */}
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
            }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeOut",
              delay: 0.5,
            }}
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
            }}
          />

          {/* Main Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.3,
            }}
            className="relative flex h-28 w-28 items-center justify-center rounded-full text-white"
            style={accentStyle}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5,
              }}
            >
              <CheckCircle2 className="h-14 w-14" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Your items will be ready soon at your gym. Pay on delivery.
          </p>
        </motion.div>

        {/* Order Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-sm"
        >
          <GlassCard className="p-6 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl mx-auto mb-4"
              style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%, 0.1)` }}
            >
              <ShoppingBag className="h-7 w-7" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              Pick up at your gym
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll notify you when your order is ready for pickup. Thank you for shopping with us!
            </p>
          </GlassCard>
        </motion.div>

        {/* Confetti Particles */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: "50vw",
                  y: "30vh",
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: "easeOut",
                }}
                className="absolute h-3 w-3 rounded-full"
                style={{
                  backgroundColor: [
                    `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
                    "#FFD700",
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                  ][i % 5],
                }}
              />
            ))}
          </div>
        )}

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full max-w-sm mt-8"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
            style={accentStyle}
          >
            <Home className="h-5 w-5" />
            Back to Home
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/shop")}
            className="w-full mt-3 py-4 rounded-2xl border-2 border-border text-foreground font-medium flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    </PageTransition>
  );
});

OrderSuccess.displayName = "OrderSuccess";

export default OrderSuccess;
