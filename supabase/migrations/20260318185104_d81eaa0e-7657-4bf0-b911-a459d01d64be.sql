
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'salesperson');
CREATE TYPE public.opportunity_stage AS ENUM ('lead', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  team TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- LEAD SOURCES
CREATE TABLE public.lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'prospect',
  owner_id UUID REFERENCES auth.users(id),
  account_tier TEXT DEFAULT 'standard',
  lead_source_id UUID REFERENCES public.lead_sources(id),
  annual_revenue_estimate DECIMAL(14,2),
  account_value DECIMAL(14,2),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  next_follow_up_at TIMESTAMPTZ,
  health_score INTEGER DEFAULT 100,
  is_stale BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACTS
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  role_in_decision TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OPPORTUNITIES
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  primary_contact_id UUID REFERENCES public.contacts(id),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  stage opportunity_stage DEFAULT 'lead',
  status TEXT DEFAULT 'open',
  value DECIMAL(12,2) DEFAULT 0,
  probability INTEGER DEFAULT 10,
  health TEXT DEFAULT 'good',
  source TEXT,
  pain_summary TEXT,
  blocker_summary TEXT,
  next_step TEXT,
  next_step_due_at TIMESTAMPTZ,
  expected_close_date DATE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  discovery_score INTEGER DEFAULT 0,
  confidence_level TEXT DEFAULT 'low',
  is_stale BOOLEAN DEFAULT FALSE,
  lost_reason TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITIES
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  owner_id UUID REFERENCES auth.users(id),
  activity_type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  outcome TEXT,
  source_system TEXT DEFAULT 'manual',
  external_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  owner_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  auto_created BOOLEAN DEFAULT FALSE,
  created_by_workflow TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FILES
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  uploaded_by UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSCRIPTS
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  contact_id UUID REFERENCES public.contacts(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  source_type TEXT DEFAULT 'upload',
  source_file_id UUID REFERENCES public.files(id),
  transcript_text TEXT,
  transcript_status TEXT DEFAULT 'ready',
  language TEXT DEFAULT 'en',
  generated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISCOVERY ANALYSES
CREATE TABLE public.discovery_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES public.transcripts(id),
  company_id UUID REFERENCES public.companies(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  score_total INTEGER DEFAULT 0,
  score_pain INTEGER DEFAULT 0,
  score_impact INTEGER DEFAULT 0,
  score_urgency INTEGER DEFAULT 0,
  score_stakeholder INTEGER DEFAULT 0,
  score_budget INTEGER DEFAULT 0,
  score_next_step INTEGER DEFAULT 0,
  score_notes_quality INTEGER DEFAULT 0,
  score_confidence INTEGER DEFAULT 0,
  summary TEXT,
  pains TEXT,
  business_challenges TEXT,
  urgency_signals TEXT,
  objections TEXT,
  opportunity_strength TEXT,
  missing_elements TEXT,
  risk_flags TEXT,
  coaching_feedback TEXT,
  suggested_questions TEXT,
  recommended_next_action TEXT,
  follow_up_email_draft TEXT,
  model_name TEXT,
  analysis_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVENUE ENTRIES
CREATE TABLE public.revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  amount DECIMAL(14,2) NOT NULL,
  revenue_type TEXT DEFAULT 'recurring',
  period_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTEGRATION ACCOUNTS
CREATE TABLE public.integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected',
  external_account_id TEXT,
  scopes TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYNC LOGS
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT,
  entity_type TEXT,
  entity_id UUID,
  direction TEXT,
  status TEXT,
  message TEXT,
  run_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAGS
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.company_tags (
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, tag_id)
);

CREATE TABLE public.contact_tags (
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

CREATE TABLE public.opportunity_tags (
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (opportunity_id, tag_id)
);

-- INDEXES
CREATE INDEX idx_companies_owner ON public.companies(owner_id);
CREATE INDEX idx_companies_status ON public.companies(status);
CREATE INDEX idx_contacts_company ON public.contacts(company_id);
CREATE INDEX idx_opportunities_company ON public.opportunities(company_id);
CREATE INDEX idx_opportunities_owner ON public.opportunities(owner_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX idx_activities_company ON public.activities(company_id);
CREATE INDEX idx_activities_opportunity ON public.activities(opportunity_id);
CREATE INDEX idx_activities_owner ON public.activities(owner_id);
CREATE INDEX idx_tasks_owner ON public.tasks(owner_id);
CREATE INDEX idx_tasks_due ON public.tasks(due_at);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'salesperson');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- HAS_ROLE SECURITY DEFINER FUNCTION
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_tags ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "View roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manages roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All read lead sources" ON public.lead_sources FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin manage lead sources" ON public.lead_sources FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View companies" ON public.companies FOR SELECT USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert companies" ON public.companies FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Update companies" ON public.companies FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete companies" ON public.companies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View contacts" ON public.contacts FOR SELECT USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert contacts" ON public.contacts FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Update contacts" ON public.contacts FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete contacts" ON public.contacts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View opportunities" ON public.opportunities FOR SELECT USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Update opportunities" ON public.opportunities FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete opportunities" ON public.opportunities FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View activities" ON public.activities FOR SELECT USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert activities" ON public.activities FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Update activities" ON public.activities FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View tasks" ON public.tasks FOR SELECT USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert tasks" ON public.tasks FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Update tasks" ON public.tasks FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete tasks" ON public.tasks FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View files" ON public.files FOR SELECT USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert files" ON public.files FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Delete files" ON public.files FOR DELETE USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View transcripts" ON public.transcripts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Insert transcripts" ON public.transcripts FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "View analyses" ON public.discovery_analyses FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Insert analyses" ON public.discovery_analyses FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Update analyses" ON public.discovery_analyses FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "View revenue" ON public.revenue_entries FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Insert revenue" ON public.revenue_entries FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "View own integrations" ON public.integration_accounts FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Manage own integrations" ON public.integration_accounts FOR ALL USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View sync logs" ON public.sync_logs FOR SELECT USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "View own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "All read tags" ON public.tags FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin manage tags" ON public.tags FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All read company tags" ON public.company_tags FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Manage company tags" ON public.company_tags FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "All read contact tags" ON public.contact_tags FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Manage contact tags" ON public.contact_tags FOR ALL TO authenticated USING (TRUE);
CREATE POLICY "All read opportunity tags" ON public.opportunity_tags FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Manage opportunity tags" ON public.opportunity_tags FOR ALL TO authenticated USING (TRUE);

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-files', 'crm-files', false);

CREATE POLICY "Authenticated users upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crm-files');
CREATE POLICY "Authenticated users view files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'crm-files');
CREATE POLICY "Users delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'crm-files');
