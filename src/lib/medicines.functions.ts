import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway } from "./ai-gateway.server";

export type MedicineKind = "specific" | "category" | "unknown";

export type MedicineSummary = {
  kind: MedicineKind;
  name: string;
  generic_name?: string;
  // Specific medicine fields
  uses?: string;
  dosage?: string;
  side_effects?: string[];
  warnings?: string[];
  interactions?: string[];
  alternatives?: string[];
  // Category / drug class fields
  category_label?: string; // "Drug Class" | "Medicine Category"
  description?: string;
  general_purpose?: string;
  examples?: string[];
  general_precautions?: string[];
  variability_note?: string;
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
          content: `You are a careful clinical pharmacist. First CLASSIFY the user's input as one of:
- "specific"  → a specific medicine / drug (e.g. Paracetamol, Amoxicillin, Dolo 650, Metformin)
- "category"  → a drug class, treatment group, or medicine category (e.g. Antibiotics, Pain Relievers, Antidepressants, Antihistamines, Steroids, Vaccines, Chemotherapy Drugs, Orphan Drugs)
- "unknown"   → reliable medicine information is unavailable

Return STRICT JSON ONLY, no prose, no markdown. Schema:
{
  "kind": "specific" | "category" | "unknown",
  "name": string,                      // canonical display name of the input
  "generic_name"?: string,             // ONLY if kind == "specific"
  // ---- specific only ----
  "uses"?: string,                     // 1-2 sentence patient-friendly purpose
  "dosage"?: string,                   // typical adult dosage, 1 line
  "side_effects"?: string[],           // 3-6 common ones
  "warnings"?: string[],               // 2-5 important warnings
  "interactions"?: string[],           // 2-5 notable drug/food interactions
  "alternatives"?: string[],           // 2-4 commonly used alternatives
  // ---- category only ----
  "category_label"?: "Drug Class" | "Medicine Category",
  "description"?: string,              // what this class/category is
  "general_purpose"?: string,          // what it is generally used for
  "examples"?: string[],               // 4-8 example medicines in this class
  "general_precautions"?: string[],    // 2-5 precautions that apply broadly
  "variability_note"?: string,         // MUST be: "Dosage, side effects, interactions, warnings, and alternatives vary depending on the specific medicine within this category."
  "disclaimer": string
}

STRICT RULES:
- Never treat a drug category as a specific medicine.
- For "category", do NOT include dosage, side_effects, interactions, warnings, or alternatives — those vary per medicine.
- For "specific", fill every specific field with reliable, well-known information. Use the OpenFDA context if provided.
- If reliable medicine-specific data is unavailable, return kind="unknown" with disclaimer "Information unavailable. Please consult a healthcare professional or official prescribing information." and omit all other optional fields.
- Never invent dosages, side effects, or interactions.`,
        },
        {
          role: "user",
          content: `Input: ${data.query}\n\n${fdaContext}`,
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