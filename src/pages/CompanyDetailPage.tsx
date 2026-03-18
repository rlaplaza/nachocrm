import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Globe, MapPin, Target, Activity, Users, FileText } from "lucide-react";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: company } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["company-contacts", id],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").eq("company_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["company-opportunities", id],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("*").eq("company_id", id!);
      return data || [];
    },
    enabled: !!id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["company-activities", id],
    queryFn: async () => {
      const { data } = await supabase.from("activities").select("*").eq("company_id", id!).order("occurred_at", { ascending: false }).limit(15);
      return data || [];
    },
    enabled: !!id,
  });

  if (!company) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const totalPipeline = opportunities.filter(o => !["closed_won", "closed_lost"].includes(o.stage)).reduce((s, o) => s + (Number(o.value) || 0), 0);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-3">
        <Link to="/companies"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {company.industry && <span>{company.industry}</span>}
            {company.city && <><span>·</span><MapPin className="h-3 w-3" /><span>{company.city}{company.country ? `, ${company.country}` : ""}</span></>}
            {company.website && <><span>·</span><Globe className="h-3 w-3" /><a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{company.website}</a></>}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">{company.status}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
          <p className="text-xl font-semibold tabular-nums">${totalPipeline.toLocaleString()}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Open Opportunities</p>
          <p className="text-xl font-semibold tabular-nums">{opportunities.filter(o => !["closed_won","closed_lost"].includes(o.stage)).length}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Contacts</p>
          <p className="text-xl font-semibold tabular-nums">{contacts.length}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Health Score</p>
          <p className={`text-xl font-semibold tabular-nums ${(company.health_score || 0) >= 70 ? "text-success" : (company.health_score || 0) >= 40 ? "text-warning" : "text-destructive"}`}>
            {company.health_score || 0}
          </p>
        </CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contacts */}
        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Contacts</CardTitle></CardHeader>
          <CardContent>
            {contacts.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No contacts yet</p> : (
              <div className="space-y-2">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center gap-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.title || c.email}</p>
                    </div>
                    {c.is_primary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4" />Opportunities</CardTitle></CardHeader>
          <CardContent>
            {opportunities.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No opportunities yet</p> : (
              <div className="space-y-2">
                {opportunities.map(o => (
                  <Link to={`/pipeline/${o.id}`} key={o.id} className="flex items-start gap-2 py-1.5 hover:bg-muted/50 rounded px-1 -mx-1 transition-colors">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      o.stage === "lead" ? "bg-muted-foreground" : o.stage === "discovery" ? "bg-primary" : o.stage === "proposal" ? "bg-warning" : o.stage === "negotiation" ? "bg-[hsl(280,67%,55%)]" : o.stage === "closed_won" ? "bg-success" : "bg-destructive"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{o.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{o.stage.replace("_", " ")} · ${Number(o.value).toLocaleString()}</p>
                    </div>
                    {o.is_stale && <Badge variant="destructive" className="text-[10px]">Stale</Badge>}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="shadow-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Activity className="h-4 w-4" />Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {activities.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p> : (
              <div className="space-y-2">
                {activities.map(a => (
                  <div key={a.id} className="flex items-start gap-2 py-1.5">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{a.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="capitalize">{a.activity_type}</span> · {a.occurred_at ? new Date(a.occurred_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
