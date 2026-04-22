import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Building2, CheckSquare, AlertTriangle, TrendingUp, Activity, Search } from "lucide-react";
import { Link } from "react-router-dom";

function StatCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; trend?: string;
}) {
  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {trend && <p className="mt-2 text-xs text-success">{trend}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, role } = useAuth();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-lookup"],
    queryFn: async () => {
      const data = await dataService.getAll("companies");
      return data || [];
    },
  });

  const getCompanyName = (companyId: string) => {
    return companies.find((c: any) => c.id === companyId)?.name || "Unknown Company";
  };

  const { data: opportunities = [] } = useQuery({
    queryKey: ["dashboard-opportunities"],
    queryFn: async () => {
      const data = await dataService.getAll("opportunities");
      return (data || []).map((o: any) => ({
        ...o,
        companies: { name: getCompanyName(o.company_id) }
      }));
    },
    enabled: companies.length > 0,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const data = await dataService.getWhere("tasks", "status", "==", "pending");
      return (data || [])
        .map((t: any) => ({
          ...t,
          companies: { name: getCompanyName(t.company_id) }
        }))
        .sort((a: any, b: any) => (a.due_at || "").localeCompare(b.due_at || ""))
        .slice(0, 10);
    },
    enabled: companies.length > 0,
  });

  const { data: staleOpps = [] } = useQuery({
    queryKey: ["dashboard-stale"],
    queryFn: async () => {
      const data = await dataService.getWhere("opportunities", "is_stale", "==", true);
      return (data || [])
        .map((o: any) => ({
          ...o,
          companies: { name: getCompanyName(o.company_id) }
        }))
        .slice(0, 10);
    },
    enabled: companies.length > 0,
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: async () => {
      const data = await dataService.getAll("activities");
      return (data || [])
        .map((a: any) => ({
          ...a,
          companies: { name: getCompanyName(a.company_id) }
        }))
        .sort((a: any, b: any) => (b.occurred_at || "").localeCompare(a.occurred_at || ""))
        .slice(0, 8);
    },
    enabled: companies.length > 0,
  });

  const totalPipeline = opportunities
    .filter((o) => !["closed_won", "closed_lost"].includes(o.stage))
    .reduce((sum, o) => sum + (Number(o.value) || 0), 0);

  const openOpps = opportunities.filter((o) => !["closed_won", "closed_lost"].includes(o.stage)).length;
  const noNextStep = opportunities.filter((o) => !o.next_step && !["closed_won", "closed_lost"].includes(o.stage)).length;
  const avgDiscovery = opportunities.length > 0
    ? Math.round(opportunities.reduce((sum, o) => sum + (o.discovery_score || 0), 0) / opportunities.length)
    : 0;
  const overdueTasks = tasks.filter((t) => t.due_at && new Date(t.due_at) < new Date()).length;

  const stageCount = (stage: string) => opportunities.filter((o) => o.stage === stage).length;

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {role === "salesperson" ? "Your pipeline overview" : "Team pipeline overview"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pipeline Value" value={`$${(totalPipeline / 1000).toFixed(0)}k`} icon={TrendingUp} />
        <StatCard title="Open Opportunities" value={openOpps} icon={Target} />
        <StatCard title="Overdue Tasks" value={overdueTasks} icon={CheckSquare} subtitle={overdueTasks > 0 ? "Action required" : "All clear"} />
        <StatCard title="Avg Discovery Score" value={`${avgDiscovery}/100`} icon={Search} />
      </div>

      {/* Alert: Missing Next Steps */}
      {noNextStep > 0 && (
        <Card className="border-warning/30 bg-warning/5 shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">{noNextStep} opportunit{noNextStep === 1 ? "y" : "ies"} missing a Next Step</p>
              <p className="text-xs text-muted-foreground">Define next actions to keep deals moving forward</p>
            </div>
            <Link to="/pipeline" className="ml-auto text-sm font-medium text-primary hover:underline">View Pipeline →</Link>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline by Stage */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["lead", "discovery", "proposal", "negotiation"] as const).map((stage) => {
              const count = stageCount(stage);
              const stageValue = opportunities
                .filter((o) => o.stage === stage)
                .reduce((sum, o) => sum + (Number(o.value) || 0), 0);
              return (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stage === "lead" ? "bg-muted-foreground" :
                      stage === "discovery" ? "bg-primary" :
                      stage === "proposal" ? "bg-warning" : "bg-[hsl(280,67%,55%)]"
                    }`} />
                    <span className="text-sm capitalize">{stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-muted-foreground">{count}</span>
                    <span className="text-sm tabular-nums font-medium">${(stageValue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No pending tasks</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => {
                  const isOverdue = task.due_at && new Date(task.due_at) < new Date();
                  return (
                    <div key={task.id} className="flex items-start gap-2 py-1.5">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isOverdue ? "bg-destructive" : "bg-primary"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.due_at ? new Date(task.due_at).toLocaleDateString() : "No due date"}
                          {task.companies && ` · ${(task.companies as any).name}`}
                        </p>
                      </div>
                      {isOverdue && <Badge variant="destructive" className="text-[10px] shrink-0">Overdue</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stale Deals */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stale Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            {staleOpps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No stale deals 🎉</p>
            ) : (
              <div className="space-y-2">
                {staleOpps.slice(0, 5).map((opp) => (
                  <div key={opp.id} className="flex items-start gap-2 py-1.5">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{opp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {opp.companies && (opp.companies as any).name} · ${Number(opp.value).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">{opp.stage.replace("_", " ")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-1.5">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{a.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.companies && (a.companies as any).name} ·{" "}
                      {a.occurred_at ? new Date(a.occurred_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize shrink-0">{a.activity_type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
