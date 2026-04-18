import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { uploadToStorage } from "@/lib/storage";

const schema = z.object({
  projectId: z.string().optional(),
  carouselId: z.string().optional(),
  slideIndex: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  runId: z.string().optional(),
});

export async function POST(req: Request) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const projectId = parsed.data.projectId || parsed.data.carouselId;
  if (!projectId) {
    return NextResponse.json({ error: "projectId or carouselId required" }, { status: 400 });
  }

  // Buscar slide
  const { data: existingSlide } = await supabase
    .from("slides")
    .select("id")
    .eq("project_id", projectId)
    .eq("index", parsed.data.slideIndex)
    .single();

  if (!existingSlide) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  // Upload da imagem temporária para o Supabase Storage
  let permanentUrl = parsed.data.imageUrl;
  try {
    permanentUrl = await uploadToStorage(parsed.data.imageUrl, projectId, parsed.data.slideIndex);
    console.log("[webhook] Image saved to storage:", permanentUrl);
  } catch (uploadErr) {
    console.error("[webhook] Storage upload failed, using temp URL:", uploadErr);
  }

  // Atualizar slide com URL permanente
  const { data: slide, error: slideError } = await supabase
    .from("slides")
    .update({
      image_url: permanentUrl,
      n8n_run_id: parsed.data.runId ?? null,
      status: "done",
    })
    .eq("id", existingSlide.id)
    .select()
    .single();

  if (slideError) {
    return NextResponse.json({ error: slideError.message }, { status: 500 });
  }

  await supabase
    .from("projects")
    .update({ status: "ready" })
    .eq("id", projectId);

  return NextResponse.json({ slide });
}
