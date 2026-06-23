import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Loader2, FileText, AlertTriangle, Pill, Stethoscope, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { analyzePrescription } from "@/lib/prescriptions.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/analyze")({
  component: AnalyzePage,
  head: () => ({
    meta: [
      { title: "Analyze prescription — Prescripto AI" },
      { name: "description", content: "Upload a prescription photo and let AI extract handwriting, explain each medicine, and flag interactions in seconds." },
      { property: "og:title", content: "Analyze prescription — Prescripto AI" },
      { property: "og:description", content: "Upload a prescription photo and let AI extract handwriting, explain each medicine, and flag interactions in seconds." },
      { property: "og:url", content: "https://prescriptoo-ai.lovable.app/analyze" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://prescriptoo-ai.lovable.app/analyze" }],
  }),
});

type Analysis = {
  ocr_text?: string;
  medicines?: Array<{ name: string; generic_name?: string; dosage?: string; frequency?: string; duration?: string; purpose?: string; common_side_effects?: string[]; warnings?: string[] }>;
  diagnosis_guess?: string[];
  patient_summary?: string;
  disclaimer?: string;
};

function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const analyze = useServerFn(analyzePrescription);

  const onPick = (f: File | null) => {
    setFile(f);
    setResult(null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Please sign in again.");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("prescriptions").upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sigErr } = await supabase.storage.from("prescriptions").createSignedUrl(path, 60 * 60);
      if (sigErr || !signed?.signedUrl) throw sigErr ?? new Error("Could not get signed URL");
      const out = await analyze({ data: { imageUrl: signed.signedUrl, title: file.name } });
      setResult(out.analysis as Analysis);
      toast.success("Analysis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to analyze");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Analyze prescription</h1>
      <p className="text-muted-foreground mt-1.5">Upload a photo of your prescription — AI will extract handwriting and explain each medicine.</p>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="sr-only">Upload prescription</h2>
          <label className="block">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-accent/30 transition">
              {preview ? (
                <img src={preview} alt="prescription" className="max-h-72 mx-auto rounded-lg" />
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-sm font-medium">Click to upload</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG up to ~10MB</div>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
            </div>
          </label>
          <button
            disabled={!file || busy}
            onClick={onSubmit}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-3 rounded-xl disabled:opacity-50 hover:opacity-90 transition"
          >
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Stethoscope className="w-4 h-4" /> Analyze with AI</>}
          </button>
          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Information only. Not a substitute for medical advice.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 min-h-[320px]">
          {!result && !busy && (
            <div className="text-sm text-muted-foreground flex flex-col items-center justify-center h-full text-center gap-2 py-12">
              <FileText className="w-8 h-8" />
              <div>Your AI summary will appear here.</div>
            </div>
          )}
          {busy && (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground py-12">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Reading prescription…
            </div>
          )}
          {result && (
            <div className="space-y-5">
              {result.patient_summary && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Summary</h3>
                  <p className="text-sm leading-relaxed">{result.patient_summary}</p>
                </section>
              )}
              {!!result.diagnosis_guess?.length && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Likely conditions</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.diagnosis_guess.map((d, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-accent/60">{d}</span>
                    ))}
                  </div>
                </section>
              )}
              {!!result.medicines?.length && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Medicines</h3>
                  <div className="space-y-3">
                    {result.medicines.map((m, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{m.name}</span>
                          {m.generic_name && <span className="text-xs text-muted-foreground">({m.generic_name})</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                          {m.dosage && <div><b className="text-foreground">Dose:</b> {m.dosage}</div>}
                          {m.frequency && <div><b className="text-foreground">Frequency:</b> {m.frequency}</div>}
                          {m.duration && <div><b className="text-foreground">Duration:</b> {m.duration}</div>}
                          {m.purpose && <div className="col-span-2"><b className="text-foreground">Purpose:</b> {m.purpose}</div>}
                        </div>
                        {!!m.warnings?.length && (
                          <div className="text-xs mt-2 text-amber-700 dark:text-amber-400">
                            ⚠ {m.warnings.join(" • ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {result.ocr_text && (
                <details className="text-sm">
                  <summary className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">Raw OCR text</summary>
                  <pre className="text-xs whitespace-pre-wrap mt-2 p-3 bg-secondary/40 rounded-lg">{result.ocr_text}</pre>
                </details>
              )}
              {result.disclaimer && <p className="text-xs text-muted-foreground italic">{result.disclaimer}</p>}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}