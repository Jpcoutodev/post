import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateFirstImage } from "@/lib/n8n";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  theme: z.string().max(120).optional().nullable(),
  prompt: z.string().min(1).max(2000),
});

export async function GET() {
  const carousels = await prisma.carousel.findMany({
    orderBy: { createdAt: "desc" },
    include: { slides: { orderBy: { index: "asc" } } },
    take: 50,
  });
  return NextResponse.json({ carousels });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let carousel: any;
  try {
    carousel = await prisma.carousel.create({
      data: {
        title: parsed.data.title,
        theme: parsed.data.theme ?? null,
        prompt: parsed.data.prompt,
        status: "generating",
        slides: {
          create: { index: 0, kind: "first", prompt: parsed.data.prompt, status: "pending" },
        },
      },
      include: { slides: true },
    });
  } catch (err) {
    console.error("Prisma error ignored for testing:", err);
    // Mock carousel so n8n still runs!
    carousel = { 
      id: "teste_sem_banco_" + Date.now(), 
      slides: [{ id: "slide_teste" }] 
    };
  }

  try {
    const result = await generateFirstImage({
      carouselId: carousel.id,
      title: parsed.data.title,
      theme: parsed.data.theme ?? null,
      prompt: parsed.data.prompt,
    });

    if (carousel.id.startsWith("teste_sem_banco")) {
      return NextResponse.json({ 
        carousel: { ...carousel, slides: [{ ...carousel.slides[0], imageUrl: result.imageUrl }] } 
      }, { status: 201 });
    }

    const firstSlide = carousel.slides[0];
    const updated = await prisma.slide.update({
      where: { id: firstSlide.id },
      data: {
        imageUrl: result.imageUrl ?? null,
        n8nRunId: result.runId ?? null,
        status: result.imageUrl ? "done" : "pending",
      },
    });

    await prisma.carousel.update({
      where: { id: carousel.id },
      data: { status: result.imageUrl ? "ready" : "generating" },
    });

    return NextResponse.json({ carousel: { ...carousel, slides: [updated] } }, { status: 201 });
  } catch (err) {
    if (!carousel.id.startsWith("teste_sem_banco")) {
      await prisma.carousel.update({
        where: { id: carousel.id },
        data: { status: "error" },
      }).catch(() => {});
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown error" },
      { status: 502 },
    );
  }
}
