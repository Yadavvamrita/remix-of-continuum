import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGateway } from "./ai-gateway.server";

type AnalyzeInput = { imageUrl: string; title?: string };

function safeJson(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch { /* ignore */ } }
    return null;
  }
}

export const analyzePrescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AnalyzeInput) => {
    if (!input?.imageUrl || typeof input.imageUrl !== "string") throw new Error("imageUrl required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const systemPrompt = `You are a careful clinical assistant. Read the prescription image (which may contain doctor handwriting) and return STRICT JSON only — no prose, no markdown fences. Schema:
{
  "ocr_text": string,                       // raw transcription of all visible text
  "patient": { "name"?: string, "age"?: string, "gender"?: string },
  "doctor": { "name"?: string, "clinic"?: string, "date"?: string },
  "medicines": [
    {
      "name": string,
      "generic_name"?: string,
      "dosage"?: string,
      "frequency"?: string,
      "duration"?: string,
      "purpose"?: string,
      "common_side_effects"?: string[],
      "warnings"?: string[]
    }
  ],
  "diagnosis_guess": string[],              // probable conditions being treated, plain language
  "patient_summary": string,                // 2-4 sentence plain-English summary for the patient
  "disclaimer": string                      // short safety disclaimer
}
If the image is not a prescription, return {"ocr_text":"","medicines":[],"diagnosis_guess":[],"patient_summary":"This does not appear to be a prescription.","disclaimer":"Information only — not medical advice."}.`;

    const completion = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this prescription and respond with JSON only." },
            { type: "image_url", image_url: { url: data.imageUrl } },
          ],
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const parsed = safeJson(raw) ?? { ocr_text: raw, medicines: [], diagnosis_guess: [], patient_summary: "Could not parse AI response.", disclaimer: "Information only — not medical advice." };

    const { data: row, error } = await supabase
      .from("prescriptions")
      .insert([{
        user_id: userId,
        title: data.title || "Prescription analysis",
        image_url: data.imageUrl,
        ocr_text: typeof parsed.ocr_text === "string" ? parsed.ocr_text : null,
        analysis: parsed as never,
        status: "completed",
      }])
      .select()
      .single();
    if (error) throw new Error(error.message);

    return { id: row.id as string, analysis: parsed as { [k: string]: {} } };
  });

export const listPrescriptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("prescriptions")
      .select("id,title,image_url,analysis,created_at,status")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deletePrescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("prescriptions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });