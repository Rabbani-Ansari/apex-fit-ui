import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { Member } from '@/types/database';

const supabaseUrl = 'https://wylqgcpsuhnxcllkwjdx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5bHFnY3BzdWhueGNsbGt3amR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDYyMjcsImV4cCI6MjA4MDQyMjIyN30.oCODho9R5gv933vnxkToP8VszZBlW8p-QUVmVRpux64';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Expose for debugging - allows window.supabase.auth.signOut() in console
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

// Helper to validate member exists by email (for login/signup validation)
export async function validateMemberEmail(email: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !data) {
    return null;
  }

  return data as Member;
}

// Helper to get member by email (alias for validateMemberEmail)
export async function getMemberByEmail(email: string): Promise<Member | null> {
  return validateMemberEmail(email);
}

