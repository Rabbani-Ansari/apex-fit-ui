import { motion } from "framer-motion";
import { Crown, Calendar, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface MembershipCardProps {
  plan: string;
  expiry: string;
  daysLeft: number;
  progress: number;
}

export const MembershipCard = ({
  plan,
  expiry,
  daysLeft,
  progress,
}: MembershipCardProps) => {
  return (
    <GlassCard
      className="mx-4 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative p-4">
        {/* Background gradient/pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-fitness-orange/20 to-fitness-purple/20 opacity-30" />
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fitness-yellow/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fitness-yellow to-fitness-orange shadow-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground flex items-center gap-1">
                {plan} Plan
                <span className="inline-flex items-center rounded-full bg-fitness-success/10 px-2 py-0.5 text-[10px] font-medium text-fitness-success">
                  Active
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Expires {expiry}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-muted-foreground">Days Left</span>
              <span className="text-xl font-bold text-fitness-orange leading-none">{daysLeft}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
