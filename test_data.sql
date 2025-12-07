-- =====================================================
-- TEST DATA FOR APEX FIT MEMBER APP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Member ID from your app
-- Jane Smith: 650e8400-e29b-41d4-a716-446655440002

-- =====================================================
-- 1. CREATE WORKOUTS
-- =====================================================

-- Workout 1: Push Day (chest)
INSERT INTO workouts (id, name, body_part, difficulty, equipment, duration, usage_count)
VALUES 
  ('a0000001-0001-0001-0001-000000000001', 'Push Day - Chest & Shoulders', 'chest', 'intermediate', 'dumbbells, barbell, bench', 45, 0)
ON CONFLICT (id) DO NOTHING;

-- Workout 2: Pull Day (back)
INSERT INTO workouts (id, name, body_part, difficulty, equipment, duration, usage_count)
VALUES 
  ('a0000002-0002-0002-0002-000000000002', 'Pull Day - Back & Biceps', 'back', 'intermediate', 'cable machine, dumbbells', 50, 0)
ON CONFLICT (id) DO NOTHING;

-- Workout 3: Leg Day (legs)
INSERT INTO workouts (id, name, body_part, difficulty, equipment, duration, usage_count)
VALUES 
  ('a0000003-0003-0003-0003-000000000003', 'Leg Day - Quads & Glutes', 'legs', 'advanced', 'squat rack, leg press', 55, 0)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE WORKOUT EXERCISES
-- =====================================================

-- Push Day Exercises
INSERT INTO workout_exercises (workout_id, name, sets, reps, rest, order_index, notes)
VALUES 
  ('a0000001-0001-0001-0001-000000000001', 'Bench Press', 4, '8-10', '90 sec', 1, 'Keep elbows at 45 degrees'),
  ('a0000001-0001-0001-0001-000000000001', 'Incline Dumbbell Press', 3, '10-12', '60 sec', 2, 'Control the negative'),
  ('a0000001-0001-0001-0001-000000000001', 'Shoulder Press', 4, '8-10', '90 sec', 3, 'Full range of motion'),
  ('a0000001-0001-0001-0001-000000000001', 'Lateral Raises', 3, '12-15', '45 sec', 4, 'Light weight, strict form'),
  ('a0000001-0001-0001-0001-000000000001', 'Tricep Pushdowns', 3, '12-15', '45 sec', 5, 'Squeeze at the bottom')
ON CONFLICT DO NOTHING;

-- Pull Day Exercises
INSERT INTO workout_exercises (workout_id, name, sets, reps, rest, order_index, notes)
VALUES 
  ('a0000002-0002-0002-0002-000000000002', 'Deadlift', 4, '6-8', '120 sec', 1, 'Keep back straight'),
  ('a0000002-0002-0002-0002-000000000002', 'Barbell Rows', 4, '8-10', '90 sec', 2, 'Pull to lower chest'),
  ('a0000002-0002-0002-0002-000000000002', 'Lat Pulldowns', 3, '10-12', '60 sec', 3, 'Wide grip'),
  ('a0000002-0002-0002-0002-000000000002', 'Face Pulls', 3, '15-20', '45 sec', 4, 'Great for shoulder health'),
  ('a0000002-0002-0002-0002-000000000002', 'Bicep Curls', 3, '12-15', '45 sec', 5, 'Alternate arms')
ON CONFLICT DO NOTHING;

-- Leg Day Exercises
INSERT INTO workout_exercises (workout_id, name, sets, reps, rest, order_index, notes)
VALUES 
  ('a0000003-0003-0003-0003-000000000003', 'Squats', 4, '8-10', '120 sec', 1, 'Break parallel'),
  ('a0000003-0003-0003-0003-000000000003', 'Romanian Deadlifts', 4, '10-12', '90 sec', 2, 'Feel the hamstring stretch'),
  ('a0000003-0003-0003-0003-000000000003', 'Leg Press', 3, '12-15', '60 sec', 3, 'Full range of motion'),
  ('a0000003-0003-0003-0003-000000000003', 'Walking Lunges', 3, '12 each', '60 sec', 4, 'Keep torso upright'),
  ('a0000003-0003-0003-0003-000000000003', 'Calf Raises', 4, '15-20', '45 sec', 5, 'Pause at the top')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. ASSIGN WORKOUT TO MEMBER
-- =====================================================

INSERT INTO workout_assignments (
  workout_id, 
  member_id, 
  status, 
  start_date, 
  end_date, 
  active_days, 
  notify
)
VALUES 
  (
    'a0000001-0001-0001-0001-000000000001',
    '650e8400-e29b-41d4-a716-446655440002',
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    ARRAY['monday', 'thursday'],
    true
  )
