import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { generateContinuationImage } from "@/lib/n8n";
import { uploadToStorage } from "@/lib/storage";

const schema = z.object({
  prompt: z.string().min(1).max(2000),
  text: z.string().min(1).max(500),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Buscar projeto e slides existentes
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, slides(*)")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const slides = ((project.slides as any[]) || []).sort(
    (a, b) => a.index - b.index
  );
  const lastSlide = slides[slides.length - 1];
  const newIndex = (lastSlide?.index ?? -1) + 1;
  const previousImageUrl = lastSlide?.image_url || "";

  if (!previousImageUrl) {
    return NextResponse.json(
      { error: "Nenhuma imagem anterior encontrada. Gere a primeira imagem antes." },
      { status: 400 }
    );
  }

  // Criar novo slide
  const { data: newSlide, error: slideError } = await supabase
    .from("slides")
    .insert({
      project_id: id,
      index: newIndex,
      kind: "content",
      prompt: parsed.data.prompt,
      caption: parsed.data.text,
      status: "generating",
    })
    .select()
    .single();

  if (slideError || !newSlide) {
    return NextResponse.json(
      { error: slideError?.message || "Failed to create slide" },
      { status: 500 }
    );
  }

  // Atualizar status do projeto
  await supabase
    .from("projects")
    .update({ status: "generating" })
    .eq("id", id);

  try {
    const result = await generateContinuationImage({
      carouselId: id,
      slideIndex: newIndex,
      previousImageUrl,
      prompt: parsed.data.prompt,
      text: parsed.data.text,
      platform: project.platform,
    });

    console.log("[slides] n8n result:", JSON.stringify(result));

    if (result.imageUrl) {
      // Upload da imagem temporária para o Supabase Storage
      let permanentUrl = result.imageUrl;
      try {
        permanentUrl = await uploadToStorage(result.imageUrl, id, newIndex);
        console.log("[slides] Image saved to storage:", permanentUrl);
      } catch (uploadErr) {
        console.error("[slides] Storage upload failed, using temp URL:", uploadErr);
      }

      await supabase
        .from("slides")
        .update({
          image_url: permanentUrl,
          n8n_run_id: result.runId ?? null,
          status: "done",
        })
        .eq("id", newSlide.id);

      await supabase
        .from("projects")
        .update({ status: "ready" })
        .eq("id", id);

      return NextResponse.json(
        { slide: { ...newSlide, image_url: permanentUrl, status: "done" } },
        { status: 201 }
      );
    }

    return NextResponse.json({ slide: newSlide }, { status: 201 });
  } catch (err) {
    console.error("[slides] Error:", err);

    await supabase
      .from("slides")
      .update({ status: "error" })
      .eq("id", newSlide.id);

    await supabase
      .from("projects")
      .update({ status: "error" })
      .eq("id", id);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 502 }
    );
  }
}
