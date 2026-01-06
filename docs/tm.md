# Blueprint completo — Creation Engine (Wizard + Scripts + Imagens)

Este documento descreve o fluxo completo de criação do sistema (roteiro, títulos, thumb/descrições, prompts de imagens por cena e geração de imagens), com:

- **Orquestração (frontend)**
- **Edge Functions (Supabase)**
- **Persistência (tabelas/buckets)**
- **Contratos JSON (inputs/outputs)**
- **Pontos de integração entre Wizard ⇄ Scripts ⇄ Imagens**

> Objetivo: servir como fonte para **portar toda a inteligência** (prompts/knowledge/orquestração/persistência) para outra ferramenta.

---

# 0) Visão geral (componentes)

## 0.1 Motores principais

- **Wizard Engine (Criação guiada)**
  - UI passo-a-passo, estado incremental salvo em `video_projects`.
  - Para IA síncrona usa `generate-with-prompt`.
  - Para IA longa usa **jobs** em `ai_jobs`.

- **Scripts Engine (Pipeline de roteiros “produção”)**
  - Planejamento estratégico (`scripts-plan`) e geração/revisão/validação de roteiro.
  - Persistência detalhada em `script_planning`, `scripts`, `script_segments`, `script_revisions`.

- **Images Engine (Prompts de cenas + geração de imagens)**
  - **Prompts para Cenas:** gera prompts por cena em background com persistência em `script_scene_prompts`.
  - **Gerador de Imagens:** consome prompts (principalmente ImageFX) e gera imagens chamando `generate-imagefx`.
  - **Salvar na nuvem:** salva imagens no Supabase Storage bucket `images` e metadados em `generated_images`.

---

# 1) Fontes de verdade (inteligência compartilhada)

## 1.1 Prompts

- **Tabela:** `ai_prompts`
- **Padrão (Edge Functions):**
  - Buscar prompt por `slug` (`getPromptOrThrow`/`getPrompt`).
  - Renderizar com `replaceVariables`/`render_prompt`.
  - Model/max_tokens vêm do banco.

Arquivos:
- `supabase/functions/_shared/prompts.ts`
- `supabase/functions/generate-with-prompt/index.ts`

## 1.2 Knowledge Base

- **Tabela:** `ai_knowledge_base`
- Injeção ocorre no backend (Edge) antes do call do Claude.

## 1.3 Channel DNA

- **Tabela:** `channel_dna`
- Injeta contexto e padrões do canal nos prompts (brief/plan/script).

---

# 2) Wizard Engine (Criação guiada)

## 2.1 Entrypoint e persistência

- **Página:** `src/pages/CreationWizard.tsx`
- **Componentes de etapa:** `src/components/wizard/steps/*`
- **Persistência:** `video_projects`
- **Hook:** `src/hooks/useProject.ts`

### O que salva

O Wizard salva incrementalmente um JSON por etapa (ex.: `theme_data`, `titles_data`, `brief_data`, `script_data`, etc.) dentro de `video_projects`.

## 2.2 IA síncrona (genérica)

- **Edge Function:** `generate-with-prompt`
- Usada pela maioria das etapas do Wizard.

### Contrato (request)

```json
{
  "promptSlug": "generate-titles",
  "variables": {
    "tema": "...",
    "dna_context": "...",
    "framework_context": "..."
  },
  "useFrameworkV61": true,
  "phase": "planejamento",
  "origin": "creation-wizard"
}
```

### Contrato (response)

```json
{
  "success": true,
  "content": "...texto/JSON do Claude...",
  "prompt_slug": "generate-titles",
  "model": "claude-...",
  "tokens_used": 1234,
  "knowledge_injected": ["...ids/nomes..."]
}
```

> Observação: o frontend normaliza respostas (`parseAIResponse`) porque a IA pode retornar JSON com variações/markdown.

## 2.3 IA assíncrona (jobs)

- **Tabela:** `ai_jobs`
- **Brief (desenvolver ideia):** `develop-idea-async`
  - Front: `src/hooks/useStepBrief.ts`
- **Roteiro (wizard atual):** `scripts-generate-async` → `scripts-generate-start` → `scripts-generate-background`
  - Front: `src/hooks/useStepScript.ts`

### Contrato (request exemplo: develop-idea-async)

```json
{
  "ideia": "...",
  "contexto_adicional": "..."
}
```

