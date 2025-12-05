import { useState, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Search,
  X,
  Camera,
  Clock,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { MacroRing } from "@/components/ui/MacroRing";
import { WaterTracker } from "@/components/ui/WaterTracker";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { todayDiet, indianFoods } from "@/data/mockData";

const Diet = memo(() => {
  const [meals, setMeals] = useState(todayDiet.meals);
  const [expandedMeal, setExpandedMeal] = useState<string | null>("m1");
  const [waterIntake, setWaterIntake] = useState(todayDiet.water.consumed);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const filteredFoods = indianFoods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addWater = () => {
    if (waterIntake < todayDiet.water.target) {
      setWaterIntake((prev) => prev + 1);
    }
  };

  const toggleMealComplete = (mealId: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, completed: !m.completed } : m))
    );
  };

  const openFoodSearch = (mealId: string) => {
    setSelectedMealId(mealId);
    setShowFoodSearch(true);
  };

  const addFoodToMeal = (food: (typeof indianFoods)[0]) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === selectedMealId
          ? {
              ...m,
              foods: [
                ...m.foods,
                {
                  name: food.name,
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat,
                },
              ],
            }
          : m
      )
    );
    setShowFoodSearch(false);
    setSearchQuery("");
  };

  const totalConsumed = meals.reduce(
    (acc, meal) => {
      if (!meal.completed) return acc;
      meal.foods.forEach((food) => {
        acc.calories += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
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
          <h1 className="text-2xl font-bold text-foreground">Diet Logger</h1>
          <p className="text-muted-foreground">
            Track your meals and nutrition
          </p>
        </motion.div>

        {/* Macro Overview */}
        <GlassCard className="mb-6 p-4">
          <div className="flex items-center justify-around">
            <MacroRing
              label="Calories"
              current={totalConsumed.calories}
              target={todayDiet.targetCalories}
              unit=""
              color="hsl(var(--fitness-orange))"
              size={70}
            />
            <MacroRing
              label="Protein"
              current={totalConsumed.protein}
              target={todayDiet.protein.target}
              color="hsl(var(--fitness-purple))"
              size={70}
            />
            <MacroRing
              label="Carbs"
              current={totalConsumed.carbs}
              target={todayDiet.carbs.target}
              color="hsl(var(--fitness-yellow))"
              size={70}
            />
            <MacroRing
              label="Fat"
              current={totalConsumed.fat}
              target={todayDiet.fat.target}
              color="hsl(var(--fitness-pink))"
              size={70}
            />
          </div>
        </GlassCard>

        {/* Water Tracker */}
        <GlassCard className="mb-6 p-4">
          <WaterTracker
            current={waterIntake}
            target={todayDiet.water.target}
            onAdd={addWater}
          />
        </GlassCard>

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
                  className={`flex cursor-pointer items-center justify-between p-4 ${
                    meal.completed ? "bg-fitness-success/5" : ""
                  }`}
                  onClick={() =>
                    setExpandedMeal(expandedMeal === meal.id ? null : meal.id)
                  }
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMealComplete(meal.id);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        meal.completed
                          ? "bg-fitness-success text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {meal.completed ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-lg">
                          {meal.type === "Breakfast"
                            ? "🍳"
                            : meal.type === "Lunch"
                            ? "🍱"
                            : meal.type === "Snacks"
                            ? "🍎"
                            : "🍽️"}
                        </span>
                      )}
                    </motion.button>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {meal.type}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {meal.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {meal.foods.reduce((a, f) => a + f.calories, 0)} cal
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
                                P: {food.protein}g • C: {food.carbs}g • F:{" "}
                                {food.fat}g
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-fitness-orange">
                              {food.calories} cal
                            </span>
                          </motion.div>
                        ))}

                        <div className="flex gap-2 pt-2">
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={() => openFoodSearch(meal.id)}
                          >
                            Add Food
                          </AnimatedButton>
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            icon={<Camera className="h-4 w-4" />}
                          >
                            Photo
                          </AnimatedButton>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Food Search Modal */}
        <AnimatePresence>
          {showFoodSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
            >
              <div className="flex h-full flex-col p-4">
                {/* Search Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Indian foods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fitness-orange"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowFoodSearch(false);
                      setSearchQuery("");
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Category Pills */}
                <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {[
                    "All",
                    "Protein",
                    "Dal",
                    "Grain",
                    "Vegetable",
                    "Fruit",
                    "Dairy",
                    "Dish",
                  ].map((cat) => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setSearchQuery(cat === "All" ? "" : cat.toLowerCase())
                      }
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        (cat === "All" && !searchQuery) ||
                        searchQuery.toLowerCase() === cat.toLowerCase()
                          ? "bg-fitness-orange text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>

                {/* Food List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredFoods.slice(0, 30).map((food, index) => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addFoodToMeal(food)}
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-card p-4 transition-colors hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {food.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-fitness-orange">
                          {food.calories}
                        </span>
                        <p className="text-xs text-muted-foreground">cal</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
});

Diet.displayName = "Diet";

export default Diet;
