import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Search, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function CompaniesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("*").order("name");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (company: { name: string; industry: string; website: string; city: string; country: string; status: string }) => {
      const { error } = await supabase.from("companies").insert({ ...company, owner_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Company created" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = companies.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.industry || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string | null) => {
    switch (s) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "prospect": return "bg-primary/10 text-primary border-primary/20";
      case "lost": return "bg-destructive/10 text-destructive border-destructive/20";
      case "dormant": return "bg-muted text-muted-foreground border-border";
      default: return "bg-secondary text-secondary-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">{companies.length} accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Company</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                name: fd.get("name") as string,
                industry: fd.get("industry") as string,
                website: fd.get("website") as string,
                city: fd.get("city") as string,
                country: fd.get("country") as string,
                status: fd.get("status") as string || "prospect",
              });
            }} className="space-y-4">
              <div className="space-y-2"><Label>Name *</Label><Input name="name" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Industry</Label><Input name="industry" /></div>
                <div className="space-y-2"><Label>Website</Label><Input name="website" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>City</Label><Input name="city" /></div>
                <div className="space-y-2"><Label>Country</Label><Input name="country" /></div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select name="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="prospect">Prospect</option>
                  <option value="active">Active</option>
                  <option value="dormant">Dormant</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Company"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="dormant">Dormant</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No companies found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Link to={`/companies/${c.id}`} key={c.id}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[c.industry, c.city, c.country].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${statusColor(c.status)} capitalize text-xs`}>{c.status}</Badge>
                  {c.health_score !== null && c.health_score < 50 && (
                    <Badge variant="destructive" className="text-[10px]">Low Health</Badge>
                  )}
                  {c.is_stale && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">Stale</Badge>}
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
