-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor
-- ทำครั้งเดียวพอ ไม่ต้องรันซ้ำ

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS address_house TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_district TEXT,
  ADD COLUMN IF NOT EXISTS birth_place_house TEXT,
  ADD COLUMN IF NOT EXISTS birth_place_city TEXT,
  ADD COLUMN IF NOT EXISTS birth_place_district TEXT,
  ADD COLUMN IF NOT EXISTS father_first_name TEXT,
  ADD COLUMN IF NOT EXISTS father_last_name TEXT,
  ADD COLUMN IF NOT EXISTS father_age INTEGER,
  ADD COLUMN IF NOT EXISTS father_place_birth_house TEXT,
  ADD COLUMN IF NOT EXISTS father_place_birth_city TEXT,
  ADD COLUMN IF NOT EXISTS father_place_birth_district TEXT,
  ADD COLUMN IF NOT EXISTS father_current_address_house TEXT,
  ADD COLUMN IF NOT EXISTS father_current_address_city TEXT,
  ADD COLUMN IF NOT EXISTS father_current_address_district TEXT,
  ADD COLUMN IF NOT EXISTS mother_first_name TEXT,
  ADD COLUMN IF NOT EXISTS mother_last_name TEXT,
  ADD COLUMN IF NOT EXISTS mother_age INTEGER,
  ADD COLUMN IF NOT EXISTS mother_place_birth_house TEXT,
  ADD COLUMN IF NOT EXISTS mother_place_birth_city TEXT,
  ADD COLUMN IF NOT EXISTS mother_place_birth_district TEXT,
  ADD COLUMN IF NOT EXISTS mother_current_address_house TEXT,
  ADD COLUMN IF NOT EXISTS mother_current_address_city TEXT,
  ADD COLUMN IF NOT EXISTS mother_current_address_district TEXT,
  ADD COLUMN IF NOT EXISTS class_n_entry_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS class_n_location_house TEXT,
  ADD COLUMN IF NOT EXISTS class_n_location_city TEXT,
  ADD COLUMN IF NOT EXISTS class_n_location_district TEXT,
  ADD COLUMN IF NOT EXISTS class_n_issuer_name TEXT,
  ADD COLUMN IF NOT EXISTS class_n_id_card TEXT,
  ADD COLUMN IF NOT EXISTS class_n_total_work_age INTEGER,
  ADD COLUMN IF NOT EXISTS class_m_entry_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS class_m_location_house TEXT,
  ADD COLUMN IF NOT EXISTS class_m_location_city TEXT,
  ADD COLUMN IF NOT EXISTS class_m_location_district TEXT,
  ADD COLUMN IF NOT EXISTS class_m_issuer_name TEXT,
  ADD COLUMN IF NOT EXISTS class_m_id_card TEXT,
  ADD COLUMN IF NOT EXISTS class_m_total_work_age INTEGER;

-- RLS: อนุญาตให้ user update profile ตัวเอง
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS: อนุญาตให้ admin/super_admin update profile ทุกคน
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
