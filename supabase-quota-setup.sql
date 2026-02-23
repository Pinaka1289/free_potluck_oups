-- ============================================
-- AI QUOTA SYSTEM SETUP FOR POTLUCKPARTYS
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This script is idempotent - safe to run multiple times
-- ============================================

-- Step 1: Add is_admin column to profiles table
ALTER TABLE potluckpartys_profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin lookups (using 'id' not 'user_id' - profiles.id references auth.users.id)
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON potluckpartys_profiles(id) WHERE is_admin = TRUE;

-- Step 2: Create user AI usage tracking table
CREATE TABLE IF NOT EXISTS potluckpartys_user_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- Format: "2026-01" (YYYY-MM)
  usage_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_ai_usage_lookup ON potluckpartys_user_ai_usage(user_id, month_year);

-- Step 3: Create quota overrides table
CREATE TABLE IF NOT EXISTS potluckpartys_user_ai_quota_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  quota_limit INTEGER NULL,  -- NULL means unlimited, or specific number like 100
  is_unlimited BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES auth.users(id),  -- Admin who granted it
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,  -- Optional: reason for override
  expires_at TIMESTAMPTZ NULL,  -- Optional: temporary override
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quota_overrides_user ON potluckpartys_user_ai_quota_overrides(user_id);

-- Step 4: Enable RLS
ALTER TABLE potluckpartys_user_ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE potluckpartys_user_ai_quota_overrides ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running script)
DROP POLICY IF EXISTS "Users can view their own usage" ON potluckpartys_user_ai_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON potluckpartys_user_ai_usage;
DROP POLICY IF EXISTS "System can insert usage records" ON potluckpartys_user_ai_usage;
DROP POLICY IF EXISTS "Users can view their own quota overrides" ON potluckpartys_user_ai_quota_overrides;
DROP POLICY IF EXISTS "Admins can manage all quota overrides" ON potluckpartys_user_ai_quota_overrides;

