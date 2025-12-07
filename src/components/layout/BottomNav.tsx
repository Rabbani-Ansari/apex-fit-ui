import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Home, Dumbbell, Utensils, TrendingUp, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/workout", icon: Dumbbell, label: "Workout" },
  { path: "/diet", icon: Utensils, label: "Diet" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = memo(() => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-lg">
        <div className="border-t border-border/50 bg-card/80 backdrop-blur-xl">
          <div className="flex items-center justify-around pb-safe pt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="nav-tap-target relative flex flex-1 flex-col items-center py-2"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative flex flex-col items-center gap-1 px-4 py-1 transition-colors"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-3 h-1 w-12 rounded-full bg-primary"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 h-6 w-6 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                    />
                    <span
                      className={`relative z-10 text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";
