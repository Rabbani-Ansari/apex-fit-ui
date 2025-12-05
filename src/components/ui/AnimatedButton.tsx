import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export const AnimatedButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon,
  fullWidth = false,
  type = "button",
}: AnimatedButtonProps) => {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all overflow-hidden";

  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    gradient: "gradient-orange-yellow text-white glow-orange",
  };

  const sizeStyles = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {variant === "gradient" && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: "-100%", skewX: "-15deg" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};
