import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Dumbbell,
  Utensils,
  Camera,
  TrendingDown,
  TrendingUp,
  Award,
  Loader2,
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
import { useWeightProgress, useMilestones, useProgressPhotos, useUploadProgressPhoto, useDeleteProgressPhoto } from "@/hooks/useProgress";
import { useAttendanceStats, useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/contexts/AuthContext";

type TabType = "weight" | "workouts" | "diet" | "photos";

const Progress = memo(() => {
  const [activeTab, setActiveTab] = useState<TabType>("weight");
  const { member } = useAuth();

  // Real data hooks
  const { chartData, latestWeight, weightChange, isLoading: weightLoading } = useWeightProgress();
  const { currentStreak, monthlyCount, attendanceCalendar, isLoading: attendanceLoading } = useAttendanceStats();
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();
  /* -------------------------------------------------------------------------- */
  /*                             Photos Tab Logic                               */
  /* -------------------------------------------------------------------------- */

  const tabs = [
    { id: "weight" as const, label: "Weight", icon: Scale },
    { id: "workouts" as const, label: "Workouts", icon: Dumbbell },
    { id: "diet" as const, label: "Diet", icon: Utensils },
    { id: "photos" as const, label: "Photos", icon: Camera },
  ];

  const { data: photos, isLoading: photosLoading } = useProgressPhotos();
  const uploadPhotoMutation = useUploadProgressPhoto();
  const deletePhotoMutation = useDeleteProgressPhoto();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadNote, setUploadNote] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploadDialogOpen(true);
      // Reset input value so same file can be selected again if needed
      e.target.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadPhotoMutation.mutateAsync({
        file: selectedFile,
        date: new Date(),
        notes: uploadNote
      });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadNote("");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      // Ideally show toast error here
    }
  };

  const handleCancelUpload = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadNote("");
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        await deletePhotoMutation.mutateAsync(photoId);
      } catch (error) {
        console.error("Failed to delete photo:", error);
      }
    }
  };

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
          {weightChange !== 0 && (
            <div className={`flex items-center gap-1 ${weightChange > 0 ? 'text-fitness-error' : 'text-fitness-success'}`}>
              {weightChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{weightChange > 0 ? '+' : ''}{weightChange}kg</span>
            </div>
          )}
        </div>

        {weightLoading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No weight data recorded yet
          </div>
        )}
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">Current</p>
          <p className="text-2xl font-bold text-foreground">
            {latestWeight ? `${latestWeight}kg` : '--'}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-sm text-muted-foreground">Target</p>
          <p className="text-2xl font-bold text-fitness-success">--</p>
        </GlassCard>
      </div>
    </motion.div>
  );

  const renderWorkoutsTab = () => {
    // Build calendar from attendance data
    const calendarDays = Object.entries(attendanceCalendar);
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({ date: dateStr, completed: attendanceCalendar[dateStr] || false });
    }

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
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div
                  key={i}
                  className="flex h-8 items-center justify-center text-xs text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {last30Days.map(({ date, completed }, index) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`flex h-8 w-full items-center justify-center rounded-lg text-xs ${completed
                    ? "bg-fitness-success text-white"
                    : "bg-muted/50 text-muted-foreground"
                    }`}
                >
                  {new Date(date).getDate()}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Workout Stats */}
        <GlassCard className="p-4">
          <h3 className="mb-4 font-semibold text-foreground">Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-bold text-foreground">{monthlyCount} workouts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Streak</span>
              <span className="font-bold text-fitness-yellow">{currentStreak} days</span>
            </div>
          </div>
        </GlassCard>

        {/* Milestones */}
        <GlassCard className="p-4">
          <h3 className="mb-4 font-semibold text-foreground">Milestones</h3>
          {milestonesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col items-center rounded-xl p-2 ${milestone.achieved
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
          ) : (
            <p className="text-center text-muted-foreground text-sm">No milestones yet</p>
          )}
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
            <p className="text-2xl font-bold text-fitness-orange">--</p>
            <p className="text-xs text-muted-foreground">Avg Calories</p>
          </div>
          <div className="rounded-xl bg-fitness-purple/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-purple">--</p>
            <p className="text-xs text-muted-foreground">Avg Protein</p>
          </div>
          <div className="rounded-xl bg-fitness-yellow/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-yellow">--</p>
            <p className="text-xs text-muted-foreground">Avg Carbs</p>
          </div>
          <div className="rounded-xl bg-fitness-pink/10 p-4 text-center">
            <p className="text-2xl font-bold text-fitness-pink">--</p>
            <p className="text-xs text-muted-foreground">Avg Fat</p>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Diet tracking coming soon
        </p>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-fitness-success" />
          <h3 className="font-semibold text-foreground">Diet Adherence</h3>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This Week</span>
            <span className="font-bold text-muted-foreground">--</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-fitness-success to-fitness-yellow" />
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
      {/* Upload Dialog / Overlay */}
      <AnimatePresence>
        {isUploadDialogOpen && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 shadow-2xl"
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3 className="mb-4 text-center text-xl font-bold text-foreground">Add Photo</h3>

              <div className="mx-auto mb-6 aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-2xl bg-muted shadow-inner">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Notes
                </label>
                <textarea
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="How are you feeling?"
                  className="w-full resize-none rounded-xl border border-input bg-background/50 p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelUpload}
                  disabled={uploadPhotoMutation.isPending}
                  className="flex-1 rounded-xl bg-muted py-3.5 font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadPhotoMutation.isPending}
                  className="flex-1 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadPhotoMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard className="p-4">
        <h3 className="mb-4 font-semibold text-foreground">
          Progress Photos
        </h3>
        {photosLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.date}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-sm font-medium text-white drop-shadow-md">
                    {new Date(photo.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {photo.notes && (
                    <p className="mt-1 line-clamp-2 text-xs text-white/80">
                      {photo.notes}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No photos yet</p>
            <p className="text-sm text-muted-foreground">
              Take a photo to document your progress!
            </p>
          </div>
        )}
      </GlassCard>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="photo-upload"
          onChange={handleFileSelect}
        />
        <label
          htmlFor="photo-upload"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-muted-foreground transition-all hover:border-fitness-orange hover:text-fitness-orange hover:bg-fitness-orange/5 active:scale-[0.99]"
        >
          <Camera className="h-5 w-5" />
          <span className="font-medium">Add Progress Photo</span>
        </label>
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </motion.div>

        {/* ... (Existing Tabs and other renders) ... */}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
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

