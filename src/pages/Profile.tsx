import { useState, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  QrCode,
  Bell,
  Ruler,
  Activity,
  ChevronRight,
  LogOut,
  Crown,
  Calendar,
  Loader2,
  Palette,
  ShoppingBag,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useMember, useMembershipStatus } from "@/hooks/useMember";
import { useGymTheme } from "@/hooks/useGymBranding";
import { useTheme } from "@/contexts/ThemeContext";

const Profile = memo(() => {
  const navigate = useNavigate();
  const { member, signOut } = useAuth();
  const { data: memberData, isLoading } = useMember();
  const { daysLeft } = useMembershipStatus();
  const { gymName, contactNumber } = useGymTheme();
  const { accentColor } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayMember = memberData || member;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate("/login");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            {displayMember?.photo ? (
              <img
                src={displayMember.photo}
                alt={displayMember.name}
                className="h-24 w-24 rounded-3xl object-cover ring-4 ring-fitness-orange/30"
              />
            ) : (
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-fitness-orange to-fitness-yellow flex items-center justify-center ring-4 ring-fitness-orange/30">
                <User className="h-12 w-12 text-white" />
              </div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-fitness-orange text-white"
            >
              <Crown className="h-4 w-4" />
            </motion.div>
          </motion.div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            {displayMember?.name || "Member"}
          </h1>
          <p className="text-muted-foreground">{displayMember?.email}</p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-fitness-orange/20 px-3 py-1"
          >
            <Crown className="h-3 w-3 text-fitness-orange" />
            <span className="text-xs font-medium text-fitness-orange">
              {displayMember?.plan || "Standard"} Member
            </span>
          </motion.div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Contact Info
          </h2>
          <GlassCard className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Phone className="h-5 w-5 text-fitness-orange" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground">
                    {displayMember?.phone || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Mail className="h-5 w-5 text-fitness-orange" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">
                    {displayMember?.email}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Membership Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Membership
          </h2>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fitness-orange to-fitness-yellow">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {displayMember?.plan || "Standard"} Plan
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {displayMember?.expiry_date
                        ? `Expires ${new Date(displayMember.expiry_date).toLocaleDateString()}`
                        : "No expiry set"
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-fitness-orange">{daysLeft}</p>
                <p className="text-xs text-muted-foreground">days left</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-4 flex items-center justify-center rounded-xl bg-white p-4">
              <div className="flex flex-col items-center">
                <QrCode className="h-24 w-24 text-gray-800" />
                <p className="mt-2 text-xs text-gray-500">
                  Scan to check-in at gym
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Gym Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Your Gym
          </h2>
          <GlassCard className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Activity className="h-6 w-6 text-fitness-orange" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{gymName}</p>
                <p className="text-sm text-muted-foreground">
                  {contactNumber || "Contact not available"}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Settings
          </h2>
          <GlassCard className="divide-y divide-border">
            {/* Theme & Appearance */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/theme-settings")}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }}
                >
                  <Palette className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground block">Theme & Appearance</span>
                  <span className="text-xs text-muted-foreground">{accentColor.name} theme</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Shop & Supplements */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/shop")}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }}
                >
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground block">Shop & Supplements</span>
                  <span className="text-xs text-muted-foreground">Buy gym products</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  Notifications
                </span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {/* Metric Units */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Ruler className="h-5 w-5 text-fitness-success" />
                <span className="font-medium text-foreground">
                  Metric Units
                </span>
              </div>
              <Switch checked={metricUnits} onCheckedChange={setMetricUnits} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-4 text-destructive disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          <span className="font-medium">{loggingOut ? "Logging out..." : "Log Out"}</span>
        </motion.button>

        {/* App Version */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          FitnessPro v2.0.0 • Made with ❤️
        </p>
      </div>
    </PageTransition>
  );
});

Profile.displayName = "Profile";

export default Profile;

