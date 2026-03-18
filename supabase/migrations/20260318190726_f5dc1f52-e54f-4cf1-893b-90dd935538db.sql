
-- Add missing columns to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_type text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS postal_code text;

-- Add missing columns to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS contact_type text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS notes text;

-- Add missing columns to activities
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS next_contact_at timestamp with time zone;
