-- Supabase Database Schema for PotluckPartys
-- SAFE: Does NOT drop or modify existing auth data
-- All tables are prefixed with 'potluckpartys_'

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create potluckpartys_profiles table (linked to Supabase Auth)
-- This only stores additional profile info for THIS app
CREATE TABLE IF NOT EXISTS potluckpartys_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create potluckpartys_events table
CREATE TABLE IF NOT EXISTS potluckpartys_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TIME,
  location TEXT,
  host_name TEXT,
  host_email TEXT,
  user_id UUID REFERENCES potluckpartys_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create potluckpartys_items table
CREATE TABLE IF NOT EXISTS potluckpartys_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES potluckpartys_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  quantity INTEGER DEFAULT 1,
  brought_by TEXT,
  notes TEXT,
  claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_potluckpartys_events_slug ON potluckpartys_events(slug);
CREATE INDEX IF NOT EXISTS idx_potluckpartys_events_user_id ON potluckpartys_events(user_id);
CREATE INDEX IF NOT EXISTS idx_potluckpartys_items_event_id ON potluckpartys_items(event_id);

-- Enable Row Level Security
ALTER TABLE potluckpartys_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE potluckpartys_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE potluckpartys_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies (using DO block to avoid errors if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_profiles' AND policyname = 'potluckpartys_profiles_select') THEN
    CREATE POLICY "potluckpartys_profiles_select" ON potluckpartys_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_profiles' AND policyname = 'potluckpartys_profiles_insert') THEN
    CREATE POLICY "potluckpartys_profiles_insert" ON potluckpartys_profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_profiles' AND policyname = 'potluckpartys_profiles_update') THEN
    CREATE POLICY "potluckpartys_profiles_update" ON potluckpartys_profiles FOR UPDATE USING (true);
  END IF;
END $$;

-- Events policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_events' AND policyname = 'potluckpartys_events_select') THEN
    CREATE POLICY "potluckpartys_events_select" ON potluckpartys_events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_events' AND policyname = 'potluckpartys_events_insert') THEN
    CREATE POLICY "potluckpartys_events_insert" ON potluckpartys_events FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_events' AND policyname = 'potluckpartys_events_update') THEN
    CREATE POLICY "potluckpartys_events_update" ON potluckpartys_events FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_events' AND policyname = 'potluckpartys_events_delete') THEN
    CREATE POLICY "potluckpartys_events_delete" ON potluckpartys_events FOR DELETE USING (true);
  END IF;
END $$;

-- Items policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_items' AND policyname = 'potluckpartys_items_select') THEN
    CREATE POLICY "potluckpartys_items_select" ON potluckpartys_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_items' AND policyname = 'potluckpartys_items_insert') THEN
    CREATE POLICY "potluckpartys_items_insert" ON potluckpartys_items FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_items' AND policyname = 'potluckpartys_items_update') THEN
    CREATE POLICY "potluckpartys_items_update" ON potluckpartys_items FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'potluckpartys_items' AND policyname = 'potluckpartys_items_delete') THEN
    CREATE POLICY "potluckpartys_items_delete" ON potluckpartys_items FOR DELETE USING (true);
  END IF;
END $$;

-- Function: Auto-create potluckpartys profile when user signs up (UNIQUE name for this app)
CREATE OR REPLACE FUNCTION handle_potluckpartys_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.potluckpartys_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;  -- Skip if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger with UNIQUE name for this app (does NOT affect other triggers)
DROP TRIGGER IF EXISTS on_potluckpartys_user_created ON auth.users;
CREATE TRIGGER on_potluckpartys_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_potluckpartys_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION potluckpartys_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at (with unique names)
DROP TRIGGER IF EXISTS potluckpartys_profiles_updated_at ON potluckpartys_profiles;
CREATE TRIGGER potluckpartys_profiles_updated_at
  BEFORE UPDATE ON potluckpartys_profiles
  FOR EACH ROW EXECUTE FUNCTION potluckpartys_update_updated_at();

DROP TRIGGER IF EXISTS potluckpartys_events_updated_at ON potluckpartys_events;
CREATE TRIGGER potluckpartys_events_updated_at
  BEFORE UPDATE ON potluckpartys_events
  FOR EACH ROW EXECUTE FUNCTION potluckpartys_update_updated_at();

DROP TRIGGER IF EXISTS potluckpartys_items_updated_at ON potluckpartys_items;
CREATE TRIGGER potluckpartys_items_updated_at
  BEFORE UPDATE ON potluckpartys_items
  FOR EACH ROW EXECUTE FUNCTION potluckpartys_update_updated_at();
