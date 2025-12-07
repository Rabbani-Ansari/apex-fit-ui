import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MemberMeasurement, ProgressPhoto, MemberMilestone } from '@/types/database';

// Fetch measurement history
export function useMeasurements(limit = 30) {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['measurements', member?.id, limit],
        queryFn: async (): Promise<MemberMeasurement[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('member_measurements')
                .select('*')
                .eq('member_id', member.id)
                .order('date', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching measurements:', error);
                return [];
            }

            return data as MemberMeasurement[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch progress photos
export function useProgressPhotos() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['progress-photos', member?.id],
        queryFn: async (): Promise<ProgressPhoto[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('progress_photos')
                .select('*')
                .eq('member_id', member.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching progress photos:', error);
                return [];
            }

            return data as ProgressPhoto[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Fetch milestones
export function useMilestones() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['milestones', member?.id],
        queryFn: async (): Promise<MemberMilestone[]> => {
            if (!member?.id) return [];

            const { data, error } = await supabase
                .from('member_milestones')
                .select('*')
                .eq('member_id', member.id)
                .order('achieved', { ascending: false })
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching milestones:', error);
                return [];
            }

            return data as MemberMilestone[];
        },
        enabled: !!member?.id,
        staleTime: 1000 * 60 * 5,
    });
}

// Get weight progression for charts
export function useWeightProgress() {
    const { member } = useAuth();
    const { data: measurements, isLoading: queryLoading } = useMeasurements();

    // Only show loading if we have a member and the query is actually loading
    const isLoading = !!member?.id && queryLoading;

    if (isLoading || !measurements) {
        return {
            isLoading,
            chartData: [],
            latestWeight: null,
            weightChange: 0,
        };
    }

    // Reverse for chronological order
    const sorted = [...measurements].reverse();

    const chartData = sorted.map((m) => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m.weight,
    }));

    const latestWeight = measurements[0]?.weight || null;
    const firstWeight = sorted[0]?.weight || null;
    const weightChange = latestWeight && firstWeight
        ? Math.round((firstWeight - latestWeight) * 10) / 10
        : 0;

    return {
        isLoading: false,
        chartData,
        latestWeight,
        weightChange,
    };
}

// Upload progress photo
export function useUploadProgressPhoto() {
    const { member } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, date, notes }: { file: File; date: Date; notes?: string }) => {
            if (!member?.id) throw new Error('No member found');

            // Get authenticated user ID (must match storage RLS policy)
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Not authenticated');

            // 1. Upload to Storage using auth.uid() for folder (matches RLS policy)
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.floor(Date.now() / 1000)}_${file.name.replace(/[^a-zA-Z0-9]/g, '')}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; // Use auth user ID, not member ID

            const { error: uploadError } = await supabase.storage
                .from('progress-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('progress-photos')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('progress_photos')
                .insert({
                    member_id: member.id,
                    photo_url: publicUrl,
                    date: date.toISOString().split('T')[0], // YYYY-MM-DD
                    notes: notes || null,
                } as any);

            if (dbError) throw dbError;

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
        },
    });
}

// Delete progress photo
export function useDeleteProgressPhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (photoId: string) => {
            // First get the photo URL to delete from storage
            const { data: photo, error: fetchError } = await supabase
                .from('progress_photos')
                .select('photo_url')
                .eq('id', photoId)
                .single();

            if (fetchError) throw fetchError;
            if (!photo) throw new Error('Photo not found');

            // Delete from database first
            const { error: dbError } = await supabase
                .from('progress_photos')
                .delete()
                .eq('id', photoId);

            if (dbError) throw dbError;

            // Try to delete from storage (extract path from URL)
            // URL format: .../storage/v1/object/public/progress-photos/member_id/filename
            const photoData = photo as any;
            const pathParts = photoData.photo_url.split('/progress-photos/');
            if (pathParts.length > 1) {
                const storagePath = pathParts[1];
                await supabase.storage
                    .from('progress-photos')
                    .remove([storagePath]);
            }

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['progress-photos'] });
        },
    });
}
