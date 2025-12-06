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
}

interface DbDietMeal {
    id: string;
    diet_plan_id: string;
    meal_time: string;
    items: DietMealItem[];
    created_at: string;
}

interface DbDietPlan {
    id: string;
    name: string;
    trainer_id: string | null;
    category: string;
    diet_goal: string;
    diet_type: string;
    target_calories: number;
    duration: number;
    description: string | null;
    thumbnail: string | null;
    water_intake: number | null;
    supplements: string[] | null;
    special_instructions: string | null;
    macros_calories: number;
    macros_protein: number;
    macros_carbs: number;
    macros_fat: number;
    created_at: string;
    updated_at: string;
    meals: DbDietMeal[];
}

interface DbDietAssignment {
    id: string;
    diet_plan_id: string;
    member_id: string;
    start_date: string;
    end_date: string;
    status: string;
    notify_email: boolean;
    notify_sms: boolean;
    notify_whatsapp: boolean;
    created_at: string;
    diet_plan: DbDietPlan;
}

export function useDietPlan() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['diet-plan', member?.id],
        queryFn: async (): Promise<DbDietAssignment | null> => {
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
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching diet plan:', error);
                return null;
            }

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

    // Transform meals from database
    const meals: MealData[] = plan.meals.map((meal) => {
        const mealCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
        
        return {
            id: meal.id,
            type: meal.meal_time,
            time: getMealTimeLabel(meal.meal_time),
            calories: mealCalories,
            foods: meal.items,
        };
    });

    // Sort meals by meal time order
    const mealOrder = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'snack', 'dinner', 'evening_snack'];
    meals.sort((a, b) => mealOrder.indexOf(a.type) - mealOrder.indexOf(b.type));

    return {
        isLoading: false,
        plan,
        targetCalories: plan.target_calories || plan.macros_calories || 2000,
        protein: { target: plan.macros_protein || 150, consumed: 0 },
        carbs: { target: plan.macros_carbs || 200, consumed: 0 },
        fat: { target: plan.macros_fat || 60, consumed: 0 },
        water: { target: plan.water_intake || 8, consumed: 0 },
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
        snack: '4:00 - 5:00 PM',
        dinner: '7:00 - 9:00 PM',
        evening_snack: '9:30 PM',
    };
    return labels[mealTime] || '';
}
