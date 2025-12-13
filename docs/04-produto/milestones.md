# 📋 Video Factory OS - Milestones

## Fase 0 — Bootstrap + Doc Governance ✅ (em andamento)

### Entregas
- [x] docs/PRD.md
- [x] docs/DOCS-INDEX.md
- [x] docs/ARCHITECTURE.md
- [x] docs/MILESTONES.md (este arquivo)
- [ ] docs/QA-ACCEPTANCE.md
- [ ] docs/ADR/2025-12-13-ADR-001-stage-directions.md
- [ ] Projeto Next.js inicializado
- [ ] SQLite + Drizzle configurado
- [ ] Schema DB completo
- [ ] Seed real (Graciela)
- [x] getPromptOrThrow implementado

### Critérios de Aceite
- [ ] `npm run dev` inicia sem erros
- [ ] Seed popula DB com dados reais
- [ ] `curl /api/health` retorna OK + DB conectado
- [ ] Docs são "self-explanatory"

---

## Fase 1 — Core Engine + Checkpoints

### Entregas
- [ ] lib/engine/job-runner.ts
- [ ] lib/engine/step-executor.ts
- [ ] lib/engine/checkpoint.ts
- [ ] API: POST /api/jobs (criar job)
- [ ] API: POST /api/jobs/[id]/run (executar)
- [ ] API: GET /api/jobs/[id] (status + steps)

### Critérios de Aceite
- [ ] Pipeline dummy: step1 → step2 → step3
- [ ] Falha no step2, retoma exatamente do step2
- [ ] Step completo com input_hash igual = SKIP
- [ ] Artifacts versionados (não sobrescreve)
- [ ] Logs por step salvos

---

## Fase 2 — Prompt & Config Registry

### Entregas
- [ ] lib/prompts/index.ts expandido
- [ ] lib/prompts/knowledge-base.ts (tiers)
- [ ] UI Admin: CRUD prompts
- [ ] UI Admin: CRUD presets (voice/video/effects)

### Critérios de Aceite
- [ ] `getPromptOrThrow("inexistente")` lança error explícito
- [ ] Mudar preset → input_hash muda → step re-executa
- [ ] Prompts editáveis via UI refletem no pipeline

---

## Fase 3 — Script Stage Directions (Graciela)

### Entregas
- [ ] lib/adapters/claude.ts
- [ ] lib/validators/stage-directions.ts
- [ ] Prompt Graciela ajustado
- [ ] Step "script" funcional

### Critérios de Aceite
- [ ] 10 execuções → 10 roteiros válidos
- [ ] Roteiro: sem SSML, sem Markdown
- [ ] Roteiro: começa com (voz: NARRADORA)
- [ ] Roteiro: ≥ 6000 palavras
- [ ] Marcadores válidos: NARRADORA/ANTAGONISTA/OTRO
- [ ] Pausas válidas: [PAUSA CORTA]/[PAUSA]/[PAUSA LARGA]

---

## Fase 4 — Parse → SSML + Azure TTS

### Entregas
- [ ] lib/adapters/ssml-parser.ts
- [ ] lib/adapters/azure-tts.ts
- [ ] lib/validators/ssml.ts
- [ ] Steps "parse_ssml" e "tts" funcionais

### Critérios de Aceite
- [ ] SSML gerado é válido (Azure aceita)
- [ ] Zero `<voice>` aninhados
- [ ] Prosody/style/role vêm do DB (preset)
- [ ] mp3 gerado com qualidade esperada

---

## Fase 5 — Render FFmpeg local

### Entregas
- [ ] lib/adapters/ffmpeg.ts
- [ ] Step "render" funcional
- [ ] Preset VideoToolbox ativo no Mac

### Critérios de Aceite
- [ ] mp4 final gerado E2E
- [ ] Encoder = h264_videotoolbox (Mac)
- [ ] Scale/fps/bitrate vêm do preset no DB
- [ ] Render < 5 min para vídeo de ~10 min

---

## Fase 6 — UI completa (Jobs + Reprocess)

### Entregas
- [ ] Tela: Lista de Jobs
- [ ] Tela: Detalhe do Job (steps, status, logs)
- [ ] Ações: Retry step, Retry from step X
- [ ] Previews: texto, SSML, áudio, vídeo
- [ ] Tela: Criar novo Job

### Critérios de Aceite
- [ ] 1 vídeo completo produzido 100% via UI
- [ ] Retry de step funciona
- [ ] Logs visíveis por step
- [ ] Preview de cada artefato funciona

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Fase completa |
| 🔄 | Fase em andamento |
| ⏳ | Fase pendente |
| [x] | Item completo |
| [ ] | Item pendente |
