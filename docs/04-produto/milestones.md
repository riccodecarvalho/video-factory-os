# 📋 Video Factory OS - Milestones

## Fase 0 — Bootstrap + Doc Governance ✅

### Entregas
- [x] docs/PRD.md
- [x] docs/DOCS-INDEX.md  
- [x] docs/ARCHITECTURE.md
- [x] docs/MILESTONES.md
- [x] docs/QA-ACCEPTANCE.md
- [x] Projeto Next.js inicializado
- [x] SQLite + Drizzle configurado
- [x] Schema DB completo
- [x] Seed real (Graciela)
- [x] getPromptOrThrow implementado

### Critérios de Aceite
- [x] `npm run dev` inicia sem erros
- [x] Seed popula DB com dados reais
- [x] `curl /api/health` retorna OK + DB conectado
- [x] Docs são "self-explanatory"

---

## Fase 1 — Core Engine + Checkpoints ✅

### Entregas
- [x] lib/engine/runner.ts
- [x] lib/engine/checkpoint.ts
- [x] API: POST /api/jobs (criar job)
- [x] API: POST /api/jobs/[id]/run (executar)
- [x] API: GET /api/jobs/[id] (status + steps)

### Critérios de Aceite
- [x] Pipeline funcional (ideacao → titulo → planejamento → roteiro → parse_ssml → tts → renderizacao)
- [x] Falha no step, retoma exatamente do step
- [x] Step completo com input_hash igual = SKIP
- [x] Artifacts versionados (não sobrescreve)
- [x] Logs por step salvos

---

## Fase 2 — Prompt & Config Registry ✅

### Entregas
- [x] lib/prompts/index.ts
- [x] lib/prompts/knowledge-base.ts (tiers)
- [x] UI Admin: CRUD prompts
- [x] UI Admin: CRUD presets (voice/video/effects)

### Critérios de Aceite
- [x] `getPromptOrThrow("inexistente")` lança error explícito
- [x] Mudar preset → input_hash muda → step re-executa
- [x] Prompts editáveis via UI refletem no pipeline

---

## Fase 3 — Script Stage Directions (Graciela) ✅

### Entregas
- [x] lib/adapters/claude.ts
- [x] lib/validators/stage-directions.ts
- [x] Prompt Graciela ajustado
- [x] Step "roteiro" funcional

### Critérios de Aceite
- [x] Roteiros gerados são válidos
- [x] Roteiro: sem SSML, sem Markdown
- [x] Marcadores de voz funcionais

---

## Fase 4 — Parse → SSML + Azure TTS ✅

### Entregas
- [x] lib/adapters/ssml-parser.ts
- [x] lib/adapters/azure-tts.ts
- [x] lib/validators/ssml.ts
- [x] Steps "parse_ssml" e "tts" funcionais

### Critérios de Aceite
- [x] SSML gerado é válido (Azure aceita)
- [x] Prosody/style/role vêm do DB (preset)
- [x] mp3 gerado com qualidade esperada

---

## Fase 5 — Render FFmpeg local ✅

### Entregas
- [x] lib/engine/ffmpeg.ts
- [x] Step "renderizacao" funcional
- [x] Preset VideoToolbox ativo no Mac
- [x] Avatar fullscreen como background

### Critérios de Aceite
- [x] mp4 final gerado E2E
- [x] Encoder = h264_videotoolbox (Mac)
- [x] Scale/fps/bitrate vêm do preset no DB
- [x] Avatar Graciela como background do vídeo

---

## Fase 6 — UI completa (Jobs + Reprocess) ✅

### Entregas
- [x] Tela: Lista de Jobs (Dashboard com dados reais)
- [x] Tela: Detalhe do Job (steps, status, logs)
- [x] Ações: Resume, Cancel
- [x] Tela: Criar novo Job

### Critérios de Aceite
- [x] Dashboard mostra jobs reais do DB
- [x] Job Detail mostra pipeline com progresso real
- [x] Botão Resume funciona para jobs failed/cancelled
- [x] Botão Cancel funciona para jobs running
- [ ] Previews de artefatos individuais (pendente)

---

## Fase 7 — Steps LLM Pós-Render (Pendente)

### Entregas
- [x] Prompts criados: miniaturas, descricao, tags, comunidade
- [x] Bindings configurados
- [ ] Testar execução completa dos steps pós-render

### Critérios de Aceite
- [ ] 1 vídeo completo com todos os 12 steps

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Fase completa |
| 🔄 | Fase em andamento |
| ⏳ | Fase pendente |
| [x] | Item completo |
| [ ] | Item pendente |
