import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DoctorHit = {
  place_id: string;
  name: string;
  specialization?: string;
  address?: string;
  phone?: string;
  lat: number;
  lng: number;
};

// Free, no-key search using OpenStreetMap Nominatim + Overpass.
// Searches healthcare facilities (doctors, clinics, hospitals) near a place name + specialization.
export const searchDoctors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { location: string; specialization?: string }) => {
    if (!input?.location || input.location.trim().length < 2) throw new Error("Location required");
    return {
      location: input.location.trim().slice(0, 120),
      specialization: (input.specialization ?? "").trim().slice(0, 80),
    };
  })
  .handler(async ({ data }) => {
    // 1) Geocode the location
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(data.location)}`,
      { headers: { "User-Agent": "Prescripto-AI/1.0" } }
    );
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geo = (await geoRes.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!geo.length) return { center: null, results: [] as DoctorHit[] };
    const lat = parseFloat(geo[0].lat);
    const lng = parseFloat(geo[0].lon);

    // 2) Overpass: amenities related to healthcare within ~5km
    const radius = 5000;
    const specFilter = data.specialization
      ? `["healthcare:speciality"~"${data.specialization}",i]`
      : "";
    const query = `[out:json][timeout:25];
(
  node["amenity"~"doctors|clinic|hospital"]${specFilter}(around:${radius},${lat},${lng});
  node["healthcare"~"doctor|clinic|hospital"]${specFilter}(around:${radius},${lat},${lng});
);
out body 30;`;
    const opRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query),
    });
    if (!opRes.ok) throw new Error("Doctor search failed");
    const op = (await opRes.json()) as { elements: Array<{ id: number; lat: number; lon: number; tags?: Record<string, string> }> };

    const results: DoctorHit[] = (op.elements ?? [])
      .filter((e) => e.tags?.name)
      .map((e) => {
        const t = e.tags ?? {};
        const addr = [t["addr:housenumber"], t["addr:street"], t["addr:city"]].filter(Boolean).join(" ");
        return {
          place_id: String(e.id),
          name: t.name!,
          specialization: t["healthcare:speciality"] || t.healthcare || t.amenity,
          address: addr || t["addr:full"] || undefined,
          phone: t.phone || t["contact:phone"],
          lat: e.lat,
          lng: e.lon,
        };
      })
      .slice(0, 30);

    return { center: { lat, lng, name: geo[0].display_name }, results };
  });

export const saveDoctor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: DoctorHit) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_doctors").insert({
      user_id: context.userId,
      place_id: data.place_id,
      name: data.name,
      specialization: data.specialization,
      address: data.address,
      phone: data.phone,
      lat: data.lat,
      lng: data.lng,
      data: data as never,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });