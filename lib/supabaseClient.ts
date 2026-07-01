import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SopRun = {
  id: string;
  created_at: string;
  process: string;
  domain: string | null;
  mode: string | null;
  verdict: string | null;
  sop: { process: string; steps: Step[] } | null;
  graph_findings: any;
  node_count: number | null;
  rel_count: number | null;
};
export type Step = {
  id: string; action: string; role?: string; systems?: string[];
  controls?: { name: string; regulation?: string; mandatory?: boolean }[];
};
