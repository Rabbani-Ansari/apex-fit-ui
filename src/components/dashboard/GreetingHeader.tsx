import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden pb-8 pt-safe-top"
      >
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-fitness-orange/10 via-background/50 to-background z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-fitness-orange/20 blur-3xl" />
        <div className="absolute top-0 left-0 -ml-20 -mt-20 h-64 w-64 rounded-full bg-fitness-purple/20 blur-3xl" />

        <div className="relative z-10 px-6 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-medium text-muted-foreground"
              >
                {getGreeting()}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-1 text-3xl font-bold tracking-tight text-foreground"
              >
                {name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center gap-3"
              >
                <div className="flex items-center gap-2 rounded-full bg-background/50 backdrop-blur-md border border-white/10 px-3 py-1 shadow-sm">
                  <StreakBadge streak={streak} size="sm" />
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsNotificationPanelOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-background/40 backdrop-blur-md border border-white/10 text-muted-foreground transition-colors hover:bg-background/60"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-fitness-orange ring-2 ring-background" />
                  )}
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Avatar className="h-16 w-16 ring-4 ring-background shadow-xl">
                    <AvatarImage src={avatar} alt={name} className="object-cover" />
                    <AvatarFallback className="bg-fitness-orange text-white text-2xl font-bold">
                      {name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-fitness-success ring-2 ring-background" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
};
