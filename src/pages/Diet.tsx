import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { MacroRing } from "@/components/ui/MacroRing";
import { WaterTracker } from "@/components/ui/WaterTracker";
import { useDietSummary } from "@/hooks/useDiet";

const Diet = memo(() => {
  const { isLoading, plan, meals, targetCalories, protein, carbs, fat, water } = useDietSummary();

  const [expandedMeal, setExpandedMeal] = useState<string | null>(meals[0]?.id || null);
  const [waterIntake, setWaterIntake] = useState(0);
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());

  const addWater = () => {
    if (waterIntake < water.target) {
      setWaterIntake((prev) => prev + 1);
    }
  };

  const toggleMealComplete = (mealId: string) => {
    setCompletedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

  const totalConsumed = meals.reduce(
    (acc, meal) => {
      if (!completedMeals.has(meal.id)) return acc;
      acc.calories += meal.calories;
      meal.foods.forEach((food) => {
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (!plan) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-foreground">Diet Plan</h1>
            <p className="text-muted-foreground">Your assigned nutrition plan</p>
          </motion.div>

          <GlassCard className="p-6 text-center">
            <p className="text-muted-foreground">No diet plan assigned yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Contact your trainer to get a personalized diet plan.</p>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
          <p className="text-muted-foreground">Your assigned nutrition plan</p>
        </motion.div>

        {/* Macro Overview */}
        <GlassCard className="mb-6 p-4">
          <div className="flex items-center justify-around">
            <MacroRing
              label="Calories"
              current={totalConsumed.calories}
              target={targetCalories}
              unit=""
              color="hsl(var(--fitness-orange))"
              size={70}
            />
            <MacroRing
              label="Protein"
              current={totalConsumed.protein}
              target={protein.target}
              color="hsl(var(--fitness-purple))"
              size={70}
            />
            <MacroRing
              label="Carbs"
              current={totalConsumed.carbs}
              target={carbs.target}
              color="hsl(var(--fitness-yellow))"
              size={70}
            />
            <MacroRing
              label="Fat"
              current={totalConsumed.fat}
              target={fat.target}
              color="hsl(var(--fitness-pink))"
              size={70}
            />
          </div>
        </GlassCard>

        {/* Water Tracker */}
        <GlassCard className="mb-6 p-4">
          <WaterTracker
            current={waterIntake}
            target={water.target}
            onAdd={addWater}
          />
        </GlassCard>

        {/* Special Instructions */}
        {plan.special_instructions && (
          <GlassCard className="mb-6 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Special Instructions</h3>
            <p className="text-sm text-muted-foreground">{plan.special_instructions}</p>
          </GlassCard>
        )}

        {/* Supplements */}
        {plan.supplements && plan.supplements.length > 0 && (
          <GlassCard className="mb-6 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Supplements</h3>
            <div className="flex flex-wrap gap-2">
              {plan.supplements.map((supplement, idx) => (
                <span key={idx} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {supplement}
                </span>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Meals */}
        <div className="space-y-3">
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="overflow-hidden">
                {/* Meal Header */}
                <motion.div
                  className={`flex cursor-pointer items-center justify-between p-4 ${completedMeals.has(meal.id) ? "bg-fitness-success/5" : ""}`}
                  onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMealComplete(meal.id);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${completedMeals.has(meal.id)
                        ? "bg-fitness-success text-white"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {completedMeals.has(meal.id) ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-lg">
                          {meal.type === "breakfast"
                            ? "🍳"
                            : meal.type === "lunch"
                              ? "🍱"
                              : meal.type === "snack"
                                ? "🍎"
                                : meal.type === "dinner"
                                  ? "🍽️"
                                  : "🥗"}
                        </span>
                      )}
                    </motion.button>
                    <div>
                      <h3 className="font-semibold text-foreground capitalize">
                        {meal.type}
                      </h3>
                      {meal.time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {meal.time}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {meal.calories} cal
                    </span>
                    {expandedMeal === meal.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>

                {/* Meal Details */}
                <AnimatePresence>
                  {expandedMeal === meal.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/50"
                    >
                      <div className="p-4 pt-3 space-y-2">
                        {meal.foods.map((food, foodIndex) => (
                          <motion.div
                            key={foodIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: foodIndex * 0.05 }}
                            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {food.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-fitness-orange">
                              {food.calories} cal
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
});

Diet.displayName = "Diet";

export default Diet;
