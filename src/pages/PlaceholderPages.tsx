import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Plug, Settings as SettingsIcon } from "lucide-react";

export function FilesPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
          <p className="text-sm text-muted-foreground mt-1">Documents, proposals, and attachments</p>
        </div>
        <Button size="sm"><Upload className="h-4 w-4 mr-1" /> Upload File</Button>
      </div>
      <div className="text-center py-16 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>File management coming soon.</p>
        <p className="text-xs mt-1">Upload documents, proposals, and recordings to link them to accounts and opportunities.</p>
      </div>
    </div>
  );
}

export function ImportPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Import companies, contacts, and opportunities from CSV/Excel</p>
      </div>
      <div className="text-center py-16 text-muted-foreground">
        <Upload className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>CSV/Excel import flow coming soon.</p>
        <p className="text-xs mt-1">Upload a file, map columns, preview, and import.</p>
      </div>
    </div>
  );
}

export function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect external services</p>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Microsoft 365 / Outlook</p>
            <p className="text-sm text-muted-foreground">Sync emails, calendar, and contacts via Microsoft Graph</p>
          </div>
          <Badge variant="outline">Not Connected</Badge>
          <Button variant="outline" size="sm">Configure</Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Microsoft Graph integration settings and OAuth connection flow will be available in a future release. 
        The data model and sync architecture are ready.
      </p>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Application settings and configuration</p>
      </div>
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Configuration options for stale thresholds, scoring weights, and team management will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminUsersPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage users and roles (admin only)</p>
      </div>
      <div className="text-center py-16 text-muted-foreground">
        <SettingsIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>User management panel coming soon.</p>
      </div>
    </div>
  );
}
