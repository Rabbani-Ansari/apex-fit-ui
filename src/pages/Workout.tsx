import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { LottieAnimation } from "@/components/ui/LottieAnimation";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { RPESelector } from "@/components/workout/RPESelector";
import { WeightAdjuster } from "@/components/workout/WeightAdjuster";
import { EnhancedRestTimer } from "@/components/workout/EnhancedRestTimer";
import { WorkoutNotesModal } from "@/components/workout/WorkoutNotesModal";
import { SetCard } from "@/components/workout/SetCard";
import { QuickStatsPanel } from "@/components/workout/QuickStatsPanel";
import { CompletionScreen } from "@/components/workout/CompletionScreen";
import { LastWorkoutComparison } from "@/components/workout/LastWorkoutComparison";
import { ExerciseVideoToggle } from "@/components/workout/ExerciseVideoToggle";
import { VoiceCoachingToggle } from "@/components/workout/VoiceCoachingToggle";
import { useVoiceCoaching } from "@/hooks/useVoiceCoaching";
import { todayWorkout, lastWorkoutData } from "@/data/mockData";

interface SetData {
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number | null;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean;
  animation: string;
  setData: SetData[];
}

const initializeExercises = (): Exercise[] => {
  return todayWorkout.exercises.map((e) => ({
    ...e,
    setData: Array(e.sets)
      .fill(0)
      .map((_, i) => ({
        setNumber: i + 1,
        reps: e.reps,
        weight: e.weight,
        rpe: null,
        completed: false,
      })),
  }));
};

