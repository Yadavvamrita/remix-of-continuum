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
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  google_maps_uri?: string;
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

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
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps connector is not configured");
    }

    // Build a Google-style text query. searchText handles place names,
    // landmarks, addresses, and combined queries like "dental clinic near Sector 51 Noida".
    const textQuery = data.specialization
      ? `${data.specialization} doctor near ${data.location}`
      : data.location;

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.types,places.primaryTypeDisplayName,places.websiteUri,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 20,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Places searchText failed:", res.status, text);
      throw new Error(`Doctor search failed (${res.status})`);
    }

    type Place = {
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      nationalPhoneNumber?: string;
      internationalPhoneNumber?: string;
      rating?: number;
      userRatingCount?: number;
      types?: string[];
      primaryTypeDisplayName?: { text?: string };
      websiteUri?: string;
      googleMapsUri?: string;
    };
    const json = (await res.json()) as { places?: Place[] };
    const places = json.places ?? [];

    const results: DoctorHit[] = places
      .filter((p) => p.location && p.displayName?.text)
      .map((p) => ({
        place_id: p.id,
        name: p.displayName!.text!,
        specialization:
          p.primaryTypeDisplayName?.text ||
          (p.types ?? []).find((t) => /doctor|clinic|hospital|dental|pharmacy|health/i.test(t))?.replace(/_/g, " "),
        address: p.formattedAddress,
        phone: p.nationalPhoneNumber || p.internationalPhoneNumber,
        lat: p.location!.latitude,
        lng: p.location!.longitude,
        rating: p.rating,
        user_ratings_total: p.userRatingCount,
        website: p.websiteUri,
        google_maps_uri: p.googleMapsUri,
      }));

    const center =
      results.length > 0
        ? { lat: results[0].lat, lng: results[0].lng, name: data.location }
        : null;

    return { center, results };
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