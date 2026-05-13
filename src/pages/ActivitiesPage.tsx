import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/types";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Opportunity {
  id: string;
  name: string;
}

const priorityColor = (p: string | null) => {
  switch (p) {
    case "high": return "bg-destructive/10 text-destructive border-destructive/20";
    case "medium": return "bg-warning/10 text-warning border-warning/20";
    case "low": return "bg-muted text-muted-foreground border-border";
    default: return "bg-secondary text-secondary-foreground border-border";
  }
};

const activityTypeLabel: Record<string, string> = {
  call: "Llamada",
  email: "Email",
  meeting: "Reunión",
  note: "Nota",
  task: "Tarea",
};

interface ActivityItem {
  id: string;
  activity_type: string;
  subject: string;
  description: string;
  company_id: string;
  contact_id: string;
  opportunity_id: string;
  priority: string;
  occurred_at: string;
  next_contact_at: string;
  owner_id: string;
  companies?: { name: string };
  contacts?: { first_name: string; last_name: string };
  opportunities?: { name: string };
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const data = await dataService.getAll<Company>("companies");
      return (data || []).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    },
  });

  const { data: contactsList = [] } = useQuery<Contact[]>({
    queryKey: ["contacts-list"],
    queryFn: async () => {
      const data = await dataService.getAll<Contact>("contacts");
      return (data || []).sort((a, b) => (a.last_name || "").localeCompare(b.last_name || ""));
    },
  });

  const { data: opportunitiesList = [] } = useQuery<Opportunity[]>({
    queryKey: ["opportunities-list"],
    queryFn: async () => {
      const data = await dataService.getAll<Opportunity>("opportunities");
      return (data || []).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    },
  });

  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["activities", typeFilter],
    queryFn: async () => {
      let data = await dataService.getAll<ActivityItem>("activities");
      if (typeFilter !== "all") {
        data = data.filter((a) => a.activity_type === typeFilter);
      }
      
      return (data || []).map((a) => ({
        ...a,
        companies: { name: companies.find((c) => c.id === a.company_id)?.name || "" },
        contacts: { 
          first_name: contactsList.find((c) => c.id === a.contact_id)?.first_name || "",
          last_name: contactsList.find((c) => c.id === a.contact_id)?.last_name || "",
        },
        opportunities: { name: opportunitiesList.find((o) => o.id === a.opportunity_id)?.name || "" }
      })).sort((a, b) => (b.occurred_at || "").localeCompare(a.occurred_at || ""));
    },
    enabled: companies.length > 0 || contactsList.length > 0 || opportunitiesList.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: async (activity: {
      activity_type: string; subject: string; description: string; company_id: string;
      contact_id: string; opportunity_id: string; priority: string;
      occurred_at: string; next_contact_at: string;
    }) => {
      await dataService.create("activities", {
        activity_type: activity.activity_type,
        subject: activity.subject,
        description: activity.description || null,
        company_id: activity.company_id || null,
        contact_id: activity.contact_id || null,
        opportunity_id: activity.opportunity_id || null,
        priority: activity.priority || "medium",
        occurred_at: activity.occurred_at || new Date().toISOString(),
        next_contact_at: activity.next_contact_at || null,
        owner_id: user!.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({ title: "Actividad registrada" });
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
          <h1 className="text-2xl font-semibold tracking-tight">Actividades</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro de actividad</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Registrar Actividad</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nueva Actividad</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                activity_type: fd.get("activity_type") as string,
                subject: fd.get("subject") as string,
                description: fd.get("description") as string,
                company_id: fd.get("company_id") as string,
                contact_id: fd.get("contact_id") as string,
                opportunity_id: fd.get("opportunity_id") as string,
                priority: fd.get("priority") as string || "medium",
                occurred_at: fd.get("occurred_at") as string,
                next_contact_at: fd.get("next_contact_at") as string,
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <select name="priority" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Interacción *</Label>
                  <select name="activity_type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="call">Llamada</option>
                    <option value="email">Email</option>
                    <option value="meeting">Reunión</option>
                    <option value="note">Nota</option>
                    <option value="task">Tarea</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label>Asunto *</Label><Input name="subject" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Fecha</Label><Input name="occurred_at" type="datetime-local" /></div>
                <div className="space-y-2"><Label>Fecha próximo contacto</Label><Input name="next_contact_at" type="datetime-local" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Oportunidad</Label>
                  <select name="opportunity_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Seleccione oportunidad</option>
                      {opportunitiesList.map((opp) => (
                          <option key={opp.id} value={opp.id}>{opp.name}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Contacto</Label>
                  <select name="contact_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Seleccione contacto</option>
                      {contactsList.map((c) => (
                          <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <select name="company_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Seleccione empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2"><Label>Descripción</Label><Textarea name="description" /></div>
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">Todas</option>
          <option value="call">Llamada</option>
          <option value="email">Email</option>
          <option value="meeting">Reunión</option>
          <option value="note">Nota</option>
          <option value="task">Tarea</option>
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Prioridad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell><Badge variant="outline">{activityTypeLabel[a.activity_type] || a.activity_type}</Badge></TableCell>
                <TableCell className="font-medium">{a.subject}</TableCell>
                <TableCell>{a.companies?.name || "—"}</TableCell>
                <TableCell>{a.contacts ? `${a.contacts.first_name} ${a.contacts.last_name}` : "—"}</TableCell>
                <TableCell>{a.occurred_at ? new Date(a.occurred_at).toLocaleString() : "—"}</TableCell>
                <TableCell><Badge className={priorityColor(a.priority)}>{a.priority}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
