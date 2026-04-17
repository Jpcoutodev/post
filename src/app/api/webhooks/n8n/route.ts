import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  carouselId: z.string(),
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

  const slide = await prisma.slide.update({
    where: {
      carouselId_index: {
        carouselId: parsed.data.carouselId,
        index: parsed.data.slideIndex,
      },
    },
    data: {
      imageUrl: parsed.data.imageUrl,
      n8nRunId: parsed.data.runId ?? undefined,
      status: "done",
    },
  });

  await prisma.carousel.update({
    where: { id: parsed.data.carouselId },
    data: { status: "ready" },
  });

  return NextResponse.json({ slide });
}