const Workout = memo(() => {
  const [exercises, setExercises] = useState<Exercise[]>(initializeExercises);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [showRPESelector, setShowRPESelector] = useState(false);
  const [pendingSetIndex, setPendingSetIndex] = useState<number | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice coaching hook
  const voiceCoaching = useVoiceCoaching({ rate: 1.0, pitch: 1.0, volume: 0.9 });

  const completedCount = exercises.filter((e) => e.completed).length;
  const progress = (completedCount / exercises.length) * 100;

  // Calculate total volume
  const totalVolume = exercises.reduce((acc, exercise) => {
    return (
      acc +
      exercise.setData
        .filter((s) => s.completed)
        .reduce((sum, set) => sum + set.reps * set.weight, 0)
    );
  }, 0);

  // Workout timer
  useEffect(() => {
    if (isWorkoutStarted && !showCompletion) {
      timerRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWorkoutStarted, showCompletion]);

  const handleSetComplete = () => {
    const setIndex = currentSet - 1;
    setPendingSetIndex(setIndex);
    setShowRPESelector(true);
  };

  const handleRPESelected = (rpe: number) => {
    if (pendingSetIndex === null) return;

    const exercise = exercises[currentExercise];
    const setIndex = pendingSetIndex;

    // Update set data with completion and RPE
    const updatedExercises = exercises.map((e, i) => {
      if (i === currentExercise) {
        const updatedSetData = e.setData.map((set, sIdx) =>
          sIdx === setIndex ? { ...set, completed: true, rpe } : set
        );
        const allSetsCompleted = updatedSetData.every((s) => s.completed);
        return { ...e, setData: updatedSetData, completed: allSetsCompleted };
      }
      return e;
    });

    setExercises(updatedExercises);
    setShowRPESelector(false);
    setPendingSetIndex(null);

    // Voice announce RPE feedback
    voiceCoaching.announceRPE(rpe);

    if (currentSet < exercise.sets) {
      setCurrentSet((prev) => prev + 1);
      setIsResting(true);
      voiceCoaching.announceSetComplete(currentSet, exercise.sets);
      toast.success(`Set ${currentSet} completed! RPE: ${rpe}`);
    } else {
      // Exercise completed
      if (currentExercise < exercises.length - 1) {
        const nextExercise = exercises[currentExercise + 1];
        setCurrentExercise((prev) => prev + 1);
        setCurrentSet(1);
        voiceCoaching.announceSetComplete(currentSet, exercise.sets);
        // Announce next exercise after a short delay
        setTimeout(() => {
          voiceCoaching.announceExercise(
            nextExercise.name,
            nextExercise.sets,
            nextExercise.reps,
            nextExercise.weight
          );
        }, 2000);
        toast.success(`${exercise.name} completed!`);
      } else {
        // Workout completed!
        setShowCompletion(true);
        voiceCoaching.announceWorkoutComplete();
      }
    }
  };

  const handleWeightChange = (newWeight: number) => {
    setExercises((prev) =>
      prev.map((e, i) => {
        if (i === currentExercise) {
          const updatedSetData = e.setData.map((set, sIdx) =>
            sIdx >= currentSet - 1 && !set.completed
              ? { ...set, weight: newWeight }
              : set
          );
          return { ...e, weight: newWeight, setData: updatedSetData };
        }
        return e;
      })
    );
  };

  const handleRestComplete = () => {
    setIsResting(false);
    voiceCoaching.announceRestComplete();
  };

  const handleSkipRest = () => {
    setIsResting(false);
  };

  const handleSetClick = (setIndex: number) => {
    const set = exercises[currentExercise].setData[setIndex];
    if (set.completed) {
      toast.info(`Set ${set.setNumber}: ${set.reps} reps @ ${set.weight}kg (RPE ${set.rpe})`);
    }
  };

  const navigateExercise = (direction: number) => {
    const newIndex = currentExercise + direction;
    if (newIndex >= 0 && newIndex < exercises.length) {
      setSwipeDirection(direction);
      setCurrentExercise(newIndex);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentExercise > 0) {
      navigateExercise(-1);
    } else if (info.offset.x < -threshold && currentExercise < exercises.length - 1) {
      navigateExercise(1);
    }
  };

  const handleWorkoutDone = () => {
    setShowCompletion(false);
    setIsWorkoutStarted(false);
    setCurrentExercise(0);
    setCurrentSet(1);
    setTotalTime(0);
    setExercises(initializeExercises());
    setWorkoutNotes("");
  };

  const handleShare = () => {
    toast.success("Workout shared!");
  };

  // Calculate personal records (mock)
  const getPersonalRecords = () => {
    const records: { exercise: string; type: string; value: string }[] = [];
    exercises.forEach((e) => {
      const lastData = lastWorkoutData[e.id];
      if (lastData && e.weight > lastData.weight) {
        records.push({
          exercise: e.name,
          type: "weight",
          value: `${e.weight}kg (+${e.weight - lastData.weight}kg)`,
        });
      }
    });
    return records;
  };

  if (!isWorkoutStarted) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">
              {todayWorkout.name}
            </h1>
            <p className="text-muted-foreground">
              {exercises.length} exercises • {todayWorkout.duration} min •{" "}
              {todayWorkout.calories} cal
            </p>
          </motion.div>

          <div className="mb-6 flex justify-center">
            <LottieAnimation type="bench-press" size={150} />
          </div>

          <GlassCard className="mb-6 p-4">
            <h3 className="mb-3 font-semibold text-foreground">Muscle Groups</h3>
            <div className="flex flex-wrap gap-2">
              {todayWorkout.muscleGroups.map((group) => (
                <span
                  key={group}
                  className="rounded-full bg-fitness-purple/20 px-3 py-1 text-sm font-medium text-fitness-purple"
                >
                  {group}
                </span>
              ))}
            </div>
          </GlassCard>

          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  className="p-4"
                  onClick={() =>
                    setExpandedExercise(
                      expandedExercise === exercise.id ? null : exercise.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fitness-orange/20 text-sm font-bold text-fitness-orange">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {exercise.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight > 0 && ` • ${exercise.weight}kg`}
                        </p>
                      </div>
                    </div>
                    {expandedExercise === exercise.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedExercise === exercise.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 flex justify-center overflow-hidden"
                      >
                        <LottieAnimation
                          type={exercise.animation}
                          size={100}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-6">
            <AnimatedButton
              variant="gradient"
              fullWidth
              size="lg"
              icon={<Play className="h-5 w-5" />}
              onClick={() => {
                setIsWorkoutStarted(true);
                voiceCoaching.announceWorkoutStart();
                const firstExercise = exercises[0];
                setTimeout(() => {
                  voiceCoaching.announceExercise(
                    firstExercise.name,
                    firstExercise.sets,
                    firstExercise.reps,
                    firstExercise.weight
                  );
                }, 1500);
              }}
            >
              Start Workout
            </AnimatedButton>
          </div>
        </div>
      </PageTransition>
    );
  }

  const activeExercise = exercises[currentExercise];
  const lastWorkout = lastWorkoutData[activeExercise.id] || null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {todayWorkout.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Exercise {currentExercise + 1} of {exercises.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VoiceCoachingToggle
              isEnabled={voiceCoaching.isEnabled}
              isSpeaking={voiceCoaching.isSpeaking}
              onToggle={voiceCoaching.toggleEnabled}
            />
            <ProgressRing progress={progress} size={50} strokeWidth={4}>
              <span className="text-xs font-bold">{Math.round(progress)}%</span>
            </ProgressRing>
          </div>
        </motion.div>

        {/* Quick Stats Panel */}
        <div className="mb-4">
          <QuickStatsPanel
            totalTime={totalTime}
            totalVolume={totalVolume}
            exercisesCompleted={completedCount}
            totalExercises={exercises.length}
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-4 flex gap-1">
          {exercises.map((e, i) => (
            <motion.div
              key={e.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                e.completed
                  ? "bg-fitness-success"
                  : i === currentExercise
                  ? "bg-fitness-orange"
                  : "bg-muted"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>

        {/* Rest Timer */}
        <AnimatePresence>
          {isResting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6"
            >
              <EnhancedRestTimer
                initialTime={activeExercise.restTime}
                onComplete={handleRestComplete}
                onSkip={handleSkipRest}
                voiceEnabled={voiceCoaching.isEnabled}
                onVoiceToggle={voiceCoaching.toggleEnabled}
                onCountdown={voiceCoaching.announceRestCountdown}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* RPE Selector Modal */}
        <AnimatePresence>
          {showRPESelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm"
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground text-center mb-4">
                    Set {currentSet} Complete!
                  </h3>
                  <RPESelector value={null} onChange={handleRPESelected} />
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Exercise */}
        {!isResting && !showRPESelector && (
          <motion.div
            key={activeExercise.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleSwipe}
            initial={{ opacity: 0, x: swipeDirection * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -swipeDirection * 50 }}
          >
            <GlassCard className="mb-4 p-4">
              {/* Navigation Arrows */}
              <div className="flex items-center justify-between mb-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateExercise(-1)}
                  disabled={currentExercise === 0}
                  className={`p-2 rounded-full ${
                    currentExercise === 0
                      ? "text-muted/50"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                <span className="text-xs text-muted-foreground">
                  Swipe to navigate
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateExercise(1)}
                  disabled={currentExercise === exercises.length - 1}
                  className={`p-2 rounded-full ${
                    currentExercise === exercises.length - 1
                      ? "text-muted/50"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Last Workout Comparison */}
              <LastWorkoutComparison
                lastWorkout={lastWorkout}
                currentWeight={activeExercise.weight}
              />

              {/* Exercise Video Toggle */}
              <ExerciseVideoToggle
                exerciseName={activeExercise.name}
                animationType={activeExercise.animation}
              />

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeExercise.name}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {activeExercise.reps} reps
                </p>
              </div>

              {/* Weight Quick Adjuster */}
              {activeExercise.weight > 0 && (
                <div className="mt-4">
                  <WeightAdjuster
                    weight={activeExercise.weight}
                    onChange={handleWeightChange}
                  />
                </div>
              )}

              {/* Set-by-Set View */}
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Sets
                </p>
                {activeExercise.setData.map((set, index) => (
                  <SetCard
                    key={index}
                    set={set}
                    isActive={index === currentSet - 1 && !set.completed}
                    onClick={() => handleSetClick(index)}
                  />
                ))}
              </div>

              <AnimatedButton
                variant="gradient"
                fullWidth
                size="lg"
                className="mt-6"
                icon={<Check className="h-5 w-5" />}
                onClick={handleSetComplete}
                disabled={activeExercise.setData[currentSet - 1]?.completed}
              >
                Complete Set {currentSet}
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        )}

        {/* Exercise List (collapsed) */}
        <div className="space-y-2">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                exercise.completed
                  ? "bg-fitness-success/10"
                  : index === currentExercise
                  ? "bg-fitness-orange/10 ring-1 ring-fitness-orange"
                  : "bg-muted/30"
              }`}
              onClick={() => {
                if (!exercise.completed && index !== currentExercise) {
                  setCurrentExercise(index);
                  setCurrentSet(1);
                  setIsResting(false);
                }
              }}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  exercise.completed
                    ? "bg-fitness-success text-white"
                    : index === currentExercise
                    ? "bg-fitness-orange text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {exercise.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    exercise.completed
                      ? "text-fitness-success"
                      : "text-foreground"
                  }`}
                >
                  {exercise.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {exercise.setData.filter((s) => s.completed).length}/{exercise.sets} sets
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Notes Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNotesModal(true)}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-fitness-purple shadow-lg shadow-fitness-purple/30"
        >
          <StickyNote className="h-6 w-6 text-white" />
          {workoutNotes && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-fitness-orange" />
          )}
        </motion.button>

        {/* Notes Modal */}
        <WorkoutNotesModal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          notes={workoutNotes}
          onSave={setWorkoutNotes}
        />

        {/* Completion Screen */}
        <AnimatePresence>
          {showCompletion && (
            <CompletionScreen
              workoutName={todayWorkout.name}
              totalTime={totalTime}
              totalVolume={totalVolume}
              totalSets={exercises.reduce((acc, e) => acc + e.sets, 0)}
              totalReps={exercises.reduce(
                (acc, e) =>
                  acc + e.setData.filter((s) => s.completed).reduce((sum, s) => sum + s.reps, 0),
                0
              )}
              caloriesBurned={todayWorkout.calories}
              personalRecords={getPersonalRecords()}
              onDone={handleWorkoutDone}
              onShare={handleShare}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
});

Workout.displayName = "Workout";

export default Workout;
