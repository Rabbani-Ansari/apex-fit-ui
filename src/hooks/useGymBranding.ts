import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { GymBranding } from '@/types/database';

export function useGymBranding() {
    const { member } = useAuth();

    return useQuery({
        queryKey: ['gym-branding', member?.gym_id],
        queryFn: async (): Promise<GymBranding | null> => {
            // If member has a gym_id, fetch that specific gym
            if (member?.gym_id) {
                const { data, error } = await supabase
                    .from('gym_branding')
                    .select('*')
                    .eq('id', member.gym_id)
                    .single();

                if (error) {
                    console.error('Error fetching gym branding:', error);
                    return null;
                }

                console.log('🔍 [useGymBranding] Gym data for member:', data);
                return data as GymBranding;
            }

            // Fallback: fetch any gym (for backwards compatibility)
            const { data, error } = await supabase
                .from('gym_branding')
                .select('*')
                .limit(1)
                .single();

            if (error) {
                console.error('Error fetching gym branding:', error);
                return null;
            }

            return data as GymBranding;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes - branding rarely changes
    });
}

// Get theme colors from branding
export function useGymTheme() {
    const { data: branding, isLoading } = useGymBranding();

    return {
        isLoading,
        gymName: branding?.gym_name || 'FitnessPro',
        logoUrl: branding?.logo_url || null,
        primaryColor: branding?.primary_color || '#f97316',
        secondaryColor: branding?.secondary_color || '#1e40af',
        address: branding?.address || null,
        contactNumber: branding?.contact_number || null,
        websiteUrl: branding?.website_url || null,
    };
}
