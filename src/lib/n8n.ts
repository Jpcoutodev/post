type N8nResponse = {
  imageUrl?: string;
  runId?: string;
  [key: string]: unknown;
};

function extractImageUrl(data: any): string | undefined {
  // Array response: [{"url": "..."}, ...]
  if (Array.isArray(data)) {
    const first = data[0];
    if (!first) return undefined;
    return first.url || first.response || first.imageUrl || first.image_url || undefined;
  }

  // Object response: {"url": "..."} or {"response": "..."} or {"imageUrl": "..."}
  if (typeof data === "object" && data !== null) {
    return data.url || data.response || data.imageUrl || data.image_url || undefined;
  }

  // String response
  if (typeof data === "string" && data.startsWith("http")) {
    return data;
  }

  return undefined;
}

async function callWebhook(url: string, payload: unknown): Promise<N8nResponse> {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { "X-Webhook-Secret": secret } : {}),
      "post": "post07",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n webhook failed (${res.status}): ${text}`);
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await res.json();
    console.log("[n8n] Raw response:", JSON.stringify(data));

    const imageUrl = extractImageUrl(data);
    console.log("[n8n] Extracted imageUrl:", imageUrl);

    const obj = Array.isArray(data) ? data[0] ?? {} : data;
    return {
      imageUrl,
      runId: obj.runId || obj.id || undefined,
    };
  }

  const text = await res.text();
  console.log("[n8n] Text response:", text);

  if (text.startsWith("http")) {
    return { imageUrl: text.trim() };
  }
  return { raw: text } as N8nResponse;
}

/* ── Gerar primeira imagem (capa) ── */
export async function generateFirstImage(input: {
  carouselId: string;
  title: string;
  theme?: string | null;
  prompt: string;
}) {
  const url = process.env.N8N_FIRST_IMAGE_WEBHOOK_URL;
  if (!url) throw new Error("N8N_FIRST_IMAGE_WEBHOOK_URL not configured");

  return callWebhook(url, {
    prompt: input.prompt,
    text: input.title,
    id: input.carouselId,
  });
}

/* ── Gerar próximo slide (continuação) ── */
export async function generateContinuationImage(input: {
  carouselId: string;
  slideIndex: number;
  previousImageUrl: string;
  prompt: string;
  text: string;
  platform: string;
}) {
  const url = process.env.N8N_CONTINUATION_WEBHOOK_URL;
  if (!url) throw new Error("N8N_CONTINUATION_WEBHOOK_URL not configured");

  return callWebhook(url, {
    prompt: input.prompt,
    image: input.previousImageUrl,
    text: input.text,
    id: input.carouselId,
    position: String(input.slideIndex),
    rede_social: input.platform,
    id_post: input.carouselId,
  });
}
