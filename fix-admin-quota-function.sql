-- ============================================
-- FIX: get_all_users_quota_info Function
-- ============================================
-- Run this SQL in Supabase SQL Editor to fix the GROUP BY error
-- ============================================

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
-- VERIFY: Test the function
-- ============================================
-- SELECT get_all_users_quota_info(3, 10, 0, NULL);
-- ============================================
