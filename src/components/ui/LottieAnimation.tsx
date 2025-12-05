import { useEffect, useState, useMemo } from "react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

interface LottieAnimationProps {
  type: string;
  size?: number;
  className?: string;
  url?: string | null; // Direct URL to Lottie JSON (e.g., from Supabase Storage)
}

// Free working Lottie animation URLs
const animationUrls: Record<string, string> = {
  // Using free LottieFiles animations (verified working)
  "bench-press": "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  "dumbbell-press": "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  "pull-up": "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  "barbell-row": "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  "shoulder-press": "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  "lateral-raise": "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  squat: "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  pushup: "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  plank: "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
  deadlift: "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",

  // Default
  default: "https://assets10.lottiefiles.com/packages/lf20_z4cshyhf.json",
};

// Simple animated fallback using SVG
const AnimatedFallback = ({ type, size }: { type: string; size: number }) => {
  const exerciseColors: Record<string, { from: string; to: string }> = {
    "bench-press": { from: "from-fitness-orange", to: "to-fitness-yellow" },
    "dumbbell-press": { from: "from-fitness-yellow", to: "to-fitness-orange" },
    "pull-up": { from: "from-fitness-purple", to: "to-fitness-pink" },
    "barbell-row": { from: "from-fitness-pink", to: "to-fitness-purple" },
    "shoulder-press": { from: "from-fitness-orange", to: "to-fitness-purple" },
    "lateral-raise": { from: "from-fitness-yellow", to: "to-fitness-pink" },
    squat: { from: "from-fitness-purple", to: "to-fitness-orange" },
    pushup: { from: "from-fitness-orange", to: "to-fitness-pink" },
    plank: { from: "from-fitness-yellow", to: "to-fitness-purple" },
    deadlift: { from: "from-fitness-pink", to: "to-fitness-yellow" },
  };

  const colors = exerciseColors[type] || { from: "from-fitness-orange", to: "to-fitness-yellow" };

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden"
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.from}/20 ${colors.to}/20`} />

      {/* Animated exercise icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: [0, -8, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ExerciseIcon type={type} size={size * 0.5} />
      </motion.div>

      {/* Pulse rings */}
      <motion.div
        className={`absolute inset-4 rounded-full border-2 border-fitness-orange/30`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
};

// Exercise specific SVG icons
const ExerciseIcon = ({ type, size }: { type: string; size: number }) => {
  const iconStyle = { width: size, height: size };

  switch (type) {
    case "bench-press":
    case "dumbbell-press":
    case "shoulder-press":
    case "lateral-raise":
      return (
        <svg viewBox="0 0 64 64" fill="none" style={iconStyle}>
          <motion.g
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {/* Dumbbell */}
            <rect x="8" y="28" width="12" height="8" rx="2" fill="hsl(var(--fitness-orange))" />
            <rect x="44" y="28" width="12" height="8" rx="2" fill="hsl(var(--fitness-orange))" />
            <rect x="20" y="30" width="24" height="4" rx="1" fill="hsl(var(--fitness-yellow))" />
          </motion.g>
        </svg>
      );

    case "pull-up":
      return (
        <svg viewBox="0 0 64 64" fill="none" style={iconStyle}>
          {/* Bar */}
          <rect x="8" y="8" width="48" height="4" rx="2" fill="hsl(var(--fitness-purple))" />
          {/* Person */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <circle cx="32" cy="20" r="6" fill="hsl(var(--fitness-pink))" />
            <rect x="30" y="26" width="4" height="16" rx="2" fill="hsl(var(--fitness-pink))" />
            <rect x="24" y="42" width="4" height="12" rx="2" fill="hsl(var(--fitness-pink))" />
            <rect x="36" y="42" width="4" height="12" rx="2" fill="hsl(var(--fitness-pink))" />
          </motion.g>
        </svg>
      );

    case "squat":
    case "deadlift":
    case "barbell-row":
      return (
        <svg viewBox="0 0 64 64" fill="none" style={iconStyle}>
          {/* Barbell */}
          <motion.g
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <rect x="4" y="24" width="8" height="16" rx="2" fill="hsl(var(--fitness-purple))" />
            <rect x="52" y="24" width="8" height="16" rx="2" fill="hsl(var(--fitness-purple))" />
            <rect x="12" y="30" width="40" height="4" rx="1" fill="hsl(var(--fitness-orange))" />
          </motion.g>
        </svg>
      );

    case "pushup":
    case "plank":
      return (
        <svg viewBox="0 0 64 64" fill="none" style={iconStyle}>
          <motion.g
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {/* Person in plank */}
            <circle cx="12" cy="32" r="5" fill="hsl(var(--fitness-orange))" />
            <rect x="17" y="30" width="36" height="4" rx="2" fill="hsl(var(--fitness-yellow))" />
            <rect x="16" y="34" width="6" height="10" rx="2" transform="rotate(-20 16 34)" fill="hsl(var(--fitness-orange))" />
            <rect x="48" y="34" width="6" height="10" rx="2" transform="rotate(20 48 34)" fill="hsl(var(--fitness-orange))" />
          </motion.g>
        </svg>
      );

    default:
      return <Dumbbell style={iconStyle} className="text-fitness-orange" />;
  }
};

export const LottieAnimation = ({
  type,
  size = 80,
  className = "",
  url: directUrl,
}: LottieAnimationProps) => {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Prioritize direct URL, fall back to type-based lookup
  const url = useMemo(() => directUrl || animationUrls[type] || animationUrls.default, [directUrl, type]);

  useEffect(() => {
    let isMounted = true;

    const loadAnimation = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(url, {
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error("Failed to load");

        const data = await response.json();

        if (isMounted) {
          setAnimationData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn(`Lottie load failed for ${type}, using animated fallback`);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadAnimation();

    return () => {
      isMounted = false;
    };
  }, [url, type]);

  // Show loading spinner
  if (isLoading) {
    return (
      <motion.div
        className={`relative flex items-center justify-center rounded-2xl bg-card/50 ${className}`}
        style={{ width: size, height: size }}
      >
        <motion.div
          className="h-8 w-8 rounded-full border-3 border-fitness-orange/30 border-t-fitness-orange"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  // Show animated SVG fallback on error
  if (hasError || !animationData) {
    return <AnimatedFallback type={type} size={size} />;
  }

  // Show Lottie animation
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/20 ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      {/* Subtle glow overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle at center, hsl(var(--fitness-orange) / 0.1) 0%, transparent 70%)`,
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default LottieAnimation;
