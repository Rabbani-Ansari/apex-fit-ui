import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  Palette,
  Sparkles,
  Cloud,
  CloudOff,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTheme, ACCENT_COLORS, ThemeMode, AccentColor } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const ThemePreview = memo(({ 
  mode, 
  isSelected, 
  onClick 
}: { 
  mode: ThemeMode; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const isDark = mode === "dark";
  const isSystem = mode === "system";
  
  const bgColor = isSystem 
    ? "linear-gradient(135deg, #ffffff 50%, #0a0a0f 50%)" 
    : isDark ? "#0a0a0f" : "#ffffff";
  
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const mutedColor = isDark ? "#666666" : "#888888";
  const cardColor = isDark ? "#1a1a1f" : "#f5f5f5";

  const Icon = isSystem ? Monitor : isDark ? Moon : Sun;
  const label = isSystem ? "System" : isDark ? "Dark" : "Light";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center rounded-2xl p-3 transition-all ${
        isSelected 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
          : "ring-1 ring-border hover:ring-primary/50"
      }`}
    >
      {/* Preview Card */}
      <div
        className="relative h-32 w-full rounded-xl overflow-hidden"
        style={{ background: bgColor }}
      >
        {/* Mini mockup UI */}
        <div className="absolute inset-2 flex flex-col gap-1.5">
          {/* Header */}
          <div 
            className="h-3 w-16 rounded-sm"
            style={{ backgroundColor: isSystem ? undefined : textColor, opacity: isSystem ? 0 : 0.8 }}
          />
          {/* Cards */}
          {!isSystem && (
            <>
              <div 
                className="flex-1 rounded-lg"
                style={{ backgroundColor: cardColor }}
              />
              <div 
                className="h-6 w-full rounded-lg"
                style={{ backgroundColor: `hsl(var(--primary))` }}
              />
            </>
          )}
          {isSystem && (
            <div className="flex-1 flex items-center justify-center">
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
      </div>

      {/* Selected indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary"
          >
            <Check className="h-3 w-3 text-primary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

ThemePreview.displayName = "ThemePreview";

const ColorSwatch = memo(({ 
  color, 
  isSelected, 
  onClick 
}: { 
  color: AccentColor; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const bgStyle = { backgroundColor: `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)` };
  const shadowStyle = isSelected 
    ? { boxShadow: `0 0 20px hsla(${color.hue}, ${color.saturation}%, ${color.lightness}%, 0.5)` } 
    : {};
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      className={`relative h-12 w-12 rounded-full transition-all ${
        isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
      }`}
      style={{ ...bgStyle, ...shadowStyle }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check className="h-5 w-5 text-white drop-shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

ColorSwatch.displayName = "ColorSwatch";

const ThemeSettings = memo(() => {
  const navigate = useNavigate();
  const { themeMode, setThemeMode, accentColor, setAccentColor, isTransitioning } = useTheme();
  const { member } = useAuth();
  const isSyncedToCloud = !!member?.id;

  return (
    <PageTransition>
      <div className={`min-h-screen bg-background transition-colors duration-300 ${isTransitioning ? "pointer-events-none" : ""}`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-4 p-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Theme & Appearance</h1>
              <p className="text-sm text-muted-foreground">Customize your app look</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Theme Mode</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                <ThemePreview
                  key={mode}
                  mode={mode}
                  isSelected={themeMode === mode}
                  onClick={() => setThemeMode(mode)}
                />
              ))}
            </div>
          </motion.div>

          {/* Accent Color Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Accent Color</h2>
            </div>
            <GlassCard className="p-4">
              <div className="flex flex-wrap gap-4 justify-center">
                {ACCENT_COLORS.map((color) => (
                  <ColorSwatch
                    key={color.name}
                    color={color}
                    isSelected={accentColor.name === color.name}
                    onClick={() => setAccentColor(color)}
                  />
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{accentColor.name}</span>
              </p>
            </GlassCard>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Preview</h2>
            <GlassCard className="p-4 space-y-4">
              {/* Sample UI elements */}
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Sample Text</span>
                <span className="text-muted-foreground text-sm">Muted text</span>
              </div>
              
              <div className="flex gap-3">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 rounded-xl bg-primary py-3 text-primary-foreground font-medium"
                >
                  Primary Button
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 rounded-xl bg-muted py-3 text-foreground font-medium"
                >
                  Secondary
                </motion.button>
              </div>

              <div className="rounded-xl bg-muted p-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full"
                    style={{ backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)` }}
                  />
                  <div>
                    <p className="text-foreground font-medium">Card Item</p>
                    <p className="text-sm text-muted-foreground">Secondary info</p>
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">75%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Sync Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            {isSyncedToCloud ? (
              <>
                <Cloud className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Synced to cloud - your preferences will sync across all devices
                </span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Saved locally - log in to sync across devices
                </span>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
});

ThemeSettings.displayName = "ThemeSettings";

export default ThemeSettings;
