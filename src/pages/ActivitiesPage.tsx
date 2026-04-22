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

export default function ActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const data = await dataService.getAll("companies");
      return (data || []).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
    },
  });

  const { data: contactsList = [] } = useQuery({
    queryKey: ["contacts-list"],
    queryFn: async () => {
      const data = await dataService.getAll("contacts");
      return (data || []).sort((a: any, b: any) => (a.last_name || "").localeCompare(b.last_name || ""));
    },
  });

  const { data: opportunitiesList = [] } = useQuery({
    queryKey: ["opportunities-list"],
    queryFn: async () => {
      const data = await dataService.getAll("opportunities");
      return (data || []).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
    },
  });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", typeFilter],
    queryFn: async () => {
      let data = await dataService.getAll("activities");
      if (typeFilter !== "all") {
        data = data.filter((a: any) => a.activity_type === typeFilter);
      }
      
      return (data || []).map((a: any) => ({
        ...a,
        companies: { name: companies.find((c: any) => c.id === a.company_id)?.name },
        contacts: { 
          first_name: contactsList.find((c: any) => c.id === a.contact_id)?.first_name,
          last_name: contactsList.find((c: any) => c.id === a.contact_id)?.last_name,
        },
        opportunities: { name: opportunitiesList.find((o: any) => o.id === a.opportunity_id)?.name }
      })).sort((a: any, b: any) => (b.occurred_at || "").localeCompare(a.occurred_at || ""));
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

  const filtered = activities.filter((a: any) =>
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
                    <option value="medium" selected>Media</option>
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
                    <option value="">Ninguna</option>
                    {opportunitiesList.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Contacto</Label>
                  <select name="contact_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Ninguno</option>
                    {contactsList.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <select name="company_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Ninguna</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Notas</Label><Textarea name="description" rows={3} /></div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Registrar Actividad</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar actividades..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="call">Llamadas</SelectItem>
            <SelectItem value="email">Emails</SelectItem>
            <SelectItem value="meeting">Reuniones</SelectItem>
            <SelectItem value="note">Notas</SelectItem>
            <SelectItem value="task">Tareas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron actividades</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Prioridad</TableHead>
                <TableHead>Interacción</TableHead>
                <TableHead>Comercial asignado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Oportunidad</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Fecha próximo contacto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Badge variant="outline" className={`${priorityColor(a.priority)} capitalize text-[10px]`}>
                      {a.priority === "high" ? "Alta" : a.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="secondary" className="text-[10px] capitalize mb-1">
                        {activityTypeLabel[a.activity_type] || a.activity_type}
                      </Badge>
                      <p className="text-sm font-medium">{a.subject}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.owner_id ? "Asignado" : "—"}</TableCell>
                  <TableCell className="text-sm">
                    {a.occurred_at ? new Date(a.occurred_at).toLocaleDateString("es-ES") : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.opportunities ? (a.opportunities as any).name : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.contacts ? `${(a.contacts as any).first_name} ${(a.contacts as any).last_name}` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {a.description || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.next_contact_at ? new Date(a.next_contact_at).toLocaleDateString("es-ES") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
