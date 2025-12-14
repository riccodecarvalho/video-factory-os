# 📅 SESSÃO 2025-12-13/14 — Gate 1.0 a 1.5.2 (Admin & E2E Real)

**Origem:** Importado de logs de chat e execução recente.

## 🎯 Escopo Consolidado

Foco em governança (Admin Visibility), testes E2E reais e correções de produto.

### Gate 1.0 a 1.25 — Governance Infrastructure
- **Execution Map:** Visualização de quem usa qual provider/prompt.
- **Auditoria:** Rastreabilidade de mudanças críticas.
- **Providers Reais:** Claude (Anthropic) e Azure TTS integrados.

### Gate 1.3 a 1.4 — UX & E2E Prep
- **Multi-Project:** Dropdowns e filtros por projeto.
- **Job Tabs:** Config (snapshot), Artifacts (files).
- **E2E Script:** `npm run vf:e2e` criado.

### Gate 1.5.1 — Azure Batch TTS + COMPLETED E2E
- Implementação da API de Batch Synthesis da Azure (obrigatória para áudios longos).
- Resultado: Job completo em ~7 min, gerando 41MB de áudio.

### Gate 1.5.2 — 5 Fixes de Produto (Madrugada 14/12)
1. **Script Voz Única:** Limpeza de tags `(voz: X)` e markdown no `runner.ts`.
2. **Audio Streaming:** Adição de headers `Range` e `HTTP 206` na API de artifacts.
3. **UI Error Visibility:** Exibição clara de erros no step falho.
4. **Placeholders:** Fixture real e validação E2E.
5. **Docs:** `FLUXO-JOBS-STEPS-TABS.md`.

## 🐛 Troubleshooting & Soluções

1. **Porta 3000 Ocupada:**
   - O serviço subiu na porta **3001** (`http://localhost:3001`) durante os testes.

2. **Chave Azure (Missing):**
   - A `AZURE_SPEECH_KEY` não está no repositório nem no `.env` do archive.
   - **Solução:** Deve ser pega no n8n (Credentials) ou Portal Azure e colocada no `.env.local`.

3. **Job Falho (4115ea5c):**
   - Falha no script com "fetch failed".
   - Causa provável: Timeout/Rate limit do Claude.
   - Solução UI: Mensagem de erro agora aparece na lista de passos.

## 📚 Lições Aprendidas

- **Stream Áudio:** Browsers modernos exigem `Range` headers para tocar MP3/Video decentemente. Não basta `Content-Type`.
- **Batch vs Realtime TTS:** Para textos longos (>10min), Realtime API quebra/timeout. Batch é mandatório.

## 🔗 Commits Relevantes

- `cbc62c5` (Fixes 1.5.2)
- `73f4dbc` (Gate 1.5.1 Batch TTS)
- (Ver Git Log para lista completa)
