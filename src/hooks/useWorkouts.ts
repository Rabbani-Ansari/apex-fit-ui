import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Trainer, WorkoutLog } from '@/types/database';

// Match actual database schema
interface DbWorkoutExercise {
    id: string;
    workout_id: string;
    name: string;
    sets: number;
    reps: string; // Database stores as text
    rest: string; // Database stores as text
    notes: string | null;
    order_index: number;
    animation_url: string | null;
    created_at: string;
}

interface DbWorkout {
    id: string;
    name: string;
    trainer_id: string | null;
    body_part: string;
    difficulty: string;
    equipment: string;
    duration: number;
    thumbnail: string | null;
    video_url: string | null;
    usage_count: number;
    created_at: string;
    updated_at: string;
    trainer: Trainer | null;
    exercises: DbWorkoutExercise[];
}

interface DbWorkoutAssignment {
    id: string;
    workout_id: string;
    member_id: string;
    assigned_at: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    active_days: string[] | null;
    notify: boolean | null;
    notes: string | null;
    workout: DbWorkout;
}

// Transformed types for frontend use
export interface WorkoutExerciseData {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    rest_time: number;
    notes: string | null;
    order_index: number;
    animation_url: string | null;
    animation_type: string | null;
}

export interface WorkoutData {
    id: string;
    name: string;
    duration: number;
    calories: number;
    difficulty: string;
    muscle_groups: string[];
    exercises: WorkoutExerciseData[];
    trainer: Trainer | null;
}

export function useWorkouts() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['workouts', member?.id],
        queryFn: async (): Promise<DbWorkoutAssignment[]> => {
            // ==== DEBUG: Query ALL workout_assignments without filters ====
            const { data: allAssignments, error: debugError } = await (supabase as any)
                .from('workout_assignments')
                .select('id, member_id, workout_id, status, assigned_at')
                .limit(10);

            console.log('🔍 [DEBUG] ALL workout_assignments (no filter):', allAssignments);
            console.log('🔍 [DEBUG] Error if any:', debugError);

            // ==== DEBUG: Query ALL workouts ====
            const { data: allWorkouts } = await (supabase as any)
                .from('workouts')
                .select('id, name')
                .limit(5);
            console.log('🔍 [DEBUG] ALL workouts (no filter):', allWorkouts);

            // ==== DEBUG: Query members table ====
            const { data: allMembers } = await (supabase as any)
                .from('members')
                .select('id, name, auth_id')
                .limit(5);
            console.log('🔍 [DEBUG] ALL members (no filter):', allMembers);
            // ==== END DEBUG ====

            if (!member?.id) {
                console.log('🔍 [useWorkouts] No member ID found, returning empty array');
                return [];
            }

            console.log('🔍 [useWorkouts] Current member ID from auth:', member.id);
            console.log('🔍 [useWorkouts] Looking for assignments with this member_id and status=active');

            const { data, error } = await supabase
                .from('workout_assignments')
                .select(`
                    *,
                    workout:workouts(
                        *,
                        trainer:trainers(*),
                        exercises:workout_exercises(*)
                    )
                `)
                .eq('member_id', member.id)
                .eq('status', 'active')
                .order('assigned_at', { ascending: false });

            if (error) {
                console.error('Error fetching workouts:', error);
                return [];
            }

            console.log('🔍 [useWorkouts] Filtered results for member:', data);
            console.log('🔍 [useWorkouts] Number of assignments found:', data?.length);

            // Sort exercises by order_index
            return (data as DbWorkoutAssignment[]).map(assignment => ({
                ...assignment,
                workout: {
                    ...assignment.workout,
                    exercises: assignment.workout.exercises.sort((a, b) => a.order_index - b.order_index),
                },
            }));
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Helper to parse reps string to number
const parseReps = (reps: string): number => {
    const match = reps.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
};

// Helper to parse rest string to seconds
const parseRestTime = (rest: string): number => {
    const match = rest.match(/\d+/);
    const value = match ? parseInt(match[0], 10) : 60;
    if (rest.toLowerCase().includes('min')) return value * 60;
    return value;
};

// Get today's active workout (first active assignment)
export function useTodayWorkout() {
    const { member } = useAuth();
    const { data: workouts, isLoading: queryLoading, error } = useWorkouts();

    // Only show loading if we have a member and the query is actually loading
    const isLoading = !!member?.id && queryLoading;

    console.log('🔍 [useTodayWorkout] Workouts array:', workouts);
    console.log('🔍 [useTodayWorkout] First assignment:', workouts?.[0]);

    // Transform database workout to frontend format
    const rawWorkout = workouts?.[0]?.workout ?? null;
    console.log('🔍 [useTodayWorkout] Raw workout:', rawWorkout);
    const transformedWorkout: WorkoutData | null = rawWorkout ? {
        id: rawWorkout.id,
        name: rawWorkout.name,
        duration: rawWorkout.duration,
        calories: Math.round(rawWorkout.duration * 8), // Estimate calories
        difficulty: rawWorkout.difficulty,
        muscle_groups: [rawWorkout.body_part],
        trainer: rawWorkout.trainer,
        exercises: rawWorkout.exercises.map(e => ({
            id: e.id,
            name: e.name,
            sets: e.sets,
            reps: parseReps(e.reps),
            weight: 0, // Default weight, user adjusts
            rest_time: parseRestTime(e.rest),
            notes: e.notes,
            order_index: e.order_index,
            animation_url: e.animation_url,
            animation_type: null,
        })),
    } : null;

    return {
        workout: transformedWorkout,
        assignment: workouts?.[0] ?? null,
        isLoading,
        error,
    };
}

// Get last workout logs for comparison
export function useLastWorkoutLogs(exerciseIds: string[]) {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['workout-logs', member?.id, exerciseIds],
        queryFn: async () => {
            if (!member?.id || exerciseIds.length === 0) return {};

            const { data, error } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('member_id', member.id)
                .in('exercise_id', exerciseIds)
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Error fetching workout logs:', error);
                return {};
            }

            // Group by exercise_id and get the latest log for each
            const logsByExercise: Record<string, WorkoutLog> = {};
            (data as WorkoutLog[]).forEach((log) => {
                if (!logsByExercise[log.exercise_id!]) {
                    logsByExercise[log.exercise_id!] = log;
                }
            });

            return logsByExercise;
        },
        enabled: !!member?.id && exerciseIds.length > 0,
        staleTime: 1000 * 60 * 5,
    });
}

// Log workout set completion
export function useLogWorkoutSet() {
    const { member } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            workoutId,
            exerciseId,
            setNumber,
            reps,
            weight,
            rpe,
            notes,
        }: {
            workoutId: string;
            exerciseId: string;
            setNumber: number;
            reps: number;
            weight: number;
            rpe?: number;
            notes?: string;
        }) => {
            if (!member?.id) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('workout_logs')
                .insert({
                    member_id: member.id,
                    workout_id: workoutId,
                    exercise_id: exerciseId,
                    set_number: setNumber,
                    reps,
                    weight,
                    rpe,
                    notes,
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workout-logs'] });
        },
    });
}

// Mark workout assignment as completed
export function useCompleteWorkout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assignmentId: string) => {
            const { error } = await supabase
                .from('workout_assignments')
                // @ts-ignore - Supabase types not generated for this table
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', assignmentId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
    });
}
