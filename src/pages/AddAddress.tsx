import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const AddAddress = memo(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromCheckout = searchParams.get("from") === "checkout";
  const { accentColor } = useTheme();
  const { addAddress } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    isDefault: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const accentStyle = {
    backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!form.line1.trim()) newErrors.line1 = "Address line 1 is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{5,6}$/.test(form.pincode.replace(/\D/g, ""))) {
      newErrors.pincode = "Enter a valid pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addAddress({
      name: form.name.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      pincode: form.pincode.trim(),
      isDefault: form.isDefault,
    });

    toast.success("Address saved successfully");

    if (fromCheckout) {
      navigate("/checkout");
    } else {
      navigate(-1);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border p-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Add Address</h1>
              <p className="text-xs text-muted-foreground">
                Enter your delivery address
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="p-4 space-y-4"
        >
          {/* Location Header */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%, 0.1)` }}
            >
              <MapPin className="h-6 w-6" style={{ color: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Delivery Location</h2>
              <p className="text-xs text-muted-foreground">
                We'll deliver to your gym or home
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <GlassCard className="p-4 space-y-4">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name *
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`rounded-xl bg-muted border-0 ${errors.name ? "ring-2 ring-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Phone Number *
              </Label>
              <Input
                id="phone"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`rounded-xl bg-muted border-0 ${errors.phone ? "ring-2 ring-destructive" : ""}`}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="line1" className="text-foreground">
                Address Line 1 *
              </Label>
              <Input
                id="line1"
                placeholder="House/Flat No, Building Name"
                value={form.line1}
                onChange={(e) => handleChange("line1", e.target.value)}
                className={`rounded-xl bg-muted border-0 ${errors.line1 ? "ring-2 ring-destructive" : ""}`}
              />
              {errors.line1 && (
                <p className="text-xs text-destructive">{errors.line1}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="line2" className="text-foreground">
                Address Line 2 (Optional)
              </Label>
              <Input
                id="line2"
                placeholder="Street, Area, Landmark"
                value={form.line2}
                onChange={(e) => handleChange("line2", e.target.value)}
                className="rounded-xl bg-muted border-0"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-foreground">
                  City *
                </Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={`rounded-xl bg-muted border-0 ${errors.city ? "ring-2 ring-destructive" : ""}`}
                />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-foreground">
                  Pincode *
                </Label>
                <Input
                  id="pincode"
                  placeholder="400001"
                  value={form.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  className={`rounded-xl bg-muted border-0 ${errors.pincode ? "ring-2 ring-destructive" : ""}`}
                />
                {errors.pincode && (
                  <p className="text-xs text-destructive">{errors.pincode}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-foreground">Set as default</p>
                <p className="text-xs text-muted-foreground">
                  Use this for all future orders
                </p>
              </div>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(checked) => handleChange("isDefault", checked)}
              />
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg"
            style={accentStyle}
          >
            Save Address
          </motion.button>
        </motion.div>
      </div>
    </PageTransition>
  );
});

AddAddress.displayName = "AddAddress";

export default AddAddress;
