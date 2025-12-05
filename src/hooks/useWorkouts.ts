import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Workout, WorkoutExercise, WorkoutAssignment, Trainer, WorkoutLog } from '@/types/database';

interface WorkoutWithDetails extends Workout {
    exercises: WorkoutExercise[];
    trainer: Trainer | null;
}

interface WorkoutAssignmentWithWorkout extends WorkoutAssignment {
    workout: WorkoutWithDetails;
}

export function useWorkouts() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['workouts', member?.id],
        queryFn: async (): Promise<WorkoutAssignmentWithWorkout[]> => {
            if (!member?.id) return [];

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

            // Sort exercises by order_index
            return (data as WorkoutAssignmentWithWorkout[]).map(assignment => ({
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

// Get today's active workout (first active assignment)
export function useTodayWorkout() {
    const { member } = useAuth();
    const { data: workouts, isLoading: queryLoading, error } = useWorkouts();

    // Only show loading if we have a member and the query is actually loading
    const isLoading = !!member?.id && queryLoading;

    return {
        workout: workouts?.[0]?.workout ?? null,
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
