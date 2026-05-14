import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, Search, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type AppRole = "admin" | "manager" | "salesperson";

export default function AdminUsersPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/");
    }
  }, [role, navigate]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");
      
      if (pError) throw pError;

      const { data: roles, error: rError } = await supabase
        .from("user_roles")
        .select("*");
      
      if (rError) throw rError;

      return profiles.map(p => {
        const userRole = roles.find(r => r.user_id === p.user_id);
        return {
          ...p,
          role: userRole?.role || 'salesperson',
          role_id: userRole?.id
        };
      });
    },
    enabled: role === "admin",
  });

  const updateActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Estado de usuario actualizado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ user_id, role, role_id }: { user_id: string, role: AppRole, role_id?: string }) => {
      if (role_id) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("id", role_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Rol de usuario actualizado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  interface UserWithRole {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    role: AppRole;
    role_id?: string;
    is_active?: boolean;
    updated_at?: string;
  }

  const filtered = users.filter((u: UserWithRole) => 
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'admin': return <ShieldCheck className="h-4 w-4 text-primary" />;
      case 'manager': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <ShieldAlert className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">Administra los usuarios del sistema y sus permisos.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nombre o email..." 
          className="pl-9" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando usuarios...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Última actualización</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u: UserWithRole) => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{u.full_name || "Sin nombre"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email || "Sin email"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(u.role)}
                      <Select 
                        value={u.role} 
                        onValueChange={(newRole: AppRole) => updateRoleMutation.mutate({ 
                          user_id: u.user_id, 
                          role: newRole,
                          role_id: u.role_id
                        })}
                      >
                        <SelectTrigger className="h-8 w-32 border-none bg-transparent hover:bg-muted/50 focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salesperson">Comercial</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={u.is_active ?? true} 
                        onCheckedChange={(checked) => updateActiveMutation.mutate({ 
                          id: u.id, 
                          is_active: checked 
                        })} 
                      />
                      <span className="text-xs text-muted-foreground">
                        {u.is_active ?? true ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {u.updated_at ? new Date(u.updated_at).toLocaleDateString() : '—'}
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
