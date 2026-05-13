export interface Company {
  id: string;
  name: string;
  company_type?: string;
  website?: string;
  linkedin_url?: string;
  phone?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  priority: "high" | "medium" | "low";
  status: "prospect" | "active" | "dormant" | "lost";
  owner_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  due_at?: string | null;
  status: "pending" | "completed";
  owner_id: string;
  company_id?: string;
  opportunity_id?: string;
  completed_at?: string | null;
}
