import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, Search, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const priorityColor = (p: string | null) => {
  switch (p) {
    case "high": return "bg-destructive/10 text-destructive border-destructive/20";
    case "medium": return "bg-warning/10 text-warning border-warning/20";
    case "low": return "bg-muted text-muted-foreground border-border";
    default: return "bg-secondary text-secondary-foreground border-border";
  }
};

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
    mutationFn: async (company: {
      name: string; company_type: string; website: string; linkedin_url: string;
      phone: string; city: string; postal_code: string; notes: string; priority: string; status: string;
    }) => {
      const { error } = await supabase.from("companies").insert({
        ...company,
        company_type: company.company_type || null,
        website: company.website || null,
        linkedin_url: company.linkedin_url || null,
        phone: company.phone || null,
        postal_code: company.postal_code || null,
        notes: company.notes || null,
        owner_id: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Empresa creada" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = companies.filter((c: any) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-sm text-muted-foreground mt-1">{companies.length} cuentas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Añadir Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nueva Empresa</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMutation.mutate({
                name: fd.get("name") as string,
                company_type: fd.get("company_type") as string,
                website: fd.get("website") as string,
                linkedin_url: fd.get("linkedin_url") as string,
                phone: fd.get("phone") as string,
                city: fd.get("city") as string,
                postal_code: fd.get("postal_code") as string,
                notes: fd.get("notes") as string,
                priority: fd.get("priority") as string || "medium",
                status: fd.get("status") as string || "prospect",
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
                <div className="space-y-2"><Label>Nombre *</Label><Input name="name" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Tipo</Label><Input name="company_type" placeholder="Cliente, Prospect..." /></div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="prospect">Prospect</option>
                    <option value="active">Activo</option>
                    <option value="dormant">Dormant</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Sitio web</Label><Input name="website" /></div>
                <div className="space-y-2"><Label>LinkedIn</Label><Input name="linkedin_url" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Teléfono</Label><Input name="phone" /></div>
                <div className="space-y-2"><Label>Ciudad</Label><Input name="city" /></div>
                <div className="space-y-2"><Label>Código Postal</Label><Input name="postal_code" /></div>
              </div>
              <div className="space-y-2"><Label>Notas</Label><Textarea name="notes" rows={2} /></div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creando..." : "Crear Empresa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar empresas..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="dormant">Dormant</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron empresas</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Prioridad</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Comercial asignado</TableHead>
                <TableHead>Sitio web</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Código Postal</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c: any) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/30" onClick={() => window.location.href = `/companies/${c.id}`}>
                  <TableCell>
                    <Badge variant="outline" className={`${priorityColor(c.priority)} capitalize text-[10px]`}>
                      {c.priority === "high" ? "Alta" : c.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/companies/${c.id}`} className="hover:text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.company_type || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.owner_id ? "Asignado" : "—"}</TableCell>
                  <TableCell>
                    {c.website ? (
                      <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="h-3 w-3" /> Web
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {c.linkedin_url ? (
                      <a href={c.linkedin_url.startsWith("http") ? c.linkedin_url : `https://${c.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm" onClick={(e) => e.stopPropagation()}>
                        LinkedIn
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                  <TableCell className="text-sm">{c.city || "—"}</TableCell>
                  <TableCell className="text-sm">{c.postal_code || "—"}</TableCell>
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
