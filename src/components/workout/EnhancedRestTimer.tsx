import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Volume2, VolumeX, Mic, MicOff, Plus, Minus, SkipForward } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface EnhancedRestTimerProps {
  initialTime: number;
  onComplete: () => void;
  onSkip: () => void;
  voiceEnabled?: boolean;
  onVoiceToggle?: () => void;
  onCountdown?: (seconds: number) => void;
}

export const EnhancedRestTimer = ({
  initialTime,
  onComplete,
  onSkip,
  voiceEnabled = false,
  onVoiceToggle,
  onCountdown
}: EnhancedRestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);

  // Use refs to avoid stale closures in interval
  const onCompleteRef = useRef(onComplete);
  const onCountdownRef = useRef(onCountdown);
  const soundEnabledRef = useRef(soundEnabled);
  const voiceEnabledRef = useRef(voiceEnabled);

  // Keep refs updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCountdownRef.current = onCountdown;
    soundEnabledRef.current = soundEnabled;
    voiceEnabledRef.current = voiceEnabled;
  }, [onComplete, onCountdown, soundEnabled, voiceEnabled]);

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Play beep sound
  const playBeep = useCallback((isUrgent: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = isUrgent ? 880 : 440;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  }, []);

  // Timer countdown effect - runs independently
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }

        // Handle countdown effects
        if (newTime <= 10 && newTime > 0) {
          setIsPulsing(true);

          // Voice countdown
          if (voiceEnabledRef.current && onCountdownRef.current) {
            onCountdownRef.current(newTime);
          }

          // Beep sounds
          if (soundEnabledRef.current && (newTime === 10 || newTime === 5 || newTime <= 3)) {
            playBeep(newTime <= 3);
          }
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playBeep]); // Only depends on playBeep which is memoized

  const adjustTime = (seconds: number) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-fitness-orange" />
          <h3 className="font-semibold text-foreground">Rest Time</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Toggle */}
          {onVoiceToggle && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onVoiceToggle}
              className={`p-2 rounded-full transition-colors ${voiceEnabled
                ? "bg-fitness-purple/20 text-fitness-purple"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
            >
              {voiceEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </motion.button>
          )}
          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors ${soundEnabled
              ? "bg-fitness-orange/20 text-fitness-orange"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="relative flex justify-center mb-4">
        <svg className="transform -rotate-90" width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            stroke="url(#timerGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        <AnimatePresence mode="wait">
          <motion.div
            key={timeLeft}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: isPulsing && timeLeft <= 3 ? [1, 1.1, 1] : 1,
              opacity: 1
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className={`text-4xl font-bold ${timeLeft <= 3 ? "text-fitness-orange" : "gradient-text"
              }`}>
              {formatTime(timeLeft)}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Countdown indicator */}
      {timeLeft <= 5 && timeLeft > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <span className="text-fitness-orange font-bold text-lg">
            Get Ready!
          </span>
        </motion.div>
      )}

      {/* Voice indicator */}
      {voiceEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-fitness-purple"
          />
          <span className="text-xs text-fitness-purple">Voice coaching active</span>
        </motion.div>
      )}

      {/* Time Adjust Buttons */}
      <div className="flex justify-center gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => adjustTime(-15)}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors"
        >
          <Minus className="h-4 w-4" />
          <span className="text-sm font-medium">15s</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => adjustTime(15)}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">15s</span>
        </motion.button>
      </div>

      {/* Skip Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSkip}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-fitness-orange/10 text-fitness-orange font-medium hover:bg-fitness-orange/20 transition-colors"
      >
        <SkipForward className="h-4 w-4" />
        Skip Rest
      </motion.button>
    </GlassCard>
  );
};
