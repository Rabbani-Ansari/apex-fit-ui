import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getMemberByEmail } from '@/lib/supabase';
import type { Member } from '@/types/database';

interface AuthContextType {
    user: User | null;
    member: Member | null;
    session: Session | null;
    isLoading: boolean;
    isLoggedOut: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store member email for session restoration
const MEMBER_EMAIL_KEY = 'member_email';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [member, setMember] = useState<Member | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedOut, setIsLoggedOut] = useState(false);

    // Fetch member profile by email
    const fetchMemberProfile = async (email: string): Promise<Member | null> => {
        const memberData = await getMemberByEmail(email);
        return memberData;
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            // No session = not logged in, finish loading
            if (!session?.user?.email) {
                setIsLoading(false);
                return;
            }

            // Try to get member profile using the authenticated user's email
            const memberData = await fetchMemberProfile(session.user.email);
            setMember(memberData);

            // Store email for future lookups
            if (memberData) {
                localStorage.setItem(MEMBER_EMAIL_KEY, session.user.email);
            }

            setIsLoading(false);
        }).catch(() => {
            // Error getting session = finish loading and redirect to login
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user?.email) {
                    const memberData = await fetchMemberProfile(session.user.email);
                    setMember(memberData);

                    if (memberData) {
                        localStorage.setItem(MEMBER_EMAIL_KEY, session.user.email);
                    }
                } else {
                    setMember(null);
                    localStorage.removeItem(MEMBER_EMAIL_KEY);
                }

                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);

        // First, validate that this email exists in members table
        const memberExists = await getMemberByEmail(email);

        if (!memberExists) {
            setIsLoading(false);
            return { error: 'No gym membership found for this email. Please contact your gym.' };
        }

        // Proceed with Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setIsLoading(false);
            return { error: error.message };
        }

        // Set member data
        if (data.user) {
            setMember(memberExists);
            localStorage.setItem(MEMBER_EMAIL_KEY, email);
        }

        setIsLoading(false);
        return { error: null };
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);

        // First, validate that this email exists in members table
        const memberExists = await getMemberByEmail(email);

        if (!memberExists) {
            setIsLoading(false);
            return { error: 'No gym membership found for this email. Please contact your gym to register.' };
        }

        // Create auth account
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setIsLoading(false);
            return { error: error.message };
        }

        // Store email for later use (member will be set after email confirmation)
        if (data.user) {
            localStorage.setItem(MEMBER_EMAIL_KEY, email);
        }

        setIsLoading(false);
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setMember(null);
        setSession(null);
        setIsLoggedOut(true);
        localStorage.removeItem(MEMBER_EMAIL_KEY);
    };

    return (
        <AuthContext.Provider value={{
            user,
            member,
            session,
            isLoading,
            isLoggedOut,
            signIn,
            signUp,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