### Contrato (response)

```json
{
  "job_id": "uuid"
}
```

Frontend faz polling em `ai_jobs` até `status=completed|failed`.

---

# 3) Scripts Engine (Pipeline de roteiros)

## 3.1 Planejamento estratégico

- **Edge Function:** `scripts-plan`
- **Persistência:**
  - `script_planning`
  - `script_drafts`

### Contrato (request)

```json
{
  "title": "...",
  "brief": "...",
  "duration_target_minutes": 8,
  "style": "sombrio",
  "archetype": "Humilhação → Vingança",
  "channel_dna_id": "uuid (opcional)",
  "reference_scripts_ids": ["uuid"],
  "reference_videos_ids": ["uuid"],
  "additional_reference_text": "..."
}
```

### Contrato (response)

```json
{
  "planning_id": "uuid",
  "planning_text": "...",
  "suggested_titles": ["..."]
}
```

## 3.2 Geração de roteiro — modo A (job em `ai_jobs`)

- **Start:** `scripts-generate-start` (cria job e dispara background)
- **Background:** `scripts-generate-background` (streaming, progresso)
- **Saída:** `ai_jobs.output` (texto do roteiro + métricas)

### Contrato (request)

```json
{
  "planning": "...texto do planejamento...",
  "title": "...",
  "archetype": "...",
  "duration": "8",
  "words": "1040",
  "style": "sombrio"
}
```

### Contrato (response start)

```json
{ "job_id": "uuid" }
```

## 3.3 Geração de roteiro — modo B (segmentado em tabelas)

- **Start:** `scripts-generate-segmented`
  - cria `scripts`
  - cria 7 `script_segments`
  - dispara `scripts-generate-segment (segment 1)`
- **Per segment:** `scripts-generate-segment`
  - salva `content`, `context_summary`, `word_count`
  - dispara o próximo
- **Finalize:** concatena e salva em `scripts.content`
- **Resume:** `scripts-resume`

### Contrato (request: start segmented)

```json
{ "planning_id": "uuid" }
```

### Contrato (response)

```json
{ "script_id": "uuid", "total_segments": 7 }
```

## 3.4 Validação

- **Rápida (sem IA):** `scripts-validate`
- **Profunda (com IA):** `scripts-validate-deep` (prompt `scripts-validate-deep`)

## 3.5 Revisão (assíncrona)

- `scripts-revise-start` → dispara `scripts-revise-background` → usa `scripts-revise-segment` por ato.
- Persiste histórico em `script_revisions`.

---

# 4) Images Engine — Prompts de Imagem + Geração de Imagens

Este engine é **paralelo** ao Wizard/Scripts, mas integra principalmente com a tabela `scripts`.

## 4.1 Prompts para Cenas (gerador de prompts de imagem)

### Entrypoint (frontend)

- **Página:** `src/pages/PromptsParaCenas.tsx`
- **Hook:** `src/components/prompts-cenas/usePromptsParaCenas.ts`

### Persistência

- **Tabela:** `script_scene_prompts`
  - criada em `supabase/migrations/20251126195000_create_script_scene_prompts.sql`
  - evoluções (streaming/incremental): `20251126200000_update_scene_prompts_for_streaming.sql`

Campos relevantes usados pelo fluxo:
- `status`: `pending | processing | completed | failed`
- `total_scenes`, `completed_scenes`
- `scenes_to_process` (JSONB com cenas)
- `prompts` (array JSONB com prompts por cena)
- `image_style`, `platform`, `language`
- `characters_description`
- `include_text_in_image`

### Edge Functions

#### 4.1.1 `scene-prompts-start` (início async)

- Divide o roteiro em cenas (modo `automatic|by-words|by-seconds|by-paragraphs|7x1`).
- Calcula para cada cena:
  - `main_text`
  - `context_before` e `context_after` (janela proporcional de palavras)
  - `timing` (`start`, `end`, `duration_seconds`) baseado em WPM
  - `position` (`opening|development|climax|resolution`)
  - `is_wildcard_scene` (modo 7x1: cena curinga)
- Insere um job em `script_scene_prompts` com `status=processing`.
- Dispara `scene-prompts-background` com service role (fire-and-forget).

**Contrato (request)**

