import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Match actual database schema
interface DietMealItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity?: string;
    image?: string;
}

interface DbDietMeal {
    id: string;
    diet_plan_id: string;
    meal_time: string;
    time_label: string | null;
    items: DietMealItem[];
    order_index: number;
}

interface DbDietPlan {
    id: string;
    name: string;
    gym_id: string | null;
    target_calories: number | null;
    protein_target: number | null;
    carbs_target: number | null;
    fat_target: number | null;
    water_target: number;
    supplements: string[] | null;
    special_instructions: string | null;
    created_at: string;
    meals: DbDietMeal[];
}

interface DbDietAssignment {
    id: string;
    diet_plan_id: string;
    member_id: string;
    start_date: string;
    end_date: string | null;
    status: string;
    assigned_at: string;
    diet_plan: DbDietPlan;
}

export function useDietPlan() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['diet-plan', member?.id],
        queryFn: async (): Promise<DbDietAssignment | null> => {
            // ==== DEBUG: Query ALL diet_assignments without filters ====
            const { data: allDietAssignments, error: debugError } = await (supabase as any)
                .from('diet_assignments')
                .select('id, member_id, diet_plan_id, status, start_date')
                .limit(10);

            console.log('🔍 [DEBUG] ALL diet_assignments (no filter):', allDietAssignments);
            console.log('🔍 [DEBUG] Error if any:', debugError);

            // ==== DEBUG: Query ALL diet_plans ====
            const { data: allDietPlans } = await (supabase as any)
                .from('diet_plans')
                .select('id, name')
                .limit(5);
            console.log('🔍 [DEBUG] ALL diet_plans (no filter):', allDietPlans);
            // ==== END DEBUG ====

            if (!member?.id) {
                console.log('🔍 [useDietPlan] No member ID found');
                return null;
            }

            console.log('🔍 [useDietPlan] Current member ID from auth:', member.id);

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
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching diet plan:', error);
                return null;
            }

            console.log('🔍 [useDietPlan] Filtered result for member:', data);
            return data as DbDietAssignment | null;
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Transformed meal for frontend use
interface MealData {
    id: string;
    type: string;
    time: string;
    calories: number;
    foods: DietMealItem[];
}

// Calculate today's diet summary
export function useDietSummary() {
    const { member } = useAuth();
    const { data: dietAssignment, isLoading: queryLoading } = useDietPlan();

    const isLoading = !!member?.id && queryLoading;

    if (!dietAssignment || isLoading) {
        return {
            isLoading,
            plan: null,
            targetCalories: 0,
            protein: { target: 0, consumed: 0 },
            carbs: { target: 0, consumed: 0 },
            fat: { target: 0, consumed: 0 },
            water: { target: 8, consumed: 0 },
            meals: [] as MealData[],
        };
    }

    const plan = dietAssignment.diet_plan;

    // Transform meals from database - handle items being possibly a string (JSON)
    const meals: MealData[] = (plan.meals || []).map((meal) => {
        // Parse items if it's a string
        const items = typeof meal.items === 'string'
            ? JSON.parse(meal.items) as DietMealItem[]
            : meal.items || [];

        const mealCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);

        // Normalize meal_time to lowercase for consistent matching
        const mealType = meal.meal_time?.toLowerCase() || 'other';

        return {
            id: meal.id,
            type: mealType,
            time: meal.time_label || getMealTimeLabel(mealType),
            calories: mealCalories,
            foods: items,
        };
    });

    // Sort meals by order_index if available, otherwise by meal time order
    meals.sort((a, b) => {
        const mealOrder = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'snacks', 'snack', 'dinner', 'evening_snack'];
        return mealOrder.indexOf(a.type) - mealOrder.indexOf(b.type);
    });

    return {
        isLoading: false,
        plan,
        targetCalories: plan.target_calories || 2000,
        protein: { target: plan.protein_target || 150, consumed: 0 },
        carbs: { target: plan.carbs_target || 200, consumed: 0 },
        fat: { target: plan.fat_target || 60, consumed: 0 },
        water: { target: plan.water_target || 8, consumed: 0 },
        meals,
    };
}

// Helper to get readable time label for meal type
function getMealTimeLabel(mealTime: string): string {
    const labels: Record<string, string> = {
        breakfast: '7:00 - 9:00 AM',
        morning_snack: '10:30 AM',
        lunch: '12:30 - 2:00 PM',
        afternoon_snack: '4:00 PM',
        snacks: '4:00 - 5:00 PM',
        snack: '4:00 - 5:00 PM',
        dinner: '7:00 - 9:00 PM',
        evening_snack: '9:30 PM',
    };
    return labels[mealTime] || '';
}

