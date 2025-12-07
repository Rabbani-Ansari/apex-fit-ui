// Database Types for Supabase
// Auto-generated types matching our schema

export type MemberStatus = 'active' | 'expired' | 'trial';
export type AssignmentStatus = 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type PaymentType = 'membership' | 'pt' | 'product';
export type TaskStepStatus = 'pending' | 'completed';
export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
export type BodyPart = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full-body';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Table Row Types
export interface GymBranding {
    id: string;
    user_id: string | null;
    gym_name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    address: string | null;
    contact_number: string | null;
    website_url: string | null;
    created_at: string;
}

export interface Trainer {
    id: string;
    gym_id: string | null;
    name: string;
    photo: string | null;
    specialization: string | null;
    phone: string | null;
    experience: string | null;
    created_at: string;
}

export interface Member {
    id: string;
    auth_id: string | null;
    gym_id: string | null;
    name: string;
    phone: string;
    email: string;
    photo: string | null;
    plan: string;
    start_date: string;
    expiry_date: string;
    status: MemberStatus;
    payment_due: number;
    address: string | null;
    created_at: string;
    updated_at: string;
}

export interface MemberPayment {
    id: string;
    member_id: string;
    amount: number;
    type: PaymentType;
    status: PaymentStatus;
    date: string;
    description: string | null;
    created_at: string;
}

export interface Workout {
    id: string;
    gym_id: string | null;
    trainer_id: string | null;
    name: string;
    description: string | null;
    difficulty: DifficultyLevel;
    duration: number | null;
    calories: number | null;
    body_part: BodyPart | null;
    muscle_groups: string[] | null;
    thumbnail: string | null;
    video_url: string | null;
    created_at: string;
}

export interface WorkoutExercise {
    id: string;
    workout_id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest_time: number;
    notes: string | null;
    order_index: number;
    animation_url: string | null;
    animation_type: string | null;
    created_at: string;
}

export interface WorkoutAssignment {
    id: string;
    member_id: string;
    workout_id: string;
    status: AssignmentStatus;
    assigned_at: string;
    completed_at: string | null;
}

export interface DietPlan {
    id: string;
    gym_id: string | null;
    name: string;
    target_calories: number | null;
    protein_target: number | null;
    carbs_target: number | null;
    fat_target: number | null;
    water_target: number;
    supplements: string[] | null;
    special_instructions: string | null;
    created_at: string;
}

export interface DietMealItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity?: string;
    image?: string;
}

export interface DietMeal {
    id: string;
    diet_plan_id: string;
    meal_time: MealTime;
    time_label: string | null;
    items: DietMealItem[];
    order_index: number;
}

export interface DietAssignment {
    id: string;
    member_id: string;
    diet_plan_id: string;
    status: AssignmentStatus;
    start_date: string;
    end_date: string | null;
    assigned_at: string;
}

export interface MemberAttendance {
    id: string;
    member_id: string;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    created_at: string;
}

export interface MemberMeasurement {
    id: string;
    member_id: string;
    date: string;
    weight: number | null;
    height: number | null;
    body_fat: number | null;
    bmi: number | null;
    created_at: string;
}

export interface MemberTaskStep {
    id: string;
    member_id: string;
    step_count: number;
    status: TaskStepStatus;
    notes: string | null;
    assigned_at: string;
    completed_at: string | null;
}

export interface WorkoutLog {
    id: string;
    member_id: string;
    workout_id: string | null;
    exercise_id: string | null;
    set_number: number | null;
    reps: number | null;
    weight: number | null;
    rpe: number | null;
    notes: string | null;
    completed_at: string;
}

export interface ProgressPhoto {
    id: string;
    member_id: string;
    photo_url: string;
    date: string;
    notes: string | null;
    created_at: string;
}

export interface MemberMilestone {
    id: string;
    member_id: string;
    title: string;
    icon: string;
    achieved: boolean;
    achieved_date: string | null;
    created_at: string;
}

