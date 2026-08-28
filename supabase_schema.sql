-- ==========================================
-- SUPABASE DATABASE SCHEMA FOR CMMSApp
-- Run this script in Supabase Dashboard -> SQL Editor
-- ==========================================

-- 1. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    asset_code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    location TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    install_date TIMESTAMPTZ,
    qr_code TEXT,
    photo_path TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    checklist_template_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by asset_code and category
CREATE INDEX IF NOT EXISTS idx_assets_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);

-- 2. CHECKLIST TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.checklist_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHECKLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id TEXT PRIMARY KEY,
    template_id TEXT REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
    category TEXT,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    unit TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    min_value NUMERIC,
    max_value NUMERIC,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_template ON public.checklist_items(template_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow full access to anon/authenticated roles
-- ==========================================

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Assets Policies
DROP POLICY IF EXISTS "Public access for assets" ON public.assets;
CREATE POLICY "Public access for assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);

-- Checklist Templates Policies
DROP POLICY IF EXISTS "Public access for checklist_templates" ON public.checklist_templates;
CREATE POLICY "Public access for checklist_templates" ON public.checklist_templates FOR ALL USING (true) WITH CHECK (true);

-- Checklist Items Policies
DROP POLICY IF EXISTS "Public access for checklist_items" ON public.checklist_items;
CREATE POLICY "Public access for checklist_items" ON public.checklist_items FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON public.assets TO anon, authenticated, service_role;
GRANT ALL ON public.checklist_templates TO anon, authenticated, service_role;
GRANT ALL ON public.checklist_items TO anon, authenticated, service_role;

-- ==========================================
-- 4. INSPECTIONS TABLE (HISTORY)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.inspections (
    id TEXT PRIMARY KEY,
    asset_id TEXT REFERENCES public.assets(id) ON DELETE CASCADE,
    inspector_name TEXT,
    inspection_date TIMESTAMPTZ DEFAULT NOW(),
    type TEXT,
    status TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    signature_path TEXT,
    pdf_path TEXT,
    form_data JSONB DEFAULT '{}'::jsonb,
    is_synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_asset ON public.inspections(asset_id);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for inspections" ON public.inspections;
CREATE POLICY "Public access for inspections" ON public.inspections FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.inspections TO anon, authenticated, service_role;

-- ==========================================
-- 5. STORAGE BUCKETS
-- ==========================================
-- Create bucket for inspection media (PDFs, photos, signatures)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspections_media', 'inspections_media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies (Allow all for simplicity, can restrict later)
DROP POLICY IF EXISTS "Public Access for inspections_media" ON storage.objects;
CREATE POLICY "Public Access for inspections_media" ON storage.objects FOR ALL USING (bucket_id = 'inspections_media') WITH CHECK (bucket_id = 'inspections_media');

