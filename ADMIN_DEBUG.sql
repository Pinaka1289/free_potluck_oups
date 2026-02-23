-- ============================================
-- ADMIN STATUS DEBUG QUERIES
-- ============================================
-- Run these in Supabase SQL Editor to diagnose admin issues
-- ============================================

-- 1. Check if profile exists and get admin status
SELECT 
  id,
  email,
  full_name,
  is_admin,
  created_at
FROM potluckpartys_profiles
WHERE email = 'cspkumargowd@gamil.com';

-- 2. Check all profiles with similar email (in case of typo)
SELECT 
  id,
  email,
  full_name,
  is_admin,
  created_at
FROM potluckpartys_profiles
WHERE email ILIKE '%cspkumargowd%';

-- 3. Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'cspkumargowd@gamil.com';

-- 4. Update admin status (if profile exists) - Case insensitive
UPDATE potluckpartys_profiles
SET is_admin = TRUE
WHERE LOWER(email) = LOWER('cspkumargowd@gamil.com')
RETURNING id, email, is_admin;

-- 4b. Alternative: Update by user ID (more reliable)
-- First get the user ID from query #3, then:
-- UPDATE potluckpartys_profiles
-- SET is_admin = TRUE
-- WHERE id = 'USER_ID_FROM_QUERY_3';

-- 5. Verify the update worked
SELECT 
  id,
  email,
  is_admin,
  updated_at
FROM potluckpartys_profiles
WHERE email = 'cspkumargowd@gamil.com';

-- 6. If profile doesn't exist, create it manually (replace USER_ID with actual user ID from auth.users)
-- First, get the user ID:
-- SELECT id FROM auth.users WHERE email = 'cspkumargowd@gamil.com';
-- Then use that ID:
-- INSERT INTO potluckpartys_profiles (id, email, full_name, is_admin)
-- VALUES ('USER_ID_FROM_ABOVE', 'cspkumargowd@gamil.com', 'Your Name', TRUE)
-- ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;

-- ============================================
-- TROUBLESHOOTING STEPS:
-- ============================================
-- 1. Run query #1 to check if profile exists and is_admin status
-- 2. If is_admin is FALSE or NULL, run query #4 to update it
-- 3. If profile doesn't exist, check query #3 to get user ID, then create profile
-- 4. After updating, SIGN OUT and SIGN BACK IN to refresh session
-- 5. Clear browser cache if still not working
-- ============================================
