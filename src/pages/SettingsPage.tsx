import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Edit2, Loader2, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Lead Sources
  const { data: leadSources, isLoading: isLoadingLeadSources } = useQuery({
    queryKey: ["lead_sources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lead_sources").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createLeadSource = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from("lead_sources").insert([{ name }]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead_sources"] });
      toast({ title: "Lead source created" });
    },
    onError: (error) => {
      toast({ title: "Error creating lead source", description: error.message, variant: "destructive" });
    },
  });

  const deleteLeadSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lead_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead_sources"] });
      toast({ title: "Lead source deleted" });
    },
    onError: (error) => {
      toast({ title: "Error deleting lead source", description: error.message, variant: "destructive" });
    },
  });

  // Tags
  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createTag = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data, error } = await supabase.from("tags").insert([{ name, color }]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({ title: "Tag created" });
    },
    onError: (error) => {
      toast({ title: "Error creating tag", description: error.message, variant: "destructive" });
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({ title: "Tag deleted" });
    },
    onError: (error) => {
      toast({ title: "Error deleting tag", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Application settings and configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="lead-sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
              <CardDescription>Manage your application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appearance</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Button variant="outline" size="icon" onClick={toggleDarkMode}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-sources">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Lead Sources</CardTitle>
                <CardDescription>Manage the sources of your leads</CardDescription>
              </div>
              <AddLeadSourceDialog onSubmit={(name) => createLeadSource.mutate(name)} />
            </CardHeader>
            <CardContent>
              {isLoadingLeadSources ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadSources?.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteLeadSource.mutate(source.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {leadSources?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                          No lead sources found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Tags</CardTitle>
                <CardDescription>Manage tags for companies, contacts, and opportunities</CardDescription>
              </div>
              <AddTagDialog onSubmit={(tag) => createTag.mutate(tag)} />
            </CardHeader>
            <CardContent>
              {isLoadingTags ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags?.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: tag.color || "#e2e8f0", color: "#1e293b" }}
                          >
                            {tag.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{tag.color || "None"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteTag.mutate(tag.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tags?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No tags found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddLeadSourceDialog({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name);
    setName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Lead Source</DialogTitle>
            <DialogDescription>Create a new source for tracking where leads come from.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LinkedIn, Referral, Website"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Source</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddTagDialog({ onSubmit }: { onSubmit: (tag: { name: string; color: string }) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, color });
    setName("");
    setColor("#3b82f6");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogDescription>Create a new tag to categorize your data.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VIP, Hot Lead, High Priority"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="tag-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Tag</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
