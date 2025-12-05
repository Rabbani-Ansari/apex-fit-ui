import { memo } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { MembershipCard } from "@/components/dashboard/MembershipCard";
import { TodayWorkoutCard } from "@/components/dashboard/TodayWorkoutCard";
import { DietSummaryCard } from "@/components/dashboard/DietSummaryCard";
import { QuickStatsRow } from "@/components/dashboard/QuickStatsRow";
import { useAuth } from "@/contexts/AuthContext";
import { useMember, useMembershipStatus } from "@/hooks/useMember";
import { useTodayWorkout } from "@/hooks/useWorkouts";
import { useDietSummary } from "@/hooks/useDiet";
import { useAttendanceStats } from "@/hooks/useAttendance";
import { Loader2 } from "lucide-react";

const Dashboard = memo(() => {
  const { member } = useAuth();
  const { data: memberData, isLoading: memberLoading } = useMember();
  const { daysLeft, isActive } = useMembershipStatus();
  const { workout, isLoading: workoutLoading } = useTodayWorkout();
  const dietSummary = useDietSummary();
  const { currentStreak } = useAttendanceStats();

  const displayMember = memberData || member;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <GreetingHeader
          name={displayMember?.name || "Member"}
          avatar={displayMember?.photo || undefined}
          streak={currentStreak}
        />

        <div className="space-y-5 pb-6">
          <MembershipCard
            plan={displayMember?.plan || "Standard"}
            expiry={displayMember?.expiry_date
              ? new Date(displayMember.expiry_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              : "N/A"
            }
            daysLeft={daysLeft}
            progress={Math.min(100, Math.max(0, (daysLeft / 30) * 100))}
          />

          {workoutLoading ? (
            <div className="mx-4 p-8 rounded-2xl bg-card flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : workout ? (
            <TodayWorkoutCard
              name={workout.name}
              duration={workout.duration || 45}
              calories={workout.calories || 300}
              exercises={workout.exercises?.length || 0}
              difficulty={workout.difficulty}
              muscleGroups={workout.muscle_groups || []}
            />
          ) : (
            <div className="mx-4 p-6 rounded-2xl bg-card text-center">
              <p className="text-muted-foreground">No workout assigned for today</p>
            </div>
          )}

          {dietSummary.isLoading ? (
            <div className="mx-4 p-8 rounded-2xl bg-card flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : dietSummary.meals.length > 0 ? (
            <DietSummaryCard
              meals={dietSummary.meals.map((m) => ({
                id: m.id,
                type: m.type,
                time: m.time,
                completed: m.completed,
              }))}
              calories={{
                consumed: dietSummary.consumedCalories,
                target: dietSummary.targetCalories,
              }}
              protein={dietSummary.protein}
              carbs={dietSummary.carbs}
              fat={dietSummary.fat}
            />
          ) : (
            <div className="mx-4 p-6 rounded-2xl bg-card text-center">
              <p className="text-muted-foreground">No diet plan assigned</p>
            </div>
          )}

          <QuickStatsRow
            streak={currentStreak}
            weightLoss={0}
            adherence={85}
          />
        </div>
      </div>
    </PageTransition>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;

