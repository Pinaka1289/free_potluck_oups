# Admin Panel & AI Quota System Setup Guide

## Overview
This guide will help you set up the AI quota system and Admin panel for managing user quotas.

---

## Step 1: Supabase Database Setup

### 1.1 Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### 1.2 Run the SQL Schema
1. Open the file: `supabase-quota-setup.sql` in your project root
2. Copy **ALL** the SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

**What this creates:**
- `is_admin` column in `potluckpartys_profiles` table
- `potluckpartys_user_ai_usage` table (tracks monthly usage)
- `potluckpartys_user_ai_quota_overrides` table (custom quotas per user)
- 5 Supabase functions for quota management
- RLS (Row Level Security) policies

---

## Step 2: Make Your First Admin User

After running the SQL, you need to make yourself (or another user) an admin.

### Option A: Via Supabase SQL Editor
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE potluckpartys_profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

### Option B: Via Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Find your user by email
3. Note the **User UID** (UUID)
4. Go to **Table Editor** → `potluckpartys_profiles`
5. Find your row (by email or user ID)
6. Edit the row and set `is_admin` to `true`
7. Save

---

## Step 3: Environment Variable Setup

### 3.1 Add to `.env.local`
Open `.env.local` and add:
```bash
AI_QUOTA_LIMIT=3
```

**To change default quota:**
- Change `3` to `5` (or any number)
- Restart your dev server: `npm run dev`

---

## Step 4: Verify Setup

### 4.1 Test Admin Access
1. **Sign in** to your app with the admin account
2. You should see **"Admin Panel"** link in:
   - Desktop: User menu dropdown (top right)
   - Mobile: Mobile menu
3. Click **Admin Panel** → Should redirect to `/admin`

### 4.2 Test Quota System
1. Go to **AI Potluck Ideas** or **AI Recipe Generator**
2. You should see quota display: "X / 3 prompts remaining this month"
3. Generate an idea/recipe → Quota should decrease
4. After 3 uses → Should show "Monthly quota exhausted" error

---

## Step 5: Using the Admin Panel

### 5.1 Access Admin Panel
- URL: `/admin`
- Only visible to users with `is_admin = TRUE`
- Normal users will be redirected to home if they try to access

### 5.2 Grant Quota Override

**Grant 100 prompts to a user:**
1. Search user by email in Admin Panel
2. Click **"Grant"** button next to the user
3. In modal:
   - Uncheck "Unlimited prompts"
   - Enter `100` in "Custom Quota Limit"
   - (Optional) Add expiration date
   - (Optional) Add notes
4. Click **Save**

**Grant unlimited prompts:**
1. Click **"Grant"** button
2. Check **"Unlimited prompts"**
3. Click **Save**

**Remove override (revert to default):**
1. Click **"Grant"** button
2. Leave "Custom Quota Limit" **empty**
3. Uncheck "Unlimited prompts"
4. Click **Save**

Or click the **X** button next to the user to revoke override.

---

## Step 6: Making More Admins

### Via SQL:
```sql
-- First, verify the user exists and check current status
SELECT id, email, is_admin 
FROM potluckpartys_profiles 
WHERE email = 'cspkumargowd@gamil.com';

-- Update admin status
UPDATE potluckpartys_profiles
SET is_admin = TRUE
WHERE email = 'cspkumargowd@gamil.com';

-- Verify the update
SELECT id, email, is_admin 
FROM potluckpartys_profiles 
WHERE email = 'cspkumargowd@gamil.com';
```

**Important:** After running the UPDATE:
1. **Sign out** completely from the app
2. **Sign back in** with the same account
3. The "Admin Panel" link should now appear in the header

**If it still doesn't work:**
- Check if the email matches exactly (case-sensitive in some databases)
- Verify the profile exists: `SELECT * FROM potluckpartys_profiles WHERE email = 'cspkumargowd@gamil.com';`
- If profile doesn't exist, create it manually using the user ID from `auth.users`
- Clear browser cache and cookies
- See `ADMIN_DEBUG.sql` for detailed diagnostic queries

### Via Admin Panel (Future Enhancement):
Currently, you need to use SQL. You could add an "Admin Management" section later.

---

## Troubleshooting

### Issue: "Admin access required" when accessing `/admin`
**Solution:**
- Verify `is_admin = TRUE` in `potluckpartys_profiles` for your user
- Sign out and sign back in
- Clear browser cache

### Issue: Quota not updating after generation
**Solution:**
- Check browser console for errors
- Verify Supabase functions are created (check SQL Editor → Functions)
- Check Supabase logs for function errors

### Issue: "Failed to check quota" error
**Solution:**
- Verify `check_and_increment_ai_usage` function exists in Supabase
- Check RLS policies are enabled
- Verify user is authenticated

### Issue: Default quota not working
**Solution:**
- Check `.env.local` has `AI_QUOTA_LIMIT=3` (or your desired number)
- Restart dev server: `npm run dev`
- Verify `AI_QUOTA_LIMIT` constant in `src/lib/utils.ts` reads from env

---

## Database Tables Reference

### `potluckpartys_user_ai_usage`
- Tracks monthly usage per user
- One row per user per month
- Auto-resets when month changes (lazy reset)

### `potluckpartys_user_ai_quota_overrides`
- Stores custom quotas (100, unlimited, etc.)
- One row per user (unique constraint)
- Optional expiration date

### `potluckpartys_profiles`
- Added `is_admin` column
- `TRUE` = admin user, can access `/admin`

---

## API Endpoints

### User-facing:
- `GET /api/admin/quota-info` - Get current user's quota status

### Admin-only:
- `GET /api/admin/users-quota` - List all users with quota info
- `POST /api/admin/grant-quota` - Grant quota override
- `POST /api/admin/revoke-quota` - Remove quota override

---

## Security Notes

- Admin routes are protected server-side (layout) and client-side (page)
- RLS policies ensure users can only see their own usage
- Admin functions use `SECURITY DEFINER` for elevated privileges
- All admin API routes check `is_admin` before allowing access

---

## Next Steps (Optional Enhancements)

1. **Admin Management UI**: Add ability to grant/revoke admin status from Admin Panel
2. **Usage Analytics**: Show charts/graphs of AI usage over time
3. **Bulk Operations**: Grant quota to multiple users at once
4. **Email Notifications**: Notify users when quota is low or exhausted
5. **Quota Purchase**: Allow users to buy additional prompts

---

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console for errors
3. Verify all SQL was executed successfully
4. Ensure environment variables are set correctly
