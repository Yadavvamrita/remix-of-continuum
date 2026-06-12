import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Stethoscope, Upload, Search, MapPin, Pill, ShieldCheck, Sparkles,
  ScanLine, Brain, FileText, ChevronDown, Mail, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Prescripto AI — Understand your prescriptions, instantly" },
      { name: "description", content: "AI-powered prescription analysis, universal medicine search, and doctor finder. Built for patients who want clarity." },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <MedicineIntelligence />
      <DoctorFinder />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight text-lg">Prescripto<span className="text-primary"> AI</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#medicines" className="hover:text-foreground transition">Medicines</a>
          <a href="#doctors" className="hover:text-foreground transition">Doctors</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium px-3 py-2 hover:text-primary transition">Sign in</Link>
          <Link to="/app" className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition">Get started</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-accent),_transparent_60%)] opacity-50" />
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> AI-powered healthcare clarity
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05]">
          Understand your prescription <span className="text-primary">in plain English</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
          Upload a prescription, and Prescripto AI extracts the handwriting, explains each medicine, flags interactions, and helps you find the right doctor — instantly.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/app" className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition">
            <ScanLine className="w-4 h-4" /> Analyze Prescription
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link to="/app" className="inline-flex items-center gap-2 bg-card border border-border font-semibold px-6 py-3.5 rounded-xl hover:bg-accent/40 transition">
            <Search className="w-4 h-4" /> Search Medicines
          </Link>
          <Link to="/app" className="inline-flex items-center gap-2 bg-card border border-border font-semibold px-6 py-3.5 rounded-xl hover:bg-accent/40 transition">
            <MapPin className="w-4 h-4" /> Find Doctors
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Information only. Not a substitute for medical advice.
        </p>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: ScanLine, title: "Prescription OCR", desc: "Reads even messy doctor handwriting from photos and PDFs with multimodal AI." },
    { icon: Brain, title: "AI explanation", desc: "Each medicine explained in plain language — purpose, dosage, side effects, warnings." },
    { icon: Pill, title: "Drug intelligence", desc: "Backed by OpenFDA & RxNorm. Interactions, alternatives, and composition at a glance." },
    { icon: MapPin, title: "Doctor finder", desc: "Find verified doctors by name, city, or specialization with maps and ratings." },
    { icon: ShieldCheck, title: "Private by design", desc: "Your prescriptions are encrypted and only visible to you." },
    { icon: FileText, title: "Saved history", desc: "Every analysis kept in your account so you never lose track of a medication." },
  ];
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <SectionHeader eyebrow="Features" title="A complete healthcare companion" subtitle="Six capabilities working together to bring clarity to every prescription." />
      <div className="grid md:grid-cols-3 gap-5 mt-12">
        {items.map((f) => (
          <div key={f.title} className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition">
            <div className="w-10 h-10 rounded-lg bg-accent/60 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-primary" strokeWidth={2.25} />
            </div>
            <h3 className="font-semibold text-base">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", icon: Upload, title: "Upload", desc: "Drop a JPG, PNG, or PDF of your prescription." },
    { n: "02", icon: ScanLine, title: "Extract", desc: "OCR reads the handwritten text and structures it." },
    { n: "03", icon: Brain, title: "Analyze", desc: "AI identifies medicines, dosage, frequency, and warnings." },
    { n: "04", icon: FileText, title: "Understand", desc: "You get a patient-friendly summary you can act on." },
  ];
  return (
    <section id="how" className="bg-secondary/40 border-y border-border/60">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHeader eyebrow="How it works" title="From paper to plain English in seconds" subtitle="Four steps. Zero medical jargon." />
        <div className="grid md:grid-cols-4 gap-4 mt-12">
          {steps.map((s) => (
            <div key={s.n} className="p-6 rounded-2xl bg-card border border-border">
              <div className="text-xs font-mono text-primary font-bold">{s.n}</div>
              <s.icon className="w-6 h-6 text-foreground mt-3" strokeWidth={2} />
              <h3 className="font-semibold mt-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MedicineIntelligence() {
  return (
    <section id="medicines" className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeader eyebrow="Medicine intelligence" title="Search any medicine. Get the full picture." subtitle="Generic names, brand alternatives, uses, side effects, interactions, pregnancy warnings — all in one place." align="left" />
          <ul className="mt-6 space-y-3 text-sm">
            {["Dolo 650","Paracetamol","Azithromycin","Metformin","Amoxicillin"].map((m) => (
              <li key={m} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Search Amoxicillin…</span>
          </div>
          <div className="mt-5 space-y-3">
            <Row k="Generic" v="Amoxicillin" />
            <Row k="Uses" v="Bacterial infections" />
            <Row k="Dosage" v="500 mg, 3× daily" />
            <Row k="Side effects" v="Nausea, diarrhea, rash" />
            <Row k="Warnings" v="Avoid if allergic to penicillin" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm pb-3 border-b border-border last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}

function DoctorFinder() {
  return (
    <section id="doctors" className="bg-secondary/40 border-y border-border/60">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <SectionHeader eyebrow="Doctor finder" title="The right specialist, near you" subtitle="Search by name, city, or specialization. Maps, ratings, and contact info — all in one view." />
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {["Cardiologist in Delhi","Dermatologist in Noida","Pediatrician in Mumbai"].map((q) => (
            <div key={q} className="p-5 rounded-xl bg-card border border-border flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "Is Prescripto AI a substitute for a doctor?", a: "No. Prescripto AI helps you understand prescriptions, but it does not replace professional medical advice, diagnosis, or treatment." },
    { q: "What file types can I upload?", a: "JPG, PNG, JPEG, and PDF. Clear photos work best for handwritten prescriptions." },
    { q: "Where does medicine information come from?", a: "We combine OpenFDA, RxNorm, and NIH medication APIs with AI-generated patient-friendly explanations." },
    { q: "Are my prescriptions private?", a: "Yes. Your files and analyses are stored securely and visible only to you." },
    { q: "Is it free to use?", a: "The core experience is free. Heavy usage may be metered to keep AI costs sustainable." },
  ];
  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
      <SectionHeader eyebrow="FAQ" title="Common questions" />
      <div className="mt-10 space-y-3">
        {qs.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left p-5 rounded-xl border border-border bg-card hover:bg-accent/30 transition">
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>}
    </button>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-secondary/40 border-y border-border/60">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <SectionHeader eyebrow="Contact" title="Talk to us" subtitle="Questions, partnerships, or feedback? We'd love to hear from you." />
        <a href="mailto:hello@prescripto.ai" className="inline-flex items-center gap-2 mt-6 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition">
          <Mail className="w-4 h-4" /> hello@prescripto.ai
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Prescripto AI</span>
        </div>
        <p>© {new Date().getFullYear()} Prescripto AI. For informational purposes only.</p>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, subtitle, align = "center" }: { eyebrow: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  const cls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`${cls} max-w-2xl`}>
      <div className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-3 text-base">{subtitle}</p>}
    </div>
  );
}

// avoid unused-import warning during phase 1
void useEffect;