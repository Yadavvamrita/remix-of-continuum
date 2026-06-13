import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway } from "./ai-gateway.server";

export type MedicineSummary = {
  name: string;
  generic_name?: string;
  uses: string;
  dosage: string;
  side_effects: string[];
  warnings: string[];
  interactions: string[];
  alternatives: string[];
  disclaimer: string;
};

function extractJson(text: string): MedicineSummary | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned) as MedicineSummary;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]) as MedicineSummary; } catch { /* ignore */ } }
    return null;
  }
}

export const searchMedicine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { query: string }) => {
    if (!input?.query || typeof input.query !== "string" || input.query.trim().length < 2) {
      throw new Error("Search query is required");
    }
    return { query: input.query.trim().slice(0, 120) };
  })
  .handler(async ({ data }) => {
    // Try OpenFDA first for grounding (best-effort, no key)
    let fdaContext = "";
    try {
      const fdaRes = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22${encodeURIComponent(data.query)}%22+OR+openfda.generic_name:%22${encodeURIComponent(data.query)}%22&limit=1`
      );
      if (fdaRes.ok) {
        const j = await fdaRes.json();
        const r = j.results?.[0];
        if (r) {
          fdaContext = `OpenFDA label excerpt:\n- Brand: ${r.openfda?.brand_name?.join(", ") || "n/a"}\n- Generic: ${r.openfda?.generic_name?.join(", ") || "n/a"}\n- Indications: ${(r.indications_and_usage?.[0] || "").slice(0, 600)}\n- Warnings: ${(r.warnings?.[0] || "").slice(0, 400)}`;
        }
      }
    } catch { /* ignore */ }

    const completion = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a clinical pharmacist explaining medicines to patients in plain English. Return STRICT JSON only with this schema:
{
  "name": string,
  "generic_name": string,
  "uses": string,                 // 1-2 sentence patient-friendly purpose
  "dosage": string,               // typical adult dosage, 1 line
  "side_effects": string[],       // 3-6 common ones
  "warnings": string[],           // 2-5 important warnings
  "interactions": string[],       // 2-5 notable drug/food interactions
  "alternatives": string[],       // 2-4 commonly used alternatives
  "disclaimer": string
}
Use the OpenFDA context if provided. If the medicine is unknown, set name to the query and fill best-effort fields with "Unknown" or empty arrays.`,
        },
        {
          role: "user",
          content: `Medicine: ${data.query}\n\n${fdaContext}`,
        },
      ],
    });
    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(raw);
    if (!parsed) throw new Error("Could not parse medicine information");
    return parsed;
  });

export const saveMedicine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; generic_name?: string; data: unknown }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_medicines").insert({
      user_id: context.userId,
      name: data.name,
      generic_name: data.generic_name ?? null,
      data: data.data as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSavedMedicines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_medicines")
      .select("id,name,generic_name,data,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });