export type Step = {
  id: string; action: string; role?: string; systems?: string[];
  controls?: { name: string; regulation?: string; mandatory?: boolean }[];
};
export type AgentResult = {
  log: string;
  sop: { process: string; steps: Step[] } | null;
  governance: { verdict?: string; missing_mandatory_controls?: string[]; open_sme_questions?: number } | null;
  graph_findings: any;
  sme_questions: string[];
  cypher: string;
};

export async function runAgent(process: string, domain: string, raw: string): Promise<AgentResult> {
  const r = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ process, domain, raw }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || `Server returned ${r.status}`);
  }
  return r.json();
}
