import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, MessageSquare, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INTEGRATIONS = [
  {
    id: "outlook",
    name: "Microsoft 365 / Outlook",
    description: "Sync emails, calendar, and contacts via Microsoft Graph API.",
    icon: Mail,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "gmail",
    name: "Google Workspace / Gmail",
    description: "Connect your Google account to track emails and meetings.",
    icon: Calendar,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_accounts")
        .select("*")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      // Per instructions: supabase.from('integration_accounts').upsert({ user_id: user.id, provider: 'outlook', status: 'connected' })
      const { error } = await supabase.from("integration_accounts").upsert({
        user_id: user?.id,
        provider: provider,
        status: "connected",
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Integration connected",
        description: "Your account has been successfully linked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const { error } = await supabase
        .from("integration_accounts")
        .update({ status: "disconnected" })
        .eq("user_id", user?.id)
        .eq("provider", provider);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Integration disconnected",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your external accounts to sync communications and calendar data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {INTEGRATIONS.map((integration) => {
          const account = integrations?.find((i) => i.provider === integration.id);
          const isConnected = account?.status === "connected";
          const isConnecting = connectMutation.isPending && connectMutation.variables === integration.id;

          return (
            <Card key={integration.id} className="shadow-card border-muted/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${integration.bgColor}`}>
                    <integration.icon className={`h-5 w-5 ${integration.color}`} />
                  </div>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Disconnected
                      </span>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{integration.name}</CardTitle>
                <div className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {integration.description}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 mt-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        Configure
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => disconnectMutation.mutate(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => connectMutation.mutate(integration.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Account"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex gap-3">
          <MessageSquare className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Background Syncing</p>
            <p className="text-sm text-blue-800/80 mt-1">
              Once connected, our system automatically scans for relevant customer interactions 
              and links them to your CRM contacts and companies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
