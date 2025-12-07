import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";

interface GreetingHeaderProps {
  name: string;
  avatar: string;
  streak: number;
}

export const GreetingHeader = ({ name, avatar, streak }: GreetingHeaderProps) => {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const unreadCount = useUnreadNotificationCount();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between px-4 pt-6 pb-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <img
              src={avatar}
              alt={name}
              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-fitness-orange/50"
            />
            <motion.div
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-fitness-success ring-2 ring-background"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            />
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
              {getGreeting()} 👋
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-foreground"
            >
              {name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1"
            >
              <StreakBadge streak={streak} size="sm" />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsNotificationPanelOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-fitness-orange text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
          >
            <Settings className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
};
