import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { DietPlan, DietMeal, DietAssignment } from '@/types/database';

interface DietPlanWithMeals extends DietPlan {
    meals: DietMeal[];
}

interface DietAssignmentWithPlan extends DietAssignment {
    diet_plan: DietPlanWithMeals;
}

export function useDietPlan() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['diet-plan', member?.id],
        queryFn: async (): Promise<DietAssignmentWithPlan | null> => {
            if (!member?.id) return null;

            const { data, error } = await supabase
                .from('diet_assignments')
                .select(`
          *,
          diet_plan:diet_plans(
            *,
            meals:diet_meals(*)
          )
        `)
                .eq('member_id', member.id)
                .eq('status', 'active')
                .order('assigned_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null;
                }
                console.error('Error fetching diet plan:', error);
                return null;
            }

            // Sort meals by order_index
            const assignment = data as DietAssignmentWithPlan;
            return {
                ...assignment,
                diet_plan: {
                    ...assignment.diet_plan,
                    meals: assignment.diet_plan.meals.sort((a, b) => a.order_index - b.order_index),
                },
            };
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Calculate today's diet summary (calories, macros consumed)
export function useDietSummary() {
    const { member } = useAuth();
    const { data: dietAssignment, isLoading: queryLoading } = useDietPlan();

    // Only show loading if we have a member and the query is actually loading
    const isLoading = !!member?.id && queryLoading;

    if (!dietAssignment || isLoading) {
        return {
            isLoading,
            targetCalories: 0,
            consumedCalories: 0,
            protein: { target: 0, consumed: 0 },
            carbs: { target: 0, consumed: 0 },
            fat: { target: 0, consumed: 0 },
            water: { target: 8, consumed: 0 },
            meals: [],
        };
    }

    const plan = dietAssignment.diet_plan;

    // Calculate totals from meal items
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const meals = plan.meals.map((meal) => {
        const mealCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
        const mealProtein = meal.items.reduce((sum, item) => sum + item.protein, 0);
        const mealCarbs = meal.items.reduce((sum, item) => sum + item.carbs, 0);
        const mealFat = meal.items.reduce((sum, item) => sum + item.fat, 0);

        totalCalories += mealCalories;
        totalProtein += mealProtein;
        totalCarbs += mealCarbs;
        totalFat += mealFat;

        return {
            id: meal.id,
            type: meal.meal_time,
            time: meal.time_label || '',
            foods: meal.items,
            calories: mealCalories,
            completed: false, // TODO: Track meal completion
        };
    });

    return {
        isLoading: false,
        targetCalories: plan.target_calories || 2000,
        consumedCalories: 0, // TODO: Track actual consumption
        protein: { target: plan.protein_target || 150, consumed: 0 },
        carbs: { target: plan.carbs_target || 200, consumed: 0 },
        fat: { target: plan.fat_target || 60, consumed: 0 },
        water: { target: plan.water_target || 8, consumed: 0 },
        meals,
        plan,
    };
}
