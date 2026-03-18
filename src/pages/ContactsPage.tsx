import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search } from "lucide-react";
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

export default function ContactsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*, companies(name)").order("last_name");
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
    mutationFn: async (contact: {
      first_name: string; last_name: string; contact_type: string; email: string;
      phone: string; title: string; company_id: string; linkedin_url: string;
      country: string; notes: string; priority: string;
    }) => {
      const { error } = await supabase.from("contacts").insert({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email || null,
        phone: contact.phone || null,
        title: contact.title || null,
        company_id: contact.company_id || null,
        linkedin_url: contact.linkedin_url || null,
        owner_id: user!.id,
        contact_type: contact.contact_type || null,
        country: contact.country || null,
        notes: contact.notes || null,
        priority: contact.priority || "medium",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contacto creado" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = contacts.filter((c: any) =>
    `${c.first_name} ${c.last_name} ${c.email || ""} ${c.title || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contactos</h1>
          <p className="text-sm text-muted-foreground mt-1">{contacts.length} contactos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Añadir Contacto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Contacto</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                first_name: fd.get("first_name") as string,
                last_name: fd.get("last_name") as string,
                contact_type: fd.get("contact_type") as string,
                email: fd.get("email") as string,
                phone: fd.get("phone") as string,
                title: fd.get("title") as string,
                company_id: fd.get("company_id") as string,
                linkedin_url: fd.get("linkedin_url") as string,
                country: fd.get("country") as string,
                notes: fd.get("notes") as string,
                priority: fd.get("priority") as string || "medium",
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
                <div className="space-y-2"><Label>Tipo</Label><Input name="contact_type" placeholder="Cliente, Lead..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nombre *</Label><Input name="first_name" required /></div>
                <div className="space-y-2"><Label>Apellido *</Label><Input name="last_name" required /></div>
              </div>
              <div className="space-y-2">
                <Label>Organización</Label>
                <select name="company_id" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Sin organización</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Posición</Label><Input name="title" /></div>
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>LinkedIn</Label><Input name="linkedin_url" /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input name="phone" /></div>
              </div>
              <div className="space-y-2"><Label>País</Label><Input name="country" /></div>
              <div className="space-y-2"><Label>Notas</Label><Textarea name="notes" rows={2} /></div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>Crear Contacto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contactos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron contactos</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Prioridad</TableHead>
                <TableHead>Nombre completo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Comercial asignado</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge variant="outline" className={`${priorityColor(c.priority)} capitalize text-[10px]`}>
                      {c.priority === "high" ? "Alta" : c.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.contact_type || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.owner_id ? "Asignado" : "—"}</TableCell>
                  <TableCell className="text-sm">{c.companies ? (c.companies as any).name : "—"}</TableCell>
                  <TableCell className="text-sm">{c.title || "—"}</TableCell>
                  <TableCell>
                    {c.email ? (
                      <a href={`mailto:${c.email}`} className="text-primary hover:underline text-sm">{c.email}</a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {c.linkedin_url ? (
                      <a href={c.linkedin_url.startsWith("http") ? c.linkedin_url : `https://${c.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                        LinkedIn
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                  <TableCell className="text-sm">{c.country || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{c.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
