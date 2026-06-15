/* Gut & Joint Journal — backend Worker (Cloudflare).
   Holds the Anthropic API key and the family code as secrets — never in the app.
   Storage: Cloudflare D1 (SQLite). Every entry carries its author (Mother/Father). */

const RESET_CODE = "2707";
const MODEL = "claude-sonnet-4-6"; // claude-haiku-4-5 = cheaper, claude-opus-4-8 = deeper

const SYSTEM_PROMPT = `You are a careful assistant helping parents review at-home symptom-tracking data for a child with short bowel syndrome (a large part of the bowel was removed in infancy) who also has recurring joint pain. Entries are tagged Mother or Father.

Analyse ONLY the JSON data provided:
1. Summarise the period: gut-symptom trends (stool form/colour/smell/soiling), joint-pain trend, supplement/probiotic adherence. Note if Mother's and Father's observations differ.
2. Note same-day or next-day correlations (sugar vs pain, rough-gut days vs pain days, probiotic adherence vs pain, activity vs pain). State plainly when days are too few to trust.
3. Interpret any microbiome or faecal-calprotectin results in plain language.
4. Flag anything that warrants a doctor's attention.

Be balanced and honest. Distinguish correlation from cause. Remember benign night-time limb pain is common in children. Never give a diagnosis or treatment plan. End with 2-3 specific questions for a paediatric gastroenterologist or rheumatologist. Under 500 words. Begin by stating this is not medical advice.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Family-Token",
};
const json = (o, s=200) => new Response(JSON.stringify(o), { status:s, headers:{...CORS, "content-type":"application/json"} });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // ---- auth: shared family code ----
    if (!env.FAMILY_TOKEN) return json({ error:"server missing FAMILY_TOKEN secret" }, 500);
    if (request.headers.get("X-Family-Token") !== env.FAMILY_TOKEN) return json({ error:"unauthorised" }, 401);

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/,"") || "/";
    const db = env.DB;

    try {
      // ---------- AI ----------
      if (path === "/ai" && request.method === "POST") {
        if (!env.ANTHROPIC_API_KEY) return json({ error:"server missing ANTHROPIC_API_KEY secret" }, 500);
        const body = await request.json();
        const data = body && body.data;
        if (typeof data !== "string" || !data) return json({ error:"missing data" }, 400);
        if (data.length > 80000) return json({ error:"data too large" }, 413);
        const up = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{ "x-api-key":env.ANTHROPIC_API_KEY, "anthropic-version":"2023-06-01", "content-type":"application/json" },
          body: JSON.stringify({ model: env.MODEL||MODEL, max_tokens:1200, system:SYSTEM_PROMPT,
            messages:[{ role:"user", content:"Journal data (JSON):\n\n"+data }] })
        });
        if (!up.ok) return json({ error:"upstream", detail:(await up.text()).slice(0,400) }, 502);
        const out = await up.json();
        const text = (out.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
        return json({ analysis:text });
      }

      // ---------- read everything ----------
      if (path === "/data" && request.method === "GET") {
        const meta = {};
        const mres = await db.prepare("SELECT k,v FROM meta").all();
        (mres.results||[]).forEach(r => meta[r.k] = r.v);
        const ent = await db.prepare("SELECT date,section,author,payload,updated_at FROM entries ORDER BY date").all();
        const entries = (ent.results||[]).map(r => ({ date:r.date, section:r.section, author:r.author, payload:JSON.parse(r.payload||"{}"), updated_at:r.updated_at }));
        const lab = await db.prepare("SELECT id,date,calpro,text,author,created_at FROM labs ORDER BY date DESC").all();
        return json({ meta:{ startDate:meta.startDate||null, childCode:meta.childCode||"", spotify:meta.spotify||"" }, entries, labs:lab.results||[] });
      }

      // ---------- meta upsert ----------
      if (path === "/meta" && request.method === "PUT") {
        const b = await request.json();
        if (b.ensureStart) {
          const cur = await db.prepare("SELECT v FROM meta WHERE k='startDate'").first();
          if (!cur) await db.prepare("INSERT INTO meta (k,v) VALUES ('startDate',?)").bind(new Date().toISOString().slice(0,10)).run();
        }
        for (const k of ["childCode","spotify"]) {
          if (k in b) await db.prepare("INSERT INTO meta (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k, String(b[k]||"")).run();
        }
        const mres = await db.prepare("SELECT k,v FROM meta").all();
        const meta = {}; (mres.results||[]).forEach(r=>meta[r.k]=r.v);
        return json({ ok:true, meta });
      }

      // ---------- entry upsert (one row per date+section+author) ----------
      if (path === "/entry" && request.method === "PUT") {
        const b = await request.json();
        if (!b.date || !b.section || !b.author) return json({ error:"missing fields" }, 400);
        const now = new Date().toISOString();
        await db.prepare(
          `INSERT INTO entries (date,section,author,payload,updated_at) VALUES (?,?,?,?,?)
           ON CONFLICT(date,section,author) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at`
        ).bind(b.date, b.section, b.author, JSON.stringify(b.payload||{}), now).run();
        return json({ ok:true, updated_at:now });
      }

      // ---------- labs ----------
      if (path === "/lab" && request.method === "POST") {
        const b = await request.json();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        await db.prepare("INSERT INTO labs (id,date,calpro,text,author,created_at) VALUES (?,?,?,?,?,?)")
          .bind(id, b.date||"", b.calpro||"", b.text||"", b.author||"", now).run();
        return json({ id, date:b.date||"", calpro:b.calpro||"", text:b.text||"", author:b.author||"", created_at:now });
      }
      if (path === "/lab" && request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (id) await db.prepare("DELETE FROM labs WHERE id=?").bind(id).run();
        return json({ ok:true });
      }

      // ---------- reset (wipes the family database) ----------
      if (path === "/reset" && request.method === "POST") {
        const b = await request.json();
        if ((b && b.code) !== (env.RESET_CODE || RESET_CODE)) return json({ error:"wrong code" }, 403);
        await db.batch([
          db.prepare("DELETE FROM entries"),
          db.prepare("DELETE FROM labs"),
          db.prepare("DELETE FROM meta"),
        ]);
        return json({ ok:true });
      }

      return json({ error:"not found", path }, 404);
    } catch (e) {
      return json({ error:"server error", detail:String(e).slice(0,300) }, 500);
    }
  }
};
