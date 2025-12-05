import { memo, useMemo } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { MembershipCard } from "@/components/dashboard/MembershipCard";
import { TodayWorkoutCard } from "@/components/dashboard/TodayWorkoutCard";
import { DietSummaryCard } from "@/components/dashboard/DietSummaryCard";
import { QuickStatsRow } from "@/components/dashboard/QuickStatsRow";
import { userData, todayWorkout, todayDiet } from "@/data/mockData";

const Dashboard = memo(() => {
  const calculateDaysLeft = () => {
    const expiry = new Date(userData.planExpiry);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const weightLoss = Math.round(82 - userData.weight);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <GreetingHeader
          name={userData.name}
          avatar={userData.avatar}
          streak={userData.streak}
        />

        <div className="space-y-5 pb-6">
          <MembershipCard
            plan={userData.plan}
            expiry={new Date(userData.planExpiry).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            daysLeft={calculateDaysLeft()}
            progress={75}
          />

          <TodayWorkoutCard
            name={todayWorkout.name}
            duration={todayWorkout.duration}
            calories={todayWorkout.calories}
            exercises={todayWorkout.exercises.length}
            difficulty={todayWorkout.difficulty}
            muscleGroups={todayWorkout.muscleGroups}
          />

          <DietSummaryCard
            meals={todayDiet.meals.map((m) => ({
              id: m.id,
              type: m.type,
              time: m.time,
              completed: m.completed,
            }))}
            calories={{
              consumed: todayDiet.consumedCalories,
              target: todayDiet.targetCalories,
            }}
            protein={todayDiet.protein}
            carbs={todayDiet.carbs}
            fat={todayDiet.fat}
          />

          <QuickStatsRow
            streak={userData.streak}
            weightLoss={weightLoss}
            adherence={85}
          />
        </div>
      </div>
    </PageTransition>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
