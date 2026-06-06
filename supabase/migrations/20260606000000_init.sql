-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    gender TEXT,
    date_of_birth DATE,
    height NUMERIC,
    weight NUMERIC,
    bmi NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Diseases Table (static list of reference diseases)
CREATE TABLE IF NOT EXISTS public.diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- 3. User Diseases Table (junction table)
CREATE TABLE IF NOT EXISTS public.user_diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    disease_id UUID NOT NULL REFERENCES public.diseases(id) ON DELETE CASCADE,
    UNIQUE(user_id, disease_id)
);

-- 4. Health Goals Table
CREATE TABLE IF NOT EXISTS public.health_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL
);

-- 5. Food Logs Table
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    image_url TEXT,
    calories NUMERIC,
    protein NUMERIC,
    carbs NUMERIC,
    fat NUMERIC,
    sugar NUMERIC,
    risk_level TEXT CHECK (risk_level IN ('SAFE', 'CAUTION', 'RISK')),
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Symptom Logs Table
CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symptoms TEXT,
    possible_condition TEXT,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0 NOT NULL,
    streak INTEGER DEFAULT 0 NOT NULL,
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Diseases Policies
CREATE POLICY "Allow read access to all authenticated users for diseases" 
ON public.diseases FOR SELECT TO authenticated USING (true);

-- Profiles Policies
CREATE POLICY "Allow select for own profile or admin" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow update for own profile or admin" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow insert for authenticated users (own profile)" 
ON public.profiles FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

-- User Diseases Policies
CREATE POLICY "Allow user diseases read/write for self or admin" 
ON public.user_diseases FOR ALL TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Health Goals Policies
CREATE POLICY "Allow health goals read/write for self or admin" 
ON public.health_goals FOR ALL TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Food Logs Policies
CREATE POLICY "Allow food logs read/write for self or admin" 
ON public.food_logs FOR ALL TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Symptom Logs Policies
CREATE POLICY "Allow symptom logs read/write for self or admin" 
ON public.symptom_logs FOR ALL TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Leaderboard Policies
CREATE POLICY "Allow leaderboard read access to authenticated users" 
ON public.leaderboard FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow leaderboard update access to self or admin" 
ON public.leaderboard FOR UPDATE TO authenticated 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow leaderboard insert to system" 
ON public.leaderboard FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Triggers for automatic Profile & Leaderboard creation on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );

    INSERT INTO public.leaderboard (user_id, points, streak)
    VALUES (new.id, 0, 0);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime Subscriptions (using Supabase publication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.symptom_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create Storage Bucket for Food Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for food-images bucket
CREATE POLICY "Public Read Access for Food Images"
ON storage.objects FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated Upload for Food Images"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'food-images');

CREATE POLICY "Authenticated Update/Delete for own Food Images"
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'food-images' AND owner = auth.uid()::text);

-- Populate default disease list
INSERT INTO public.diseases (name) VALUES 
('Diabetes'),
('Hypertension'),
('Heart Disease'),
('Kidney Disease'),
('Asthma'),
('Obesity')
ON CONFLICT (name) DO NOTHING;
