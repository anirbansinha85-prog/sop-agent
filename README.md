# SOP Library — v2 web app (Next.js + Supabase)

A polished product surface for the SOP Swarm: a beautiful library of every SOP the agent has generated,
read live from your Supabase `sop_runs` table. Dark, modern, searchable, with per-SOP detail + download.

This is the "real product" version of the grey Gradio demo. Spine first: the library. Auth (login) and
in-app generation are the next layers.

## What it does now
- Reads your live `sop_runs` (public read is already allowed by your row-level security).
- Grid of SOP cards: process, PASS/FAIL verdict, step count, graph size, date.
- Click a card → full SOP with each step's controls + regulations, and a Download (.md) button.
- Live search.

## Run / deploy

IMPORTANT: a Next.js app creates a large `node_modules`. Don't run it inside your OneDrive folder.
First copy this `webapp` folder somewhere outside OneDrive, e.g. `C:\Users\Rentorzo\sop-library`.

### Option A — Deploy to Vercel (free, recommended — cloud build, no local node_modules)
1. Put this folder in a GitHub repo (github.com/new → upload, or `git init` + push, same as you did for Hugging Face).
2. Go to vercel.com/new, import the repo.
3. In the Vercel project settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://prpenvvrxsbyscnvgygb.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sb_publishable_As7kKjI8KG79Ue4f657Ycg_isG848w0
4. Deploy. Vercel builds it and gives you a live URL. That's your v2.

### Option B — Run locally first
```powershell
# copy the folder out of OneDrive first, then:
cd C:\Users\Rentorzo\sop-library
copy .env.local.example .env.local
npm install
npm run dev
# open http://localhost:3000
```

## Next layers (when you're ready)
- **Auth (login)** — add the Supabase UI Library auth block:
  `npx shadcn@latest add https://supabase.com/ui/r/password-based-auth-nextjs.json`
  then gate the library so each user sees their own runs.
- **In-app generation** — expose the swarm as an API and add a "New SOP" form here, so the whole
  flow lives in one polished product instead of linking out to the Gradio demo.