export interface MemberPreferences {
    id: string;
    member_id: string;
    theme_mode: 'light' | 'dark' | 'system';
    accent_color_name: string;
    accent_color_hue: number;
    accent_color_saturation: number;
    accent_color_lightness: number;
    notifications_enabled: boolean;
    metric_units: boolean;
    created_at: string;
    updated_at: string;
}

// Extended types with relations
export interface WorkoutWithExercises extends Workout {
    exercises: WorkoutExercise[];
    trainer?: Trainer;
}

export interface WorkoutAssignmentWithDetails extends WorkoutAssignment {
    workout: WorkoutWithExercises;
}

export interface DietPlanWithMeals extends DietPlan {
    meals: DietMeal[];
}

export interface DietAssignmentWithDetails extends DietAssignment {
    diet_plan: DietPlanWithMeals;
}

export interface MemberWithTrainer extends Member {
    trainer?: Trainer;
}

// Database type for Supabase client
export interface Database {
    public: {
        Tables: {
            gym_branding: {
                Row: GymBranding;
                Insert: Partial<GymBranding>;
                Update: Partial<GymBranding>;
                Relationships: [];
            };
            trainers: {
                Row: Trainer;
                Insert: Partial<Trainer>;
                Update: Partial<Trainer>;
                Relationships: [];
            };
            members: {
                Row: Member;
                Insert: Partial<Member>;
                Update: Partial<Member>;
                Relationships: [];
            };
            member_payments: {
                Row: MemberPayment;
                Insert: Partial<MemberPayment>;
                Update: Partial<MemberPayment>;
                Relationships: [];
            };
            workouts: {
                Row: Workout;
                Insert: Partial<Workout>;
                Update: Partial<Workout>;
                Relationships: [];
            };
            workout_exercises: {
                Row: WorkoutExercise;
                Insert: Partial<WorkoutExercise>;
                Update: Partial<WorkoutExercise>;
                Relationships: [];
            };
            workout_assignments: {
                Row: WorkoutAssignment;
                Insert: Partial<WorkoutAssignment>;
                Update: Partial<WorkoutAssignment>;
                Relationships: [];
            };
            diet_plans: {
                Row: DietPlan;
                Insert: Partial<DietPlan>;
                Update: Partial<DietPlan>;
                Relationships: [];
            };
            diet_meals: {
                Row: DietMeal;
                Insert: Partial<DietMeal>;
                Update: Partial<DietMeal>;
                Relationships: [];
            };
            diet_assignments: {
                Row: DietAssignment;
                Insert: Partial<DietAssignment>;
                Update: Partial<DietAssignment>;
                Relationships: [];
            };
            member_attendance: {
                Row: MemberAttendance;
                Insert: Partial<MemberAttendance>;
                Update: Partial<MemberAttendance>;
                Relationships: [];
            };
            member_measurements: {
                Row: MemberMeasurement;
                Insert: Partial<MemberMeasurement>;
                Update: Partial<MemberMeasurement>;
                Relationships: [];
            };
            member_task_steps: {
                Row: MemberTaskStep;
                Insert: Partial<MemberTaskStep>;
                Update: Partial<MemberTaskStep>;
                Relationships: [];
            };
            workout_logs: {
                Row: WorkoutLog;
                Insert: Partial<WorkoutLog>;
                Update: Partial<WorkoutLog>;
                Relationships: [];
            };
            progress_photos: {
                Row: ProgressPhoto;
                Insert: Partial<ProgressPhoto>;
                Update: Partial<ProgressPhoto>;
                Relationships: [];
            };
            member_milestones: {
                Row: MemberMilestone;
                Insert: Partial<MemberMilestone>;
                Update: Partial<MemberMilestone>;
                Relationships: [];
            };
            member_preferences: {
                Row: MemberPreferences;
                Insert: Partial<MemberPreferences>;
                Update: Partial<MemberPreferences>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

// Notification types
export type NotificationType = 'workout' | 'diet' | 'membership' | 'achievement' | 'announcement';

export interface MemberNotification {
    id: string;
    member_id: string;
    type: NotificationType;
    title: string;
    message: string;
    icon: string;
    action_url: string | null;
    is_read: boolean;
    created_at: string;
}