ON CONFLICT (workout_id, member_id) DO UPDATE 
SET status = 'active', start_date = CURRENT_DATE;

-- =====================================================
-- 4. CREATE DIET PLAN
-- =====================================================

INSERT INTO diet_plans (id, name, target_calories, protein_target, carbs_target, fat_target, water_target, supplements, special_instructions)
VALUES 
  (
    'b0000001-0001-0001-0001-000000000001',
    'Muscle Building Plan',
    2500,
    180,
    280,
    70,
    10,
    ARRAY['Whey Protein', 'Creatine', 'Multivitamin'],
    'Eat protein within 30 min of workout. Stay hydrated!'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CREATE DIET MEALS
-- =====================================================

INSERT INTO diet_meals (diet_plan_id, meal_time, time_label, order_index, items)
VALUES 
  (
    'b0000001-0001-0001-0001-000000000001',
    'Breakfast',
    '7:00 - 8:00 AM',
    1,
    '[
      {"name": "Oatmeal with Banana", "calories": 350, "protein": 12, "carbs": 60, "fat": 8},
      {"name": "Scrambled Eggs (3)", "calories": 220, "protein": 18, "carbs": 2, "fat": 15},
      {"name": "Orange Juice", "calories": 110, "protein": 2, "carbs": 26, "fat": 0}
    ]'::jsonb
  ),
  (
    'b0000001-0001-0001-0001-000000000001',
    'Snacks',
    '10:30 AM',
    2,
    '[
      {"name": "Greek Yogurt", "calories": 150, "protein": 15, "carbs": 10, "fat": 5},
      {"name": "Almonds (handful)", "calories": 160, "protein": 6, "carbs": 6, "fat": 14}
    ]'::jsonb
  ),
  (
    'b0000001-0001-0001-0001-000000000001',
    'Lunch',
    '12:30 - 1:30 PM',
    3,
    '[
      {"name": "Grilled Chicken Breast", "calories": 280, "protein": 50, "carbs": 0, "fat": 8},
      {"name": "Brown Rice (1 cup)", "calories": 220, "protein": 5, "carbs": 45, "fat": 2},
      {"name": "Mixed Vegetables", "calories": 80, "protein": 4, "carbs": 15, "fat": 1}
    ]'::jsonb
  ),
  (
    'b0000001-0001-0001-0001-000000000001',
    'Snacks',
    '4:00 PM',
    4,
    '[
      {"name": "Protein Shake", "calories": 200, "protein": 25, "carbs": 10, "fat": 5},
      {"name": "Apple", "calories": 95, "protein": 0, "carbs": 25, "fat": 0}
    ]'::jsonb
  ),
  (
    'b0000001-0001-0001-0001-000000000001',
    'Dinner',
    '7:30 - 8:30 PM',
    5,
    '[
      {"name": "Salmon Fillet", "calories": 350, "protein": 40, "carbs": 0, "fat": 20},
      {"name": "Sweet Potato", "calories": 180, "protein": 4, "carbs": 40, "fat": 0},
      {"name": "Steamed Broccoli", "calories": 55, "protein": 4, "carbs": 10, "fat": 0}
    ]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. ASSIGN DIET PLAN TO MEMBER
-- =====================================================

INSERT INTO diet_assignments (
  diet_plan_id,
  member_id,
  start_date,
  end_date,
  status
)
VALUES 
  (
    'b0000001-0001-0001-0001-000000000001',
    '650e8400-e29b-41d4-a716-446655440002',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'active'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. ADD SOME NOTIFICATIONS (for testing)
-- =====================================================

INSERT INTO member_notifications (member_id, type, title, message, icon, action_url, is_read)
VALUES 
  ('650e8400-e29b-41d4-a716-446655440002', 'workout', 'New Workout Assigned!', 'Your trainer has assigned Push Day workout. Let''s crush it! 💪', '💪', '/workout', false),
  ('650e8400-e29b-41d4-a716-446655440002', 'diet', 'Diet Plan Updated', 'Your muscle building diet plan is ready. 2500 calories per day.', '🥗', '/diet', false),
  ('650e8400-e29b-41d4-a716-446655440002', 'achievement', '7-Day Streak!', 'Amazing! You''ve worked out for 7 days straight. Keep going!', '🏆', '/progress', true),
  ('650e8400-e29b-41d4-a716-446655440002', 'membership', 'Membership Active', 'Welcome to Apex Fitness! Your membership is now active.', '💳', '/profile', true),
  ('650e8400-e29b-41d4-a716-446655440002', 'announcement', 'Holiday Hours', 'Gym will be closed on Dec 25th. Happy holidays! 🎄', '📢', null, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! Refresh your app to see the data
-- =====================================================
SELECT 'Test data inserted successfully!' as result;
