# Quick Setup Guide - AI Quota & Admin Panel

## ✅ What's Been Implemented

1. **AI Quota System** - 3 free prompts/month (configurable via env var)
2. **Admin Panel** - `/admin` route for managing user quotas
3. **Quota Overrides** - Grant custom quotas (100, unlimited, etc.) to specific users
4. **Quota Display** - Shows remaining prompts on AI pages
5. **Admin Protection** - Only users with `is_admin = TRUE` can access admin panel

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Run SQL in Supabase
1. Open Supabase Dashboard → **SQL Editor**
2. Open file: `supabase-quota-setup.sql`
3. Copy **ALL** SQL content
4. Paste in SQL Editor → Click **Run**

### Step 2: Make Yourself Admin
In Supabase SQL Editor, run:
```sql
UPDATE potluckpartys_profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```
(Replace with your actual email)

### Step 3: Environment Variable
Already added to `.env.local`:
```
AI_QUOTA_LIMIT=3
```
Change `3` to `5` (or any number) to change default quota.

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Test
1. Sign in with admin account
2. You should see **"Admin Panel"** link in header
3. Go to `/admin` → Should see user quota management
4. Go to `/ideas` or `/recipes` → Should see quota counter

---

## 📋 Admin Panel Features

**URL:** `/admin`

**Features:**
- View all users with quota status
- Search users by email
- Grant custom quota (e.g., 100 prompts)
- Grant unlimited prompts
- Remove quota override (revert to default)
- See current usage vs quota limit

**How to Grant Quota:**
1. Search user by email
2. Click **"Grant"** button
3. Enter quota limit (e.g., `100`) OR check "Unlimited"
4. (Optional) Set expiration date
5. Click **Save**

---

## 🔧 Changing Default Quota

**Option 1: Environment Variable (Recommended)**
- Edit `.env.local`: `AI_QUOTA_LIMIT=5`
- Restart server

**Option 2: Code**
- Edit `src/lib/utils.ts`: Change default in `AI_QUOTA_LIMIT` constant

---

## 📊 How It Works

1. **Default Quota:** All users get `AI_QUOTA_LIMIT` prompts/month (from env var)
2. **Monthly Reset:** Automatically resets on 1st of each month (lazy reset)
3. **Override System:** Admins can grant custom quotas via Admin Panel
4. **Unlimited:** Admins can grant unlimited prompts to specific users
5. **Tracking:** Usage tracked in `potluckpartys_user_ai_usage` table

---

## 🛡️ Security

- Admin routes protected server-side (layout) + client-side (page)
- Only `is_admin = TRUE` users can access `/admin`
- RLS policies ensure users can only see their own usage
- Admin API routes check `is_admin` before allowing access

---

## 📁 Files Created/Modified

**New Files:**
- `supabase-quota-setup.sql` - Database schema
- `ADMIN_SETUP_GUIDE.md` - Detailed setup guide
- `src/lib/admin.ts` - Admin helper functions
- `src/app/admin/layout.tsx` - Admin layout (protected)
- `src/app/admin/page.tsx` - Admin UI
- `src/app/api/admin/*` - Admin API routes

**Modified Files:**
- `src/lib/utils.ts` - Added `AI_QUOTA_LIMIT` constant
- `src/app/api/food-ideas/route.ts` - Added quota check
- `src/app/api/recipes/route.ts` - Added quota check
- `src/app/ideas/page.tsx` - Added quota display
- `src/app/recipes/page.tsx` - Added quota display
- `src/components/layout/Header.tsx` - Added admin link
- `.env.local` - Added `AI_QUOTA_LIMIT`

---

## 🎯 Next Steps

1. **Run SQL** in Supabase (Step 1 above)
2. **Make yourself admin** (Step 2 above)
3. **Test the system** (Step 5 above)

That's it! The system is ready to use.

For detailed documentation, see `ADMIN_SETUP_GUIDE.md`.
