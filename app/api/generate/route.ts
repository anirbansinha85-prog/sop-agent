import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { process, domain, raw } = await req.json();
    const client = await Client.connect("AnirbanSinha/process-sop-swarm");
    const res = await client.predict("/run_api", [
      process || "Untitled",
      domain || "",
      raw || "",
      "Live (LLM authors it)",
      false,
    ]);
    const data = (res.data as any[])[0];
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "The agent call failed on the server." },
      { status: 500 }
    );
  }
}
