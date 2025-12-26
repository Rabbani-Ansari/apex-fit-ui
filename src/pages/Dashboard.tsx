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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient Background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-fitness-purple/5 blur-[100px]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-fitness-orange/5 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <GreetingHeader
            name={displayMember?.name || "Member"}
            avatar={displayMember?.photo || undefined}
            streak={currentStreak}
          />

          <div className="space-y-6 pb-24">
            <QuickStatsRow
              streak={currentStreak}
              weightLoss={0}
              adherence={85}
            />

            {/* Horizontal Scroll Section */}
            <div>
              <div className="flex items-center justify-between px-6 mb-3">
                <h2 className="text-lg font-bold text-foreground">Today's Focus</h2>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-4 scrollbar-hide -mx-2">
                <div className="min-w-[85vw] md:min-w-[400px] snap-center first:pl-2">
                  {workoutLoading ? (
                    <div className="h-48 rounded-2xl bg-card flex items-center justify-center">
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
                    <div className="h-48 p-6 rounded-2xl bg-card text-center flex items-center justify-center">
                      <p className="text-muted-foreground">No workout assigned</p>
                    </div>
                  )}
                </div>

                <div className="min-w-[85vw] md:min-w-[400px] snap-center last:pr-2">
                  {dietSummary.isLoading ? (
                    <div className="h-48 rounded-2xl bg-card flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : dietSummary.meals.length > 0 ? (
                    <DietSummaryCard
                      meals={dietSummary.meals.map((m) => ({
                        id: m.id,
                        type: m.type,
                        time: m.time,
                        completed: false,
                      }))}
                      calories={{
                        consumed: 0,
                        target: dietSummary.targetCalories,
                      }}
                      protein={dietSummary.protein}
                      carbs={dietSummary.carbs}
                      fat={dietSummary.fat}
                    />
                  ) : (
                    <div className="h-48 p-6 rounded-2xl bg-card text-center flex items-center justify-center">
                      <p className="text-muted-foreground">No diet plan assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </PageTransition>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;

