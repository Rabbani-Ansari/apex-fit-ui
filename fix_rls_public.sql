-- =====================================================
-- MAKE ALL TABLES PUBLICLY READABLE
-- Run this in Supabase SQL Editor to remove RLS restrictions
-- =====================================================

-- OPTION A: DISABLE RLS completely (fastest but less secure)
-- Uncomment these lines to disable RLS entirely:

-- ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_exercises DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_assignments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE diet_plans DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE diet_meals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE diet_assignments DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTION B: CREATE PUBLIC READ POLICIES (recommended)
-- This keeps RLS enabled but allows anyone to read
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read workouts" ON workouts;
DROP POLICY IF EXISTS "Public read workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Members read own workout assignments" ON workout_assignments;
DROP POLICY IF EXISTS "Public read diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Public read diet meals" ON diet_meals;
DROP POLICY IF EXISTS "Members read own diet assignments" ON diet_assignments;
DROP POLICY IF EXISTS "Members read own profile" ON members;
DROP POLICY IF EXISTS "Members read own notifications" ON member_notifications;

-- Create new public read policies for ALL tables
CREATE POLICY "Allow all reads on workouts" ON workouts
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on workout_exercises" ON workout_exercises
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on workout_assignments" ON workout_assignments
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on diet_plans" ON diet_plans
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on diet_meals" ON diet_meals
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on diet_assignments" ON diet_assignments
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on members" ON members
  FOR SELECT USING (true);

CREATE POLICY "Allow all reads on notifications" ON member_notifications
  FOR SELECT USING (true);

-- Also allow updates for members on their own notifications
DROP POLICY IF EXISTS "Members update own notifications" ON member_notifications;
CREATE POLICY "Allow all updates on notifications" ON member_notifications
  FOR UPDATE USING (true);

-- =====================================================
-- VERIFY: Check that policies were created
-- =====================================================

SELECT 
  tablename,
  policyname,
  cmd,
  qual
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
ORDER BY tablename;

-- Done! Now refresh your app and data should appear.
SELECT 'RLS policies updated successfully!' as result;