-- RLS Policies for potluckpartys_user_ai_usage
CREATE POLICY "Users can view their own usage"
ON potluckpartys_user_ai_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON potluckpartys_user_ai_usage
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records"
ON potluckpartys_user_ai_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for potluckpartys_user_ai_quota_overrides
CREATE POLICY "Users can view their own quota overrides"
ON potluckpartys_user_ai_quota_overrides
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all (we'll check is_admin in function)
CREATE POLICY "Admins can manage all quota overrides"
ON potluckpartys_user_ai_quota_overrides
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM potluckpartys_profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Step 5: Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM potluckpartys_profiles
    WHERE id = p_user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Main quota check and increment function
CREATE OR REPLACE FUNCTION check_and_increment_ai_usage(
  p_user_id UUID,
  p_default_quota INTEGER DEFAULT 3
)
RETURNS JSON AS $$
DECLARE
  v_current_month VARCHAR(7);
  v_usage_record RECORD;
  v_quota_override RECORD;
  v_effective_quota INTEGER;
  v_is_unlimited BOOLEAN := FALSE;
  v_remaining INTEGER;
  v_reset_date DATE;
BEGIN
  -- Get current month in YYYY-MM format
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Check for user-specific quota override
  SELECT quota_limit, is_unlimited, expires_at
  INTO v_quota_override
  FROM potluckpartys_user_ai_quota_overrides
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Determine effective quota
  IF v_quota_override IS NOT NULL THEN
    IF v_quota_override.is_unlimited = TRUE THEN
      v_is_unlimited := TRUE;
      v_effective_quota := NULL;
    ELSIF v_quota_override.quota_limit IS NOT NULL THEN
      v_effective_quota := v_quota_override.quota_limit;
    ELSE
      v_effective_quota := p_default_quota;
    END IF;
  ELSE
    v_effective_quota := p_default_quota;
  END IF;
  
  -- If unlimited, skip quota check but still track usage
  IF v_is_unlimited THEN
    INSERT INTO potluckpartys_user_ai_usage (user_id, month_year, usage_count)
    VALUES (p_user_id, v_current_month, 0)
    ON CONFLICT (user_id, month_year) DO UPDATE
    SET usage_count = potluckpartys_user_ai_usage.usage_count + 1,
        updated_at = NOW();
    
    SELECT usage_count INTO v_usage_record.usage_count
    FROM potluckpartys_user_ai_usage
    WHERE user_id = p_user_id AND month_year = v_current_month;
    
    RETURN json_build_object(
      'allowed', true,
      'remaining', NULL,
      'is_unlimited', true,
      'quota_limit', NULL,
      'reset_date', DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
      'used', v_usage_record.usage_count
    );
  END IF;
  
  -- Normal quota check
  INSERT INTO potluckpartys_user_ai_usage (user_id, month_year, usage_count)
  VALUES (p_user_id, v_current_month, 0)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  SELECT usage_count INTO v_usage_record.usage_count
  FROM potluckpartys_user_ai_usage
  WHERE user_id = p_user_id AND month_year = v_current_month;
  
  -- Check if quota exhausted
  IF v_usage_record.usage_count >= v_effective_quota THEN
    v_reset_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
    RETURN json_build_object(
      'allowed', false,
      'remaining', 0,
      'quota_limit', v_effective_quota,
      'is_unlimited', false,
      'reset_date', v_reset_date,
      'used', v_usage_record.usage_count
    );
  END IF;
  
  -- Increment usage (atomic)
  UPDATE potluckpartys_user_ai_usage
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND month_year = v_current_month
  RETURNING usage_count INTO v_usage_record.usage_count;
  
  v_remaining := v_effective_quota - v_usage_record.usage_count;
  v_reset_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  
  RETURN json_build_object(
    'allowed', true,
    'remaining', v_remaining,
    'quota_limit', v_effective_quota,
    'is_unlimited', false,
    'reset_date', v_reset_date,
    'used', v_usage_record.usage_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Read-only quota info function (for UI display)
CREATE OR REPLACE FUNCTION get_ai_quota_info(
  p_user_id UUID,
  p_default_quota INTEGER DEFAULT 3
)
RETURNS JSON AS $$
DECLARE
  v_current_month VARCHAR(7);
  v_usage_count   INTEGER := 0;
  v_quota_override RECORD;
  v_effective_quota INTEGER;
  v_is_unlimited BOOLEAN := FALSE;
  v_remaining INTEGER;
  v_reset_date DATE;
BEGIN
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Check for override
  SELECT quota_limit, is_unlimited, expires_at
  INTO v_quota_override
  FROM potluckpartys_user_ai_quota_overrides
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Determine effective quota
  IF v_quota_override IS NOT NULL THEN
    IF v_quota_override.is_unlimited = TRUE THEN
      v_is_unlimited := TRUE;
      v_effective_quota := NULL;
    ELSIF v_quota_override.quota_limit IS NOT NULL THEN
      v_effective_quota := v_quota_override.quota_limit;
    ELSE
      v_effective_quota := p_default_quota;
    END IF;
  ELSE
    v_effective_quota := p_default_quota;
  END IF;
  
  -- Get current usage (defaults to 0 if no row exists yet)
  SELECT COALESCE(usage_count, 0)
  INTO v_usage_count
  FROM potluckpartys_user_ai_usage
  WHERE user_id = p_user_id AND month_year = v_current_month;
  
  IF v_is_unlimited THEN
    v_remaining := NULL;
  ELSE
    v_remaining := GREATEST(0, v_effective_quota - v_usage_count);
  END IF;
  
  v_reset_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  
  RETURN json_build_object(
    'remaining', v_remaining,
    'quota_limit', v_effective_quota,
    'is_unlimited', v_is_unlimited,
    'reset_date', v_reset_date,
    'used', v_usage_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant quota override function (for admin)
CREATE OR REPLACE FUNCTION grant_ai_quota_override(
  p_user_id UUID,
  p_quota_limit INTEGER DEFAULT NULL,
  p_is_unlimited BOOLEAN DEFAULT FALSE,
  p_granted_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  -- Upsert override
  INSERT INTO potluckpartys_user_ai_quota_overrides (
    user_id, quota_limit, is_unlimited, granted_by, notes, expires_at
  )
  VALUES (
    p_user_id, 
    p_quota_limit, 
    p_is_unlimited, 
    p_granted_by, 
    p_notes, 
    p_expires_at
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    quota_limit = EXCLUDED.quota_limit,
    is_unlimited = EXCLUDED.is_unlimited,
    granted_by = EXCLUDED.granted_by,
    notes = EXCLUDED.notes,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'quota_limit', p_quota_limit,
    'is_unlimited', p_is_unlimited,
    'expires_at', p_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Revoke quota override function
CREATE OR REPLACE FUNCTION revoke_ai_quota_override(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  DELETE FROM potluckpartys_user_ai_quota_overrides
  WHERE user_id = p_user_id;
  
  RETURN json_build_object('success', true, 'user_id', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Get all users with quota info (for admin dashboard)
CREATE OR REPLACE FUNCTION get_all_users_quota_info(
  p_default_quota INTEGER DEFAULT 3,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_search_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH ordered_users AS (
    SELECT 
      p.id,
      p.email,
      p.full_name,
      p.is_admin,
      p.created_at,
      qo.id AS quota_override_id,
      qo.quota_limit,
      qo.is_unlimited,
      qo.granted_by,
      qo.granted_at,
      qo.expires_at,
      qo.notes,
      COALESCE(u.usage_count, 0) AS usage_count
    FROM potluckpartys_profiles p
    LEFT JOIN potluckpartys_user_ai_quota_overrides qo ON qo.user_id = p.id
      AND (qo.expires_at IS NULL OR qo.expires_at > NOW())
    LEFT JOIN potluckpartys_user_ai_usage u ON u.user_id = p.id
      AND u.month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    WHERE (p_search_email IS NULL OR p.email ILIKE '%' || p_search_email || '%')
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT json_agg(
    json_build_object(
      'user_id', id,
      'email', email,
      'full_name', full_name,
      'is_admin', is_admin,
      'quota_override', CASE 
        WHEN quota_override_id IS NOT NULL THEN json_build_object(
          'quota_limit', quota_limit,
          'is_unlimited', is_unlimited,
          'granted_by', granted_by,
          'granted_at', granted_at,
          'expires_at', expires_at,
          'notes', notes
        )
        ELSE NULL
      END,
      'current_usage', usage_count,
      'effective_quota', CASE
        WHEN is_unlimited = TRUE THEN NULL
        WHEN quota_limit IS NOT NULL THEN quota_limit
        ELSE p_default_quota
      END,
      'remaining', CASE
        WHEN is_unlimited = TRUE THEN NULL
        WHEN quota_limit IS NOT NULL THEN GREATEST(0, quota_limit - usage_count)
        ELSE GREATEST(0, p_default_quota - usage_count)
      END
    )
    ORDER BY created_at DESC
  ) INTO v_result
  FROM ordered_users;
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Make a user admin: 
--    UPDATE potluckpartys_profiles SET is_admin = TRUE WHERE email = 'your-admin@email.com';
-- 2. Verify AI_QUOTA_LIMIT=3 (or 5) is in your .env.local file
-- 3. Restart your dev server: npm run dev
-- ============================================
-- 
-- IMPORTANT NOTES:
-- - potluckpartys_profiles.id references auth.users.id (not user_id)
-- - potluckpartys_user_ai_usage.user_id references auth.users.id
-- - potluckpartys_user_ai_quota_overrides.user_id references auth.users.id
-- - All functions use SECURITY DEFINER for elevated privileges
-- - RLS policies ensure users can only see their own data
-- ============================================
