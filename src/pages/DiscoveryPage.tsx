import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Upload, FileText, Brain, Star, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = (score / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-destructive"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transcriptText, setTranscriptText] = useState("");
  const [selectedOppId, setSelectedOppId] = useState("");

  const { data: companies = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["companies-lookup"],
    queryFn: () => dataService.getAll<{ name: string }>("companies"),
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities-list"],
    queryFn: async () => {
      const data = await dataService.getAll<{ name: string; company_id: string }>("opportunities");
      return (data || []).map((o) => ({
        ...o,
        companies: { name: companies.find((c) => c.id === o.company_id)?.name || "Unknown Company" }
      })).sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: companies.length > 0,
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ["discovery-analyses"],
    queryFn: async () => {
      const data = await dataService.getAll<{ transcript_id: string; opportunity_id: string; created_at: string }>("discovery_analyses");
      return (data || []).map((a) => {
        const opp = opportunities.find((o) => o.id === a.opportunity_id);
        return {
          ...a,
          opportunities: opp ? { name: opp.name, companies: opp.companies } : null
        };
      }).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    },
    enabled: opportunities.length > 0,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Save transcript
      const transcript = await dataService.create("transcripts", {
        transcript_text: transcriptText,
        opportunity_id: selectedOppId || null,
        source_type: "paste",
      });

      // Create a placeholder analysis
      await dataService.create("discovery_analyses", {
        transcript_id: transcript.id,
        opportunity_id: selectedOppId || null,
        summary: "Analysis pending — use the AI analysis edge function to generate scores.",
        score_total: 0,
        score_pain: 0,
        score_impact: 0,
        score_urgency: 0,
        score_stakeholder: 0,
        score_next_step: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery-analyses"] });
      toast({ title: "Transcript saved", description: "Analysis can be triggered from the opportunity detail." });
      setTranscriptText("");
      setSelectedOppId("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Discovery Lab</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze sales conversations and improve discovery quality</p>
      </div>

      {/* Scoring Rubric */}
      <Card className="shadow-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> Discovery Quality Rubric (0-100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { label: "Pain Identified", desc: "Did the prospect admit a specific cost?", pts: "20pts" },
              { label: "Impact Quantified", desc: "Is the value of solving it measured?", pts: "20pts" },
              { label: "Urgency/Timeline", desc: "Is there a compelling event?", pts: "20pts" },
              { label: "Stakeholders", desc: "Is the economic buyer identified?", pts: "20pts" },
              { label: "Next Step Defined", desc: "Is a follow-up meeting set?", pts: "20pts" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground">{item.desc}</p>
                <Badge variant="secondary" className="text-[10px]">{item.pts}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Transcript */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Submit Transcript for Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Link to Opportunity (optional)</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              <option value="">None</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}{o.companies ? ` (${o.companies.name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Paste Transcript or Meeting Notes *</Label>
            <Textarea
              rows={8}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste your call transcript, meeting notes, or conversation summary here..."
            />
          </div>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!transcriptText.trim() || submitMutation.isPending}
          >
            {submitMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Upload className="h-4 w-4 mr-2" />Save & Analyze</>}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Analyses */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Previous Analyses</h2>
        {analyses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No analyses yet. Submit a transcript above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((a) => (
              <Card key={a.id} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {(a.opportunities as { name: string }).name && <p className="text-sm font-medium">{(a.opportunities as { name: string }).name}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at!).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-semibold tabular-nums ${(a.score_total || 0) >= 70 ? "text-success" : (a.score_total || 0) >= 40 ? "text-warning" : "text-destructive"}`}>
                        {a.score_total || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">/100</p>
                    </div>
                  </div>
                  {a.score_total !== null && a.score_total > 0 && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <ScoreBar label="Pain" score={a.score_pain || 0} max={20} />
                      <ScoreBar label="Impact" score={a.score_impact || 0} max={20} />
                      <ScoreBar label="Urgency" score={a.score_urgency || 0} max={20} />
                      <ScoreBar label="Stakeholders" score={a.score_stakeholder || 0} max={20} />
                      <ScoreBar label="Next Step" score={a.score_next_step || 0} max={20} />
                    </div>
                  )}
                  {a.summary && <p className="text-sm text-muted-foreground">{a.summary}</p>}
                  {a.coaching_feedback && (
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-xs font-medium text-primary mb-1">Coaching Feedback</p>
                      <p className="text-xs text-muted-foreground">{a.coaching_feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
