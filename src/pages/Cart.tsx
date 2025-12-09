import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";

const Cart = memo(() => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const accentStyle = {
    backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
  };

  const subtotal = getCartTotal();
  const deliveryCharges = 0; // Mock - free delivery
  const total = subtotal + deliveryCharges;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border p-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/shop")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Your Cart</h1>
              <p className="text-xs text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cart Items */}
        <div className="flex-1 p-4 space-y-4 pb-48">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full mb-4"
                style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%, 0.1)` }}
              >
                <ShoppingBag className="h-10 w-10" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Browse our products and add items to your cart
              </p>
              <Button
                onClick={() => navigate("/shop")}
                className="rounded-2xl px-6"
                style={accentStyle}
              >
                Continue Shopping
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                  >
                    <GlassCard className="p-3">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {item.product.category}
                          </p>
                          <motion.p
                            key={item.quantity}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="font-bold text-foreground mt-2"
                          >
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </motion.p>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-background"
                            >
                              <Minus className="h-3 w-3 text-foreground" />
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="w-6 text-center font-medium text-foreground text-sm"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                              style={accentStyle}
                            >
                              <Plus className="h-3 w-3" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Bottom Summary - Fixed */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 space-y-4"
          >
            <GlassCard className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-green-500">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-lg text-foreground"
                >
                  ${total.toFixed(2)}
                </motion.span>
              </div>
            </GlassCard>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleProceedToCheckout}
              className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg"
              style={accentStyle}
            >
              Proceed to Checkout
            </motion.button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
});

Cart.displayName = "Cart";

export default Cart;
