import { memo, useEffect, useState } from 'react';
import { useTheme, useThemeInternal } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { ThemeMode, AccentColor } from '@/contexts/ThemeContext';
import type { MemberPreferences } from '@/types/database';

/**
 * This component syncs theme preferences with the database
 * It must be placed inside both AuthProvider and ThemeProvider
 */
export const ThemeSyncProvider = memo(({ children }: { children: React.ReactNode }) => {
  const { member } = useAuth();
  const { themeMode, accentColor } = useTheme();
  const { setThemeModeState, setAccentColorState, applyTheme } = useThemeInternal();
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false);
  const [lastSyncedValues, setLastSyncedValues] = useState<{mode: ThemeMode, accent: AccentColor} | null>(null);

  // Load preferences from database when member logs in
  useEffect(() => {
    if (!member?.id) {
      setHasLoadedFromDB(false);
      setLastSyncedValues(null);
      return;
    }

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('member_preferences')
          .select('*')
          .eq('member_id', member.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading theme preferences:', error);
          setHasLoadedFromDB(true);
          return;
        }

        if (data) {
          const prefs = data as MemberPreferences;
          const loadedAccent: AccentColor = {
            name: prefs.accent_color_name,
            hue: prefs.accent_color_hue,
            saturation: prefs.accent_color_saturation,
            lightness: prefs.accent_color_lightness,
          };
          const loadedMode = prefs.theme_mode as ThemeMode;
          
          // Update state directly without triggering save
          setThemeModeState(loadedMode);
          setAccentColorState(loadedAccent);
          
          // Update localStorage
          localStorage.setItem('fitness-theme-mode', loadedMode);
          localStorage.setItem('fitness-accent-color', JSON.stringify(loadedAccent));
          
          // Apply theme
          const effectiveTheme = loadedMode === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : loadedMode;
          applyTheme(effectiveTheme, loadedAccent);
          
          // Track what we loaded
          setLastSyncedValues({ mode: loadedMode, accent: loadedAccent });
        }
        
        setHasLoadedFromDB(true);
      } catch (err) {
        console.error('Failed to load preferences:', err);
        setHasLoadedFromDB(true);
      }
    };

    loadPreferences();
  }, [member?.id, setThemeModeState, setAccentColorState, applyTheme]);

  // Sync changes to database when preferences change (after initial load)
  useEffect(() => {
    if (!member?.id || !hasLoadedFromDB) return;
    
    // Skip if values haven't actually changed from what we loaded
    if (lastSyncedValues && 
        lastSyncedValues.mode === themeMode && 
        lastSyncedValues.accent.name === accentColor.name) {
      return;
    }

    // Debounce the save
    const timeoutId = setTimeout(async () => {
      try {
        const prefData = {
          member_id: member.id,
          theme_mode: themeMode,
          accent_color_name: accentColor.name,
          accent_color_hue: accentColor.hue,
          accent_color_saturation: accentColor.saturation,
          accent_color_lightness: accentColor.lightness,
          updated_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('member_preferences')
          .upsert(prefData as any, {
            onConflict: 'member_id'
          });

        if (error) {
          console.error('Error saving theme preferences:', error);
        } else {
          setLastSyncedValues({ mode: themeMode, accent: accentColor });
        }
      } catch (err) {
        console.error('Failed to save preferences:', err);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [member?.id, themeMode, accentColor, hasLoadedFromDB, lastSyncedValues]);

  return <>{children}</>;
});

ThemeSyncProvider.displayName = 'ThemeSyncProvider';
