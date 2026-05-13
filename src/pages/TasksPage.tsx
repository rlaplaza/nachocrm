import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckSquare, Plus, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", showCompleted],
    queryFn: async () => {
      const tasksData = await dataService.getAll<{ status: string; company_id?: string; opportunity_id?: string; title: string; due_at?: string; priority: string }>("tasks");
      const companiesData = await dataService.getAll<{ id: string; name: string }>("companies");
      const opportunitiesData = await dataService.getAll<{ id: string; name: string }>("opportunities");

      let q = tasksData.map((task) => ({
        ...task,
        companies: companiesData.find((comp) => comp.id === task.company_id),
        opportunities: opportunitiesData.find((opp) => opp.id === task.opportunity_id)
      }));

      if (!showCompleted) q = q.filter((t) => t.status === "pending");
      
      return q || [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await dataService.update("tasks", id, {
        status: completed ? "completed" : "pending",
        completed_at: completed ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (task: { title: string; description: string; priority: string; due_at: string }) => {
      await dataService.create("tasks", { ...task, owner_id: user!.id, due_at: task.due_at || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task created" });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const now = new Date();

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">{tasks.filter(t => t.status === "pending").length} pending</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox checked={showCompleted} onCheckedChange={(c) => setShowCompleted(!!c)} />
            Show completed
          </label>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMutation.mutate({
                  title: fd.get("title") as string,
                  description: fd.get("description") as string,
                  priority: fd.get("priority") as string || "medium",
                  due_at: fd.get("due_at") as string,
                });
              }} className="space-y-4">
                <div className="space-y-2"><Label>Title *</Label><Input name="title" required /></div>
                <div className="space-y-2"><Label>Description</Label><Input name="description" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select name="priority" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="low">Low</option>
                      <option value="medium" selected>Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Due Date</Label><Input name="due_at" type="datetime-local" /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>Create Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue = task.status === "pending" && task.due_at && new Date(task.due_at) < now;
            const isCompleted = task.status === "completed";
            return (
              <Card key={task.id} className={`shadow-card ${isOverdue ? "border-destructive/30" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: task.id, completed: !!checked })}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {task.companies && <span>{task.companies.name}</span>}
                      {task.opportunities && <span>· {task.opportunities.name}</span>}
                      {task.due_at && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                          <Clock className="h-3 w-3" />{new Date(task.due_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={task.priority === "high" ? "destructive" : task.priority === "low" ? "secondary" : "outline"} className="text-[10px] capitalize">
                    {task.priority}
                  </Badge>
                  {isOverdue && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
