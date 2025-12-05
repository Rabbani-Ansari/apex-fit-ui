import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Dumbbell,
  Utensils,
  Camera,
  TrendingDown,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { progressData, userData } from "@/data/mockData";

type TabType = "weight" | "workouts" | "diet" | "photos";

const Progress = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>("weight");

  const tabs = [
    { id: "weight" as const, label: "Weight", icon: Scale },
    { id: "workouts" as const, label: "Workouts", icon: Dumbbell },
    { id: "diet" as const, label: "Diet", icon: Utensils },
    { id: "photos" as const, label: "Photos", icon: Camera },
  ];

  const renderWeightTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Weight Chart */}
      <GlassCard className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Weight Trend</h3>
          <div className="flex items-center gap-1 text-fitness-success">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm font-medium">-4kg</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData.weight}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(24, 100%, 55%)" />
                  <stop offset="50%" stopColor="hsl(45, 100%, 55%)" />
                  <stop offset="100%" stopColor="hsl(280, 100%, 65%)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--fitness-orange))", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--fitness-orange))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">Current</p>
          <p className="text-2xl font-bold text-foreground">{userData.weight}kg</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">Target</p>
          <p className="text-2xl font-bold text-fitness-success">{userData.targetWeight}kg</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">BMI</p>
          <p className="text-2xl font-bold text-fitness-orange">{userData.bmi}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">Body Fat</p>
          <p className="text-2xl font-bold text-fitness-purple">{userData.bodyFat}%</p>
        </GlassCard>
      </div>
    </motion.div>
  );

  const renderWorkoutsTab = () => {
    const days = Object.entries(progressData.workoutCalendar);
    const currentMonth = days.slice(-30);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Workout Heatmap */}
        <GlassCard className="p-4">
          <h3 className="mb-4 font-semibold text-foreground">
            Workout Calendar
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div
                key={i}
                className="flex h-8 items-center justify-center text-xs text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {currentMonth.map(([date, completed], index) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`flex h-8 w-full items-center justify-center rounded-lg text-xs ${
                  completed
                    ? "bg-fitness-success text-white"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {new Date(date).getDate()}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Workout Stats */}
        <GlassCard className="p-4">
          <h3 className="mb-4 font-semibold text-foreground">Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Workouts</span>
              <span className="font-bold text-foreground">{userData.totalWorkouts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Calories Burned</span>
              <span className="font-bold text-fitness-orange">{userData.caloriesBurned.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Streak</span>
              <span className="font-bold text-fitness-yellow">{userData.streak} days</span>
            </div>
          </div>
        </GlassCard>

        {/* Milestones */}
        <GlassCard className="p-4">
          <h3 className="mb-4 font-semibold text-foreground">Milestones</h3>
          <div className="grid grid-cols-4 gap-2">
            {progressData.milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center rounded-xl p-2 ${
                  milestone.achieved
                    ? "bg-fitness-orange/10"
                    : "bg-muted/30 opacity-50"
                }`}
              >
                <span className="text-2xl">{milestone.icon}</span>
                <span className="mt-1 text-center text-[10px] font-medium text-foreground">
                  {milestone.title}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  const renderDietTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <GlassCard className="p-4">
        <h3 className="mb-4 font-semibold text-foreground">Weekly Average</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-fitness-orange/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-orange">2,100</p>
            <p className="text-xs text-muted-foreground">Avg Calories</p>
          </div>
          <div className="rounded-xl bg-fitness-purple/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-purple">145g</p>
            <p className="text-xs text-muted-foreground">Avg Protein</p>
          </div>
          <div className="rounded-xl bg-fitness-yellow/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-yellow">210g</p>
            <p className="text-xs text-muted-foreground">Avg Carbs</p>
          </div>
          <div className="rounded-xl bg-fitness-pink/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-pink">65g</p>
            <p className="text-xs text-muted-foreground">Avg Fat</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-fitness-success" />
          <h3 className="font-semibold text-foreground">Diet Adherence</h3>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This Week</span>
            <span className="font-bold text-fitness-success">85%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-fitness-success to-fitness-yellow"
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderPhotosTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <GlassCard className="p-4">
        <h3 className="mb-4 font-semibold text-foreground">
          Progress Photos
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {progressData.photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative aspect-[3/4] overflow-hidden rounded-xl"
            >
              <img
                src={photo.url}
                alt={photo.date}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <span className="text-sm font-medium text-white">
                  {photo.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <motion.button
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-muted-foreground transition-colors hover:border-fitness-orange hover:text-fitness-orange"
      >
        <Camera className="h-5 w-5" />
        <span className="font-medium">Add Progress Photo</span>
      </motion.button>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-fitness-orange text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "weight" && renderWeightTab()}
        {activeTab === "workouts" && renderWorkoutsTab()}
        {activeTab === "diet" && renderDietTab()}
        {activeTab === "photos" && renderPhotosTab()}
      </div>
    </PageTransition>
  );
});

Progress.displayName = "Progress";

export default Progress;
