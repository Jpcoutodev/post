# Post — Instagram Carousel Generator

Gera carrosséis para o Instagram usando dois fluxos do **n8n**:

1. **First image** — gera a primeira imagem (capa) do carrossel.
2. **Continuation** — gera os próximos slides mantendo coerência visual, recebendo a imagem anterior + um prompt.

O app é um MVP em **Next.js 15 + TypeScript + Prisma + Tailwind**, pensado para uso pessoal e pronto para evoluir para SaaS (auth, billing, multi-tenant).

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Zod (validação)

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite .env e preencha DATABASE_URL e os webhooks do n8n

# 3. Gerar cliente Prisma e aplicar schema
npm run db:generate
npm run db:push

# 4. Rodar em dev
npm run dev
```

Acesse http://localhost:3000

## Contratos esperados do n8n

### Webhook 1 — Primeira imagem

**POST** `N8N_FIRST_IMAGE_WEBHOOK_URL`

Body enviado pelo app:
```json
{
  "carouselId": "clx...",
  "title": "5 dicas de produtividade",
  "theme": "produtividade",
  "prompt": "descrição estilística..."
}
```

Resposta esperada (síncrona):
```json
{ "imageUrl": "https://.../first.png", "runId": "opcional" }
```

### Webhook 2 — Continuação

**POST** `N8N_CONTINUATION_WEBHOOK_URL`

Body enviado pelo app:
```json
{
  "carouselId": "clx...",
  "slideIndex": 1,
  "previousImageUrl": "https://.../first.png",
  "prompt": "descrição do próximo slide"
}
```

Resposta esperada:
```json
{ "imageUrl": "https://.../slide-1.png", "runId": "opcional" }
```

### (Opcional) Callback assíncrono

Se o fluxo do n8n rodar em background, configure-o para fazer POST em:

`POST /api/webhooks/n8n`

```json
{
  "carouselId": "clx...",
  "slideIndex": 0,
  "imageUrl": "https://.../image.png",
  "runId": "opcional"
}
```

Se `N8N_WEBHOOK_SECRET` estiver configurado, envie o header `X-Webhook-Secret` com o mesmo valor.

## Roadmap (para virar SaaS)

- [ ] Autenticação (NextAuth / Clerk)
- [ ] Multi-tenant (campo `userId` já existe no schema)
- [ ] Billing (Stripe) — plano free com limite de carrosséis
- [ ] Upload de imagens finais para S3/R2
- [ ] Editor de texto/overlay sobre a imagem
- [ ] Agendamento de post (Instagram Graph API)
- [ ] Histórico de prompts / templates
