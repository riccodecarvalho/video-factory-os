# Render Engine Evolution — Context Pack

> **Origem:** Sessão 2025-12-22  
> **Status:** Planejado (não iniciado)  
> **Referência:** JSON2Video como benchmark de design

---

## 0) Por que esse contexto existe

Estamos avaliando o **JSON2Video** como referência/benchmark porque ele resolve "video as code": descrever um vídeo em JSON (cenas, elementos, timing, templates, variáveis) e renderizar de forma assíncrona via API.

**O objetivo não é usar JSON2Video como SaaS** (ficaria caro e inadequado para longform em escala), e sim **internalizar o mesmo conceito** dentro do **Video Factory OS**, com render local (FFmpeg + VideoToolbox no Mac), mantendo nosso modelo **config-first + manifest-first + idempotência**.

---

## 1) O que o JSON2Video é (a "essência" do produto)

O JSON2Video é um "After Effects/CapCut via API". O núcleo dele é:

* **Modelo declarativo**: `movie → scenes → elements`
* **Elements**: texto, imagem, vídeo, áudio, legendas/subtitles, etc.
* **Templates + variáveis + condicionais** (um template vira milhares de vídeos com inputs)
* **Render assíncrono**: job queue + status + callback/webhook
* (Opcional) geração via IA (TTS, imagens) e componentes prontos

O valor real do JSON2Video é: **"contrato de vídeo em JSON" + "infra de execução" + "DX polido"**.

---

## 2) Tradução 1:1 para o nosso Video Factory OS (mapeamento)

O JSON2Video encaixa naturalmente como referência de design do módulo **Video Factory / Render Engine**.

Mapeamento direto:

| JSON2Video | Video Factory OS |
|------------|------------------|
| Template | Recipe |
| Movie JSON | Manifest do Job |
| Scenes/Elements | Timeline DSL interna |
| Render async + webhooks | Jobs + Execution Map + callbacks |
| Providers | Providers (Claude/Azure/FFmpeg) |

**Conclusão:**
Não precisamos do SaaS. Precisamos absorver a arquitetura mental: **"video as JSON + template variables + job render assíncrono"** — e encaixar dentro do nosso sistema manifest-first.

---

## 3) O que internalizar do JSON2Video (escopo mínimo necessário)

### 3.1. O que dá para replicar 100% no nosso stack (com FFmpeg)

* Timeline declarativa (cenas/layers/tempo)
* Elementos: imagem, vídeo, texto, áudio, legendas
* Mixagem de áudio: trilha + TTS + SFX + ducking
* Subtitles: gerar (Whisper ou outro) e aplicar (burn-in ou `.srt/.ass`)
* Templates + variáveis + condicionais (no manifest/recipe)
* Render em fila com status e callback

### 3.2. O que não precisamos copiar (evitar "projeto infinito")

* marketplace de templates
* biblioteca enorme de componentes animados
* UX "After Effects na web"
* billing/credits/quotas multi-tenant

O foco é: **primitives + recipes + compiler + worker queue + observabilidade**.

---

## 4) Peça central: "Render Plan Compiler"

Para "migrar a ideia do JSON2Video pro VFOs" sem virar gambiarra, a peça-chave é:

### Manifest (alto nível) → RenderPlan (baixo nível)

* **Manifest**: descreve *o que é o vídeo* (cenas, elementos, estilo, variáveis)
* **RenderPlan**: descreve *como executar* (etapas, comandos, filtros, inputs/outputs)

Isso permite:

* estabilidade do schema (versionado)
* re-render parcial por checkpoint
* trocar backend no futuro (hoje FFmpeg; amanhã outro) sem quebrar recipe/manifest
* logs estruturados por etapa

---

## 5) Render Farm em Macs (escala barata e realista)

### 5.1. Cenário de produção

* Vídeos longos: **40 min a 1h**
* Volume atual: **1 vídeo/dia** (1 canal)
* Até março: pelo menos **5 canais**, podendo chegar a **2 vídeos/dia por canal**
* Pico: **~10 vídeos/dia**
* Em minutos: **400 a 600 min/dia** (~15.000 min/mês)

### 5.2. Por que Mac local faz sentido

* Apple Silicon (M1/M2) com **VideoToolbox** renderiza muito rápido em H.264/H.265
* Custo fixo baixo (Mac usado R$ 3–4k)
* Escala horizontal simples: mais um Mac = mais workers
* Sem custo variável por minuto

### 5.3. Forma de operar (render farm local)

* 1 "Coordinator" (o app/DB) decide jobs e coloca na fila
* N Macs rodam "Workers" (daemon) que pegam jobs, executam FFmpeg e devolvem artefatos
* Opcional: storage compartilhado (NAS) ou object storage (S3/R2/MinIO)

**Nota:** já temos **3 MacBooks** disponíveis.

---

## 6) Short-form (YouTube Shorts, TikTok, Reels)

### 6.1. O ponto é "format profile"

Short-form não é outro produto; é **outro perfil de recipe**:

* Aspect ratio: 9:16
* Regras de safe area (UI overlays das plataformas)
* Legendas maiores e dinâmicas
* Cortes agressivos + hook nos 2–3s iniciais
* Export presets por plataforma

### 6.2. Como gerar shorts a partir de longform

* Stage: `extract_clips` (seleciona trechos por heurística/IA)
* Stage: `short_script` (título/descrição/hook)
* Stage: `short_subtitles` (srt/ass estilizado)
* Stage: `render_short` (template vertical)
* Stage: `export_platform_variants` (YouTube Shorts / TikTok / Reels)

---

## 7) Backlog Prático

### Fase 1 — "JSON2Video interno mínimo"

| Gate | Entrega |
|------|---------|
| 2.0 | Timeline DSL v1 (schema + validation) |
| 2.1 | RenderPlan v1 + Compiler básico |
| 2.2 | Worker local (single Mac) |
| 2.3 | Queue + Status + Retry |
| 2.4 | Presets FFmpeg (VideoToolbox profiles) |
| 2.5 | Artefacts + Logs estruturados |

### Fase 2 — Short-form

| Gate | Entrega |
|------|---------|
| 3.0 | Format profiles (16:9 / 9:16) + safe areas |
| 3.1 | Subtitle styles (ASS estilo shorts) |
| 3.2 | Clip extraction + short generator |
| 3.3 | Export variants por plataforma |

### Fase 3 — Escala local (render farm)

| Gate | Entrega |
|------|---------|
| 4.0 | Registrar workers (Macs) no Coordinator |
| 4.1 | Scheduler básico (prioridades e quotas) |
| 4.2 | Cache por hash (evitar recomputar) |
| 4.3 | Observabilidade: metrics + DLQ + retries |

---

## 8) ADRs a Criar

- **ADR-013:** Timeline DSL + RenderPlan Architecture
- **ADR-014:** Render Farm Strategy (Mac Workers)  
- **ADR-015:** Short-form Format Profiles

---

## 9) Próximo Passo

Criar **ADR-013: Timeline DSL + RenderPlan Architecture** definindo:
- Schema da Timeline DSL (scenes, elements, timing)
- Schema do RenderPlan (steps, commands, inputs/outputs)
- Relação Manifest → Compiler → RenderPlan → FFmpeg
- Exemplos de JSON

---

**Última atualização:** 2025-12-22
