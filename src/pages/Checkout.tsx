import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ChevronRight,
  Check,
  Package,
  FileText,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart, Address } from "@/contexts/CartContext";
import { Textarea } from "@/components/ui/textarea";

const Checkout = memo(() => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const {
    items,
    addresses,
    selectedAddressId,
    selectAddress,
    getCartTotal,
    getSelectedAddress,
    clearCart,
  } = useCart();

  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const selectedAddress = getSelectedAddress();
  const subtotal = getCartTotal();
  const deliveryCharges = 0;
  const total = subtotal + deliveryCharges;

  const accentStyle = {
    backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
  };

  // Redirect to add address if no addresses exist
  useEffect(() => {
    if (addresses.length === 0) {
      navigate("/address/add?from=checkout");
    }
  }, [addresses.length, navigate]);

  // If cart is empty, redirect to shop
  useEffect(() => {
    if (items.length === 0) {
      navigate("/shop");
    }
  }, [items.length, navigate]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    // Mock order placement delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearCart();
    navigate("/order-success");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-40">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border p-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/cart")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Checkout</h1>
              <p className="text-xs text-muted-foreground">
                Review and place your order
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 space-y-4"
        >
          {/* Delivery Address */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
                Delivery Address
              </h2>
            </div>

            {selectedAddress ? (
              <GlassCard
                hover
                onClick={() => setShowAddressPicker(true)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {selectedAddress.name}
                      </span>
                      {selectedAddress.isDefault && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={accentStyle}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedAddress.phone}
                    </p>
                    <p className="text-sm text-foreground mt-2">
                      {selectedAddress.line1}
                      {selectedAddress.line2 && `, ${selectedAddress.line2}`}
                    </p>
                    <p className="text-sm text-foreground">
                      {selectedAddress.city} - {selectedAddress.pincode}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </GlassCard>
            ) : (
              <GlassCard
                hover
                onClick={() => navigate("/address/add?from=checkout")}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Add delivery address</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </GlassCard>
            )}

            {addresses.length > 1 && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddressPicker(true)}
                className="mt-2 text-sm font-medium"
                style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }}
              >
                Change Address
              </motion.button>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
              <Package className="h-5 w-5" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
              Order Summary
            </h2>

            <GlassCard className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-foreground">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t border-border pt-3 space-y-2">
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
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-foreground">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Delivery Notes */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
              Delivery Notes (Optional)
            </h2>
            <GlassCard className="p-4">
              <Textarea
                placeholder="Any special instructions for delivery..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="bg-transparent border-0 resize-none text-foreground placeholder:text-muted-foreground"
                rows={3}
              />
            </GlassCard>
          </motion.div>

          {/* Payment Method */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%, 0.1)` }}
                  >
                    <Package className="h-5 w-5" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive</p>
                  </div>
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                  style={accentStyle}
                >
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Place Order Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePlaceOrder}
            disabled={!selectedAddress || isPlacingOrder}
            className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            style={accentStyle}
          >
            {isPlacingOrder ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
                Placing Order...
              </>
            ) : (
              `Place Order • $${total.toFixed(2)}`
            )}
          </motion.button>
        </motion.div>

        {/* Address Picker Modal */}
        <AnimatePresence>
          {showAddressPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end"
              onClick={() => setShowAddressPicker(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring" as const, damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[70vh] bg-background rounded-t-3xl p-4 overflow-y-auto"
              >
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Select Delivery Address
                </h3>

                <div className="space-y-3">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      isSelected={address.id === selectedAddressId}
                      onSelect={() => {
                        selectAddress(address.id);
                        setShowAddressPicker(false);
                      }}
                      accentColor={accentColor}
                    />
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddressPicker(false);
                    navigate("/address/add?from=checkout");
                  }}
                  className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground font-medium"
                >
                  + Add New Address
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
});

// Address Card Component
interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  accentColor: { hue: number; saturation: number; lightness: number };
}

const AddressCard = memo(({ address, isSelected, onSelect, accentColor }: AddressCardProps) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
      isSelected
        ? "border-primary bg-primary/5"
        : "border-border bg-muted/50"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">{address.name}</span>
          {address.isDefault && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{
                backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
              }}
            >
              Default
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{address.phone}</p>
        <p className="text-sm text-foreground mt-1">
          {address.line1}
          {address.line2 && `, ${address.line2}`}, {address.city} -{" "}
          {address.pincode}
        </p>
      </div>
      {isSelected && (
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-white flex-shrink-0"
          style={{
            backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
          }}
        >
          <Check className="h-4 w-4" />
        </div>
      )}
    </div>
  </motion.button>
));

AddressCard.displayName = "AddressCard";
Checkout.displayName = "Checkout";

export default Checkout;
