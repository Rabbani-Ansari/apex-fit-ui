import { useState, memo } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  QrCode,
  Moon,
  Sun,
  Bell,
  Ruler,
  Weight,
  Activity,
  ChevronRight,
  LogOut,
  Crown,
  Calendar,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { userData, trainerData } from "@/data/mockData";
import { Switch } from "@/components/ui/switch";

const Profile = memo(() => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const metrics = [
    { icon: Ruler, label: "Height", value: `${userData.height} cm` },
    { icon: Weight, label: "Weight", value: `${userData.weight} kg` },
    { icon: Activity, label: "BMI", value: userData.bmi.toFixed(1) },
    { icon: Activity, label: "Body Fat", value: `${userData.bodyFat}%` },
  ];

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
            <img
              src={userData.avatar}
              alt={userData.name}
              className="h-24 w-24 rounded-3xl object-cover ring-4 ring-fitness-orange/30"
            />
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
            {userData.name}
          </h1>
          <p className="text-muted-foreground">{userData.email}</p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-fitness-orange/20 px-3 py-1"
          >
            <Crown className="h-3 w-3 text-fitness-orange" />
            <span className="text-xs font-medium text-fitness-orange">
              {userData.plan} Member
            </span>
          </motion.div>
        </motion.div>

        {/* Body Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Body Metrics
          </h2>
          <GlassCard className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <metric.icon className="h-5 w-5 text-fitness-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="font-semibold text-foreground">
                      {metric.value}
                    </p>
                  </div>
                </motion.div>
              ))}
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
                    {userData.plan} Plan
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Expires{" "}
                      {new Date(userData.planExpiry).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
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

        {/* Trainer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Your Trainer
          </h2>
          <GlassCard className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={trainerData.avatar}
                alt={trainerData.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {trainerData.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {trainerData.specialization}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trainerData.experience} experience
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <motion.a
                whileTap={{ scale: 0.98 }}
                href={`tel:${trainerData.phone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-fitness-success/20 py-3 text-sm font-medium text-fitness-success"
              >
                <Phone className="h-4 w-4" />
                Call
              </motion.a>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-fitness-orange/20 py-3 text-sm font-medium text-fitness-orange"
              >
                <Mail className="h-4 w-4" />
                Message
              </motion.button>
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
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-fitness-purple" />
                ) : (
                  <Sun className="h-5 w-5 text-fitness-yellow" />
                )}
                <span className="font-medium text-foreground">Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-fitness-orange" />
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
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-4 text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log Out</span>
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
