import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import CompaniesPage from "@/pages/CompaniesPage";
import CompanyDetailPage from "@/pages/CompanyDetailPage";
import ContactsPage from "@/pages/ContactsPage";
import PipelinePage from "@/pages/PipelinePage";
import TasksPage from "@/pages/TasksPage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import DiscoveryPage from "@/pages/DiscoveryPage";
import { FilesPage, ImportPage, IntegrationsPage, SettingsPage, AdminUsersPage } from "@/pages/PlaceholderPages";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold tracking-tight">Forge CRM</div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/pipeline/:id" element={<div className="text-muted-foreground">Opportunity detail coming soon</div>} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
