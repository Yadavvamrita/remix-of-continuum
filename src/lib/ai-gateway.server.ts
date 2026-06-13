const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function callGateway(body: Record<string, unknown>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted — please add credits in your workspace billing.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<{
    choices: Array<{ message: { content: string } }>;
  }>;
}