-- =====================================================
-- CHECK AND FIX RLS POLICIES
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- STEP 1: Check current RLS policies on all relevant tables
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'workouts', 
    'workout_exercises', 
    'workout_assignments',
    'diet_plans',
    'diet_meals',
    'diet_assignments',
    'members',
    'member_notifications'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 2: Check if RLS is enabled on tables
-- =====================================================

SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class
WHERE relname IN (
    'workouts', 
    'workout_exercises', 
    'workout_assignments',
    'diet_plans',
    'diet_meals',
    'diet_assignments',
    'members',
    'member_notifications'
  )
ORDER BY relname;

-- =====================================================
-- STEP 3: Check row counts in tables (bypasses RLS as superuser)
-- =====================================================

SELECT 'workouts' as table_name, COUNT(*) as row_count FROM workouts
UNION ALL
SELECT 'workout_exercises', COUNT(*) FROM workout_exercises
UNION ALL
SELECT 'workout_assignments', COUNT(*) FROM workout_assignments
UNION ALL
SELECT 'diet_plans', COUNT(*) FROM diet_plans
UNION ALL
SELECT 'diet_meals', COUNT(*) FROM diet_meals
UNION ALL
SELECT 'diet_assignments', COUNT(*) FROM diet_assignments
UNION ALL
SELECT 'members', COUNT(*) FROM members
ORDER BY table_name;
