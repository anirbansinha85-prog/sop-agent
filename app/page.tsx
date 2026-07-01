"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase, SopRun } from "@/lib/supabaseClient";
import { runAgent, AgentResult, Step } from "@/lib/agentClient";

function stepsToMarkdown(process: string, steps: Step[]): string {
  const out = [`# SOP — ${process}`, ""];
  for (const st of steps || []) {
    out.push(`## ${st.id} · ${st.action}`);
    out.push(`- Role: ${st.role || "—"}`);
    out.push(`- Systems: ${(st.systems || []).join(", ") || "—"}`);
    const c = (st.controls || []).map(x => `${x.name}${x.regulation ? ` [${x.regulation}]` : ""}`).join("; ") || "—";
    out.push(`- Controls: ${c}`, "");
  }
  return out.join("\n");
}
function downloadMd(name: string, md: string) {
  const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
  const a = document.createElement("a"); a.href = url; a.download = `${name.replace(/\s+/g, "-").slice(0, 40)}-SOP.md`; a.click();
  URL.revokeObjectURL(url);
}
function Verdict({ v }: { v?: string | null }) {
  const pass = v === "PASS";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${pass ? "bg-teal/15 text-teal" : "bg-amber/15 text-amber"}`}>{pass ? "✓ PASS" : v ? "✕ FAIL" : "—"}</span>;
}
function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-3">
      {(steps || []).map(st => (
        <div key={st.id} className="rounded-lg border border-edge bg-ink/40 p-4">
          <div className="font-semibold text-white">{st.id} · {st.action}</div>
          <div className="mt-1 text-sm text-slate-400">Role: {st.role || "—"} · Systems: {(st.systems || []).join(", ") || "—"}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(st.controls || []).map((c, i) => (
              <span key={i} className="rounded-md bg-navy px-2 py-0.5 text-xs text-slate-200">{c.name}{c.regulation ? <span className="text-teal"> · {c.regulation}</span> : null}</span>
            ))}
            {(!st.controls || st.controls.length === 0) && <span className="text-xs text-amber">no control — gap</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Generate() {
  const [process, setProcess] = useState("UPI failed-transaction dispute and chargeback handling");
  const [domain, setDomain] = useState("payments");
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<AgentResult | null>(null);

  async function go() {
    setBusy(true); setErr(""); setResult(null);
    try { setResult(await runAgent(process, domain, raw)); }
    catch (e: any) { setErr(e?.message || "Something went wrong calling the agent."); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-edge bg-panel p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Describe the process</h2>
        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Process</label>
        <input value={process} onChange={e => setProcess(e.target.value)} className="mb-4 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-white outline-none focus:border-teal" />
        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Domain</label>
        <input value={domain} onChange={e => setDomain(e.target.value)} className="mb-4 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-white outline-none focus:border-teal" />
        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Messy notes (a few rough lines)</label>
        <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={7} placeholder="e.g. customer complains payment failed but debited; log complaint, pull RRN from NPCI; check auto-reversal, pay compensation if TAT breached; raise dispute via NPCI URCS; credit if resolved else escalate to RBI Ombudsman"
          className="mb-4 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-white outline-none focus:border-teal" />
        <button onClick={go} disabled={busy} className="w-full rounded-lg bg-teal px-4 py-2.5 font-semibold text-ink transition hover:opacity-90 disabled:opacity-50">
          {busy ? "The swarm is working…" : "Generate governed SOP"}
        </button>
        {busy && <p className="mt-3 text-xs text-slate-400">Research → capture → structure → enrich → govern. First run wakes the Space (~20s).</p>}
        {err && <p className="mt-3 rounded-lg bg-amber/10 p-3 text-sm text-amber">{err}</p>}
      </section>

      <section className="rounded-2xl border border-edge bg-panel p-6">
        {!result ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-center text-slate-500">
            <p>{busy ? "Generating…" : "Your governed SOP will appear here."}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{result.sop?.process || process}</h2>
              <Verdict v={result.governance?.verdict} />
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => result.sop && downloadMd(result.sop.process, stepsToMarkdown(result.sop.process, result.sop.steps))}
                className="rounded-lg bg-teal px-3 py-1.5 text-sm font-semibold text-ink hover:opacity-90">Download (.md)</button>
              {result.governance?.missing_mandatory_controls?.length ? (
                <span className="rounded-lg bg-amber/10 px-3 py-1.5 text-sm text-amber">Missing: {result.governance.missing_mandatory_controls.join(", ")}</span>
              ) : null}
            </div>
            <StepList steps={result.sop?.steps || []} />
            {result.sme_questions?.length ? (
              <div className="mt-4 rounded-lg border border-amber/30 bg-amber/5 p-4">
                <div className="mb-1 text-sm font-semibold text-amber">Questions for the SME</div>
                <ul className="list-disc pl-5 text-sm text-slate-300">{result.sme_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

function History() {
  const [runs, setRuns] = useState<SopRun[]>([]);
  const [sel, setSel] = useState<SopRun | null>(null);
  useEffect(() => { supabase.from("sop_runs").select("*").order("created_at", { ascending: false }).then(({ data }) => setRuns((data as SopRun[]) || [])); }, []);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {runs.map(r => (
          <button key={r.id} onClick={() => setSel(r)} className="group rounded-xl border border-edge bg-panel p-5 text-left transition hover:border-teal">
            <div className="mb-2 flex items-start justify-between gap-3"><h3 className="font-semibold text-white group-hover:text-teal">{r.process.trim()}</h3><Verdict v={r.verdict} /></div>
            <div className="text-xs text-slate-400">{r.sop?.steps?.length ?? 0} steps · {new Date(r.created_at).toLocaleDateString()}</div>
          </button>
        ))}
      </div>
      {sel && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4" onClick={() => setSel(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-edge bg-panel p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between"><h2 className="text-xl font-bold text-white">{sel.process.trim()}</h2><button onClick={() => setSel(null)} className="text-slate-400 hover:text-white">✕</button></div>
            <button onClick={() => sel.sop && downloadMd(sel.sop.process, stepsToMarkdown(sel.sop.process, sel.sop.steps as any))} className="mb-4 rounded-lg bg-teal px-3 py-1.5 text-sm font-semibold text-ink">Download (.md)</button>
            <StepList steps={(sel.sop?.steps as any) || []} />
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [tab, setTab] = useState<"generate" | "history">("generate");
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Process SOP Swarm</h1>
        <p className="mt-1 text-slate-400">Type a few messy lines. A swarm of AI agents returns a regulator-grounded, governed SOP.</p>
      </header>
      <div className="mb-6 flex gap-2">
        {(["generate", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? "bg-teal text-ink" : "border border-edge text-slate-300 hover:text-white"}`}>
            {t === "generate" ? "Generate" : "History"}
          </button>
        ))}
      </div>
      {tab === "generate" ? <Generate /> : <History />}
    </main>
  );
}
