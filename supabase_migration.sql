-- =====================================================
-- GYM MEMBER APP - SUPABASE MIGRATION
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- STEP 1: Create ENUM Types
-- =====================================================

DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('active', 'expired', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('membership', 'pt', 'product');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_step_status AS ENUM ('pending', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE meal_time AS ENUM ('Breakfast', 'Lunch', 'Dinner', 'Snacks');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE body_part AS ENUM ('chest', 'back', 'legs', 'arms', 'shoulders', 'core', 'full-body');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- STEP 2: Create Tables
-- =====================================================

-- GYM BRANDING
CREATE TABLE IF NOT EXISTS gym_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  gym_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#f97316',
  secondary_color TEXT DEFAULT '#1e40af',
  address TEXT,
  contact_number TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRAINERS
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gym_branding(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo TEXT,
  specialization TEXT,
  phone TEXT,
  experience TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id),
  gym_id UUID REFERENCES gym_branding(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  emergency_contact TEXT,
  photo TEXT,
  plan TEXT,
  status member_status DEFAULT 'trial',
  start_date DATE,
  expiry_date DATE,
  payment_due NUMERIC DEFAULT 0,
  height NUMERIC,
  weight NUMERIC,
  target_weight NUMERIC,
  bmi NUMERIC,
  body_fat NUMERIC,
  age INTEGER,
  streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MEMBER PAYMENTS
CREATE TABLE IF NOT EXISTS member_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type payment_type NOT NULL,
  status payment_status DEFAULT 'pending',
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WORKOUTS
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gym_branding(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id),
  name TEXT NOT NULL,
  description TEXT,
  difficulty difficulty_level DEFAULT 'beginner',
  duration INTEGER,
  calories INTEGER,
  body_part body_part,
  muscle_groups TEXT[],
  thumbnail TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WORKOUT EXERCISES
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC DEFAULT 0,
  rest_time INTEGER DEFAULT 60,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  animation_url TEXT,
  animation_type TEXT, -- for Lottie animation key
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WORKOUT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS workout_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  status assignment_status DEFAULT 'active',
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- DIET PLANS
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gym_branding(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_calories INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  water_target NUMERIC DEFAULT 8,
  supplements TEXT[],
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DIET MEALS
CREATE TABLE IF NOT EXISTS diet_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
  meal_time meal_time NOT NULL,
  time_label TEXT, -- "8:00 AM"
  items JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER DEFAULT 0
);

-- DIET ASSIGNMENTS
CREATE TABLE IF NOT EXISTS diet_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
  status assignment_status DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  assigned_at TIMESTAMPTZ DEFAULT now()
);

-- MEMBER ATTENDANCE
CREATE TABLE IF NOT EXISTS member_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  check_in_time TIME,
  check_out_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, date)
);

-- MEMBER MEASUREMENTS
CREATE TABLE IF NOT EXISTS member_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  weight NUMERIC,
  height NUMERIC,
  body_fat NUMERIC,
  bmi NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MEMBER TASK STEPS (Punishments/Challenges)
CREATE TABLE IF NOT EXISTS member_task_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  step_count INTEGER NOT NULL,
  status task_step_status DEFAULT 'pending',
  notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- WORKOUT LOGS (Track completed sets per session)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id),
  exercise_id UUID REFERENCES workout_exercises(id),
  set_number INTEGER,
  reps INTEGER,
  weight NUMERIC,
  rpe INTEGER,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- PROGRESS PHOTOS
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MILESTONES
CREATE TABLE IF NOT EXISTS member_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  achieved BOOLEAN DEFAULT false,
  achieved_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: Enable Row Level Security
-- =====================================================

ALTER TABLE gym_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_milestones ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create RLS Policies
-- =====================================================

-- Allow public read for gym branding
CREATE POLICY "Public read gym branding" ON gym_branding
  FOR SELECT USING (true);

-- Allow public read for trainers
CREATE POLICY "Public read trainers" ON trainers
  FOR SELECT USING (true);

-- Members can read their own profile
CREATE POLICY "Members read own profile" ON members
  FOR SELECT USING (auth.uid() = auth_id);

-- Members can update their own profile
CREATE POLICY "Members update own profile" ON members
  FOR UPDATE USING (auth.uid() = auth_id);

-- Members can read their own payments
CREATE POLICY "Members read own payments" ON member_payments
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Allow public read for workouts (they are gym-wide)
CREATE POLICY "Public read workouts" ON workouts
  FOR SELECT USING (true);

-- Allow public read for workout exercises
CREATE POLICY "Public read workout exercises" ON workout_exercises
  FOR SELECT USING (true);

-- Members read their own workout assignments
CREATE POLICY "Members read own workout assignments" ON workout_assignments
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Allow public read for diet plans
CREATE POLICY "Public read diet plans" ON diet_plans
  FOR SELECT USING (true);

-- Allow public read for diet meals
CREATE POLICY "Public read diet meals" ON diet_meals
  FOR SELECT USING (true);

-- Members read their own diet assignments
CREATE POLICY "Members read own diet assignments" ON diet_assignments
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members read own attendance
CREATE POLICY "Members read own attendance" ON member_attendance
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members can check-in (insert attendance)
CREATE POLICY "Members insert own attendance" ON member_attendance
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members can update attendance (check-out)
CREATE POLICY "Members update own attendance" ON member_attendance
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members read own measurements
CREATE POLICY "Members read own measurements" ON member_measurements
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members read own tasks
CREATE POLICY "Members read own tasks" ON member_task_steps
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members can update own tasks (mark complete)
CREATE POLICY "Members update own tasks" ON member_task_steps
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members can insert workout logs
CREATE POLICY "Members insert workout logs" ON workout_logs
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members read own workout logs
CREATE POLICY "Members read own workout logs" ON workout_logs
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members read own progress photos
DROP POLICY IF EXISTS "Members read own photos" ON progress_photos;
CREATE POLICY "Members read own photos" ON progress_photos
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Members read own milestones
CREATE POLICY "Members read own milestones" ON member_milestones
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- STEP 5: Create Helper Functions
-- =====================================================

-- Function to get member by email (for login validation)
CREATE OR REPLACE FUNCTION get_member_by_email(p_email TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  status member_status,
  gym_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name, m.email, m.status, m.gym_id
  FROM members m
  WHERE m.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link auth user to member after signup
CREATE OR REPLACE FUNCTION link_auth_to_member(p_email TEXT, p_auth_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_member_id UUID;
BEGIN
  SELECT id INTO v_member_id FROM members WHERE email = p_email;
  
  IF v_member_id IS NOT NULL THEN
    UPDATE members SET auth_id = p_auth_id WHERE id = v_member_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_auth_id ON members(auth_id);
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_workout_assignments_member ON workout_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_diet_assignments_member ON diet_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_member_attendance_member_date ON member_attendance(member_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_member ON workout_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_member_measurements_member ON member_measurements(member_id);

-- MEMBER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS member_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'workout', 'diet', 'membership', 'achievement', 'announcement'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '🔔',
  action_url TEXT, -- Optional deep link (e.g., '/workout', '/diet')
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE member_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read own notifications" ON member_notifications;
CREATE POLICY "Members read own notifications" ON member_notifications
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members update own notifications" ON member_notifications;
CREATE POLICY "Members update own notifications" ON member_notifications
  FOR UPDATE USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_member_notifications_member ON member_notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_member_notifications_unread ON member_notifications(member_id, is_read) WHERE is_read = false;

-- =====================================================
-- MIGRATION COMPLETE!
-- Next: Add test data or connect your app
-- =====================================================