```json
{
  "script_content": "...",
  "script_id": "uuid (opcional)",
  "image_style": "cinematografico",
  "platform": "imagefx",
  "language": "pt",
  "include_text_in_image": false,
  "characters": "texto opcional com descrições",
  "generation_mode": "7x1",
  "words_per_scene": 100,
  "seconds_per_scene": 10,
  "wpm_rate": 130
}
```

**Contrato (response)**

```json
{
  "success": true,
  "job_id": "uuid",
  "total_scenes": 7,
  "message": "Geração iniciada. Use polling para acompanhar o progresso."
}
```

#### 4.1.2 `scene-prompts-background` (processamento incremental)

- Busca o job em `script_scene_prompts`.
- Usa prompt do banco obrigatoriamente: `slug = 'scene-prompts-background'`.
- Para cada cena:
  - monta `system_prompt` e `user_prompt_template` via `replaceVariables`
  - chama Claude com `promptConfig.model` e `promptConfig.max_tokens`
  - extrai JSON do retorno
  - salva incrementalmente em `script_scene_prompts.prompts`
  - atualiza `completed_scenes`
- Anti-timeout:
  - se perto de 55s de execução, a função **reinvoca a si mesma** para continuar.
- Finaliza com `status='completed'`.

**Formato de cada item em `script_scene_prompts.prompts` (exemplo)**

```json
{
  "scene_number": 1,
  "scene_text": "resumo curto...",
  "prompt_en": "...",
  "prompt_pt": "...",
  "prompt_formatted": "... (inclui estilo/plataforma)",
  "characters_detected": ["Protagonista"],
  "setting": "...",
  "mood": "tenso",
  "camera_suggestion": "wide shot",
  "language_used": "pt"
}
```

#### 4.1.3 `generate-scene-prompts` (detecção de personagens)

- Endpoint específico para **detectar personagens** (com descrições físicas) do roteiro.
- Chamado pelo frontend quando `detect_characters_only=true`.

**Contrato (request)**

```json
{
  "script_content": "...",
  "detect_characters_only": true
}
```

**Contrato (response)**

```json
{
  "characters_detected": "**Nome:** descrição...\n**Vilão:** descrição..."
}
```

### Polling no frontend

O frontend faz polling direto na tabela `script_scene_prompts` (não usa `ai_jobs`), lendo:
- `status`
- `completed_scenes/total_scenes`
- `prompts` (parcial e final)

### Integração com Gerador de Imagens

Quando conclui, a página `PromptsParaCenas` envia os prompts para o gerador de imagens via `localStorage`:
- key: `pending_image_prompts`
- value: array de `prompt_formatted || prompt_pt`

---

## 4.2 Gerador de Imagens (ImageFX)

### Entrypoint (frontend)

- **Página:** `src/pages/GeradorImagens.tsx`
- **Hook:** `src/components/gerador-imagens/useGeradorImagens.ts`

### Principais características do fluxo

- Usuário cola uma lista de prompts (1 por linha) **ou importa** do Prompts para Cenas.
- Geração é **sequencial** (loop com delay) para reduzir rate-limit.
- Cookies do ImageFX são armazenados localmente:
  - `localStorage['imagefx_cookies']`

### Edge Function: `generate-imagefx`

- Faz autenticação via cookie:
  - `GET https://labs.google/fx/api/auth/session` → obtém `access_token`
- Gera imagem via:
  - `POST https://aisandbox-pa.googleapis.com/v1:runImageFx`
- Retorna imagens como `data:image/png;base64,...` (data URL)
- Faz sanitização mínima do prompt para reduzir bloqueios (ex: idades <18, alguns nomes próprios, violência gráfica).

**Contrato (request)**

```json
{
  "prompt": "...",
  "cookies": "...cookies do ImageFX...",
  "aspect_ratio": "IMAGE_ASPECT_RATIO_LANDSCAPE",
  "num_images": 1,
  "seed": 12345
}
```

**Contrato (response)**

```json
{
  "success": true,
  "images": ["data:image/png;base64,...."],
  "count": 1
}
```

### Edge Function: `save-generated-image`

- Recebe uma imagem em base64 (data URL), faz upload no Storage e (opcionalmente) salva metadados.

**Storage**
- **Bucket:** `images`
- **Path:** `generated/YYYY/MM/DD/<timestamp>-<rand>.png`

**Tabela (metadados):** `generated_images`
- `file_path`, `public_url`, `prompt`, `session_name`, `user_id`

