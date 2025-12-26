import { motion } from "framer-motion";
import { Flame, Scale, Target } from "lucide-react";

interface QuickStatsRowProps {
  streak: number;
  weightLoss: number;
  adherence: number;
}

export const QuickStatsRow = ({
  streak,
  weightLoss,
  adherence,
}: QuickStatsRowProps) => {
  const stats = [
    {
      icon: Flame,
      value: streak,
      label: "Day Streak",
      color: "text-fitness-orange",
      bg: "bg-fitness-orange/10",
    },
    {
      icon: Scale,
      value: `${weightLoss}kg`,
      label: "Lost",
      color: "text-fitness-purple",
      bg: "bg-fitness-purple/10",
    },
    {
      icon: Target,
      value: `${adherence}%`,
      label: "Adherence",
      color: "text-fitness-success",
      bg: "bg-fitness-success/10",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="px-4"
    >
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card flex flex-col items-center justify-center p-3 text-center"
          >
            <div className={`mb-2 inline-flex rounded-full p-2.5 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
