import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

const STAGES = ["lead", "discovery", "proposal", "negotiation", "closed_won", "closed_lost"] as const;

const stageColors: Record<string, string> = {
  lead: "bg-muted-foreground",
  discovery: "bg-primary",
  proposal: "bg-warning",
  negotiation: "bg-[hsl(280,67%,55%)]",
  closed_won: "bg-success",
  closed_lost: "bg-destructive",
};

const stageBgColors: Record<string, string> = {
  lead: "bg-muted",
  discovery: "bg-primary/5",
  proposal: "bg-warning/5",
  negotiation: "bg-[hsl(280,67%,55%)]/5",
  closed_won: "bg-success/5",
  closed_lost: "bg-destructive/5",
};

export default function PipelinePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("*, companies(name)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").order("name");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (opp: { name: string; company_id: string; value: string; stage: string; expected_close_date: string }) => {
      const { error } = await supabase.from("opportunities").insert({
        name: opp.name,
        company_id: opp.company_id || null,
        value: parseFloat(opp.value) || 0,
        stage: opp.stage as any,
        expected_close_date: opp.expected_close_date || null,
        owner_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      toast({ title: "Opportunity created" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const activeStages = STAGES.filter(s => s !== "closed_won" && s !== "closed_lost");

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">{opportunities.filter(o => !["closed_won","closed_lost"].includes(o.stage)).length} active opportunities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Opportunity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Opportunity</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                name: fd.get("name") as string,
                company_id: fd.get("company_id") as string,
                value: fd.get("value") as string,
                stage: fd.get("stage") as string || "lead",
                expected_close_date: fd.get("expected_close_date") as string,
              });
            }} className="space-y-4">
              <div className="space-y-2"><Label>Name *</Label><Input name="name" required /></div>
              <div className="space-y-2">
                <Label>Company</Label>
                <select name="company_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Value ($)</Label><Input name="value" type="number" step="0.01" /></div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <select name="stage" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {STAGES.filter(s => s !== "closed_won" && s !== "closed_lost").map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label>Expected Close Date</Label><Input name="expected_close_date" type="date" /></div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {activeStages.map((stage) => {
          const stageOpps = opportunities.filter(o => o.stage === stage);
          const stageValue = stageOpps.reduce((s, o) => s + (Number(o.value) || 0), 0);
          return (
            <div key={stage} className={`rounded-lg p-3 ${stageBgColors[stage]} min-w-[280px]`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stageColors[stage]}`} />
                  <span className="text-sm font-medium capitalize">{stage.replace("_", " ")}</span>
                  <span className="text-xs text-muted-foreground">({stageOpps.length})</span>
                </div>
                <span className="text-xs font-medium tabular-nums">${(stageValue / 1000).toFixed(0)}k</span>
              </div>
              <div className="space-y-2">
                {stageOpps.map((opp) => (
                  <Link to={`/pipeline/${opp.id}`} key={opp.id}>
                    <Card className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium truncate flex-1">{opp.name}</p>
                          {opp.is_stale && <div className="w-2 h-2 rounded-full bg-destructive shrink-0 mt-1" />}
                        </div>
                        {opp.companies && <p className="text-xs text-muted-foreground">{(opp.companies as any).name}</p>}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium tabular-nums">${Number(opp.value).toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                        </div>
                        {opp.next_step ? (
                          <p className="text-xs text-primary truncate">→ {opp.next_step}</p>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <AlertTriangle className="h-3 w-3" />
                            <span>No next step</span>
                          </div>
                        )}
                        {opp.expected_close_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(opp.expected_close_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {stageOpps.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No opportunities</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
