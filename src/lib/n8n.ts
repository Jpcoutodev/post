type N8nResponse = {
  imageUrl?: string;
  runId?: string;
  [key: string]: unknown;
};

async function callWebhook(url: string, payload: unknown): Promise<N8nResponse> {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { "X-Webhook-Secret": secret } : {}),
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
    return (await res.json()) as N8nResponse;
  }
  return { raw: await res.text() };
}

export async function generateFirstImage(input: {
  carouselId: string;
  title: string;
  theme?: string | null;
  prompt: string;
}) {
  const url = process.env.N8N_FIRST_IMAGE_WEBHOOK_URL;
  if (!url) throw new Error("N8N_FIRST_IMAGE_WEBHOOK_URL not configured");
  return callWebhook(url, input);
}

export async function generateContinuationImage(input: {
  carouselId: string;
  slideIndex: number;
  previousImageUrl: string;
  prompt: string;
}) {
  const url = process.env.N8N_CONTINUATION_WEBHOOK_URL;
  if (!url) throw new Error("N8N_CONTINUATION_WEBHOOK_URL not configured");
  return callWebhook(url, input);
}