**Contrato (request)**

```json
{
  "image_base64": "data:image/png;base64,...",
  "prompt": "...",
  "session_name": "opcional",
  "user_id": "opcional"
}
```

**Contrato (response)**

```json
{
  "success": true,
  "file_path": "generated/2026/01/02/...png",
  "public_url": "https://.../storage/v1/object/public/images/..."
}
```

---

# 5) Pontos de integração (para portar como um fluxo único)

## 5.1 Scripts → Prompts para Cenas

- O módulo `PromptsParaCenas` pode importar roteiros existentes da tabela `scripts` (`status='completed'`).
- Ideal no sistema novo:
  - após gerar `scripts.content`, oferecer CTA: **“Gerar prompts de imagem por cena”**
  - chamar `scene-prompts-start` com `script_id` e `script_content`.

## 5.2 Prompts para Cenas → Gerador de Imagens

- Integração atual é via `localStorage` (`pending_image_prompts`).
- No sistema novo, o ideal é:
  - persistir “seleção de prompts” no backend, ou
  - navegar passando `session_id` e o gerador buscar os prompts na `script_scene_prompts`.

## 5.3 Wizard → Scripts Engine

- O Wizard hoje gera roteiro via job em `ai_jobs` (modo A).
- Para “unificar” com o Scripts Engine (recomendado para port), a ponte ideal é:
  1) Converter `video_projects` → `script_planning` (via `scripts-plan`)
  2) Aprovar planning
  3) Gerar roteiro via modo B (segmentado) e salvar em `scripts`
  4) Linkar `scripts.id` no `video_projects` (já existe `linkScript()` no `useProject`).

---

# 6) Inventário de tabelas e papéis

## Conteúdo (Wizard)
- `video_projects`: estado incremental por etapa.

## Jobs
- `ai_jobs`: processamentos longos (brief/script) com progresso.

## Scripts Engine
- `script_planning`: planejamento estratégico.
- `script_drafts`: versões/drafts do planejamento.
- `scripts`: roteiro final + status.
- `script_segments`: atos/segmentos (geração segmentada).
- `script_revisions`: histórico de revisões.

## Imagens
- `script_scene_prompts`: jobs e resultados dos prompts por cena.
- `generated_images`: metadados de imagens salvas.
- Storage bucket `images`: arquivos das imagens.

---

# 7) Inventário de Edge Functions (relevantes a este blueprint)

## Wizard / Prompt genérico
- `generate-with-prompt`

## Brief
- `develop-idea-async`

## Scripts Engine
- `scripts-plan`
- `scripts-generate-async`
- `scripts-generate-start`
- `scripts-generate-background`
- `scripts-generate-segmented`
- `scripts-generate-segment`
- `scripts-generate-final`
- `scripts-resume`
- `scripts-validate`
- `scripts-validate-deep`
- `scripts-revise-start`
- `scripts-revise-background`
- `scripts-revise-segment`

## Imagens
- `scene-prompts-start`
- `scene-prompts-background`
- `generate-scene-prompts` (detect characters only)
- `generate-imagefx`
- `save-generated-image`

---

# 8) Requisitos de secrets/env (para portar)

- **Supabase**
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

- **Claude**
  - `CLAUDE_API_KEY`

- **ImageFX**
  - Não usa API key.
  - Exige **cookies do usuário** (sessão labs.google) para obter `access_token`.

---

# 9) Observações de design (decisões que importam na portabilidade)

- **Prompts não são hardcoded** (devem vir do banco `ai_prompts`).
- **Operações longas** (roteiro, prompts por cena) são background com persistência e polling.
- **O frontend normaliza respostas** porque formatos variam.
- O fluxo de imagens tem duas camadas:
  - **gerar prompts (IA)** → persistir → revisar/copiar
  - **gerar imagens (ImageFX)** → opcionalmente salvar no Storage.

---

# 10) Como portar (alto nível)

- **Mínimo para replicar o valor:**
  - Prompt registry (DB) + renderer + KB + DNA
  - Orquestração Wizard (ou substituto)
  - Scripts pipeline (plan/generate/validate/revise)
  - Prompts para Cenas (scene-prompts-start/background) + persistência
  - Gerador ImageFX (generate-imagefx) + salvar no Storage

---

> Documento gerado a partir do código atual do repositório.
