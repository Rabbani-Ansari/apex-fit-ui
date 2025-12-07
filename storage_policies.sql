-- =====================================================
-- PROGRESS PHOTOS FEATURE SETUP
-- Run this script in Supabase SQL Editor to fully set up the backend.
-- =====================================================

-- =====================================================
-- PART 0: FIX MEMBERS TABLE SCHEMA
-- =====================================================

-- 1. Add auth_id column if it doesn't exist (Critical for RLS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'auth_id') THEN
        ALTER TABLE members ADD COLUMN auth_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Backfill auth_id based on email (Link existing members to auth users)
UPDATE members 
SET auth_id = u.id 
FROM auth.users u 
WHERE members.email = u.email 
AND members.auth_id IS NULL;


-- =====================================================
-- PART 1: STORAGE BUCKET
-- =====================================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies

-- Allow authenticated uploads to their own folder
-- Drop existing policy if exists to avoid duplicates (optional, or just ignore error)
DROP POLICY IF EXISTS "Allow members to upload their own progress photos" ON storage.objects;
CREATE POLICY "Allow members to upload their own progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'progress-photos');

-- Allow members to update/delete their own files
DROP POLICY IF EXISTS "Allow members to update/delete their own progress photos" ON storage.objects;
CREATE POLICY "Allow members to update/delete their own progress photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow members to delete their own progress photos" ON storage.objects;
CREATE POLICY "Allow members to delete their own progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- PART 2: DATABASE TABLE
-- =====================================================

-- 1. Create Table (if not exists)
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- 3. Table Policies

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Members read own photos" ON progress_photos;
DROP POLICY IF EXISTS "Members insert own photos" ON progress_photos;
DROP POLICY IF EXISTS "Members delete own photos" ON progress_photos;

-- Read Policy
CREATE POLICY "Members read own photos" ON progress_photos
  FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Insert Policy (Crucial for Upload)
CREATE POLICY "Members insert own photos" ON progress_photos
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

-- Delete Policy
CREATE POLICY "Members delete own photos" ON progress_photos
  FOR DELETE USING (
    member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
  );

