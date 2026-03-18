import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Plus, Search, Phone, Mail, Calendar, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: MessageSquare,
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", typeFilter],
    queryFn: async () => {
      let q = supabase.from("activities").select("*, companies(name), contacts(first_name, last_name)").order("occurred_at", { ascending: false });
      if (typeFilter !== "all") q = q.eq("activity_type", typeFilter as any);
      const { data } = await q.limit(100);
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
    mutationFn: async (activity: { activity_type: string; subject: string; description: string; company_id: string }) => {
      const { error } = await supabase.from("activities").insert({
        ...activity,
        activity_type: activity.activity_type as any,
        company_id: activity.company_id || null,
        owner_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({ title: "Activity logged" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = activities.filter((a) =>
    a.subject.toLowerCase().includes(search.toLowerCase()) || (a.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="text-sm text-muted-foreground mt-1">Activity log</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Log Activity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                activity_type: fd.get("activity_type") as string,
                subject: fd.get("subject") as string,
                description: fd.get("description") as string,
                company_id: fd.get("company_id") as string,
              });
            }} className="space-y-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <select name="activity_type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Subject *</Label><Input name="subject" required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" rows={3} /></div>
              <div className="space-y-2">
                <Label>Company</Label>
                <select name="company_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">None</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Log Activity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="call">Calls</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="meeting">Meetings</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No activities found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const Icon = typeIcons[a.activity_type] || Activity;
            return (
              <Card key={a.id} className="shadow-card">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.subject}</p>
                    {a.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {a.companies && <span>{(a.companies as any).name}</span>}
                      {a.contacts && <span>· {(a.contacts as any).first_name} {(a.contacts as any).last_name}</span>}
                      {a.occurred_at && <span>· {new Date(a.occurred_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize shrink-0">{a.activity_type}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
