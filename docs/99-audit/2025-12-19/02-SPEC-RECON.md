# 02-SPEC-RECON (Especificação Reconstruída)

**Data:** 2025-12-19
**Base:** Código-fonte (`lib/engine`, `lib/db`, `scripts`) vs PRD

## 1. O Pipeline Real
Diferente do n8n, o pipeline é definido via **JSON no Banco de Dados** (tabela `recipes`).
A receita principal detectada (`graciela-youtube-long` v2) segue um fluxo linear de 12 etapas com chaves em **Português**:

| Passo | Key | Tipo | Responsável |
|-------|-----|------|-------------|
| 1 | `ideacao` | LLM | Claude |
| 2 | `titulo` | LLM | Claude |
| 3 | `planejamento` | LLM | Claude |
| 4 | `roteiro` | LLM | Claude |
| 5 | `parse_ssml` | Transform | Script Normalizer |
| 6 | `tts` | TTS | Azure Speech |
| 7 | `renderizacao` | Render | FFmpeg (VideoToolbox) |
| 8 | `exportacao` | Export | Sistema de Arquivos |
| 9 | `miniaturas` | LLM | Claude |
| 10 | `descricao` | LLM | Claude |
| 11 | `tags` | LLM | Claude |
| 12 | `comunidade` | LLM | Claude |

## 2. Config-First Architecture
O sistema implementa rigorosamente o conceito "Config-First":
- **Execution Bindings:** Tabela `execution_bindings` mapeia cada passo a um Prompt e Presets.
- **Prompts:** Tabela `prompts` armazena templates. Hardcoding é proibido.
- **Presets:** Tabelas dedicadas para `presets_voice`, `presets_video`, `presets_ssml`.

## 3. Discrepâncias vs PRD
- **Script Studio:** O PRD menciona "Script Studio" como módulo. O código possui tabelas (`script_versions`, `scene_markers`), mas na recipe o passo é apenas `roteiro` (LLM). Isso indica que a interface de edição manual ainda não está integrada ao fluxo automatizado ou é feita pós-geração.
- **Normalização de Voz:** O código em `lib/engine/runner.ts` chama `normalizeScriptToSingleVoice` no passo `transform`. Isso é uma regra de negócio hardcoded (compatibilidade "Ximena") dentro de um runner genérico.
- **Idioma das Keys:** O sistema usa chaves internas em PT-BR (`roteiro`), mas o `step-mapper.ts` suporta aliases EN (`script`). O frontend deve lidar com essa tradução.

## 4. Modelo de Dados (Drizzle SQLite)
- Estrutura robusta com suporte a **Idempotência** (`input_hash` em `job_steps`).
- **Artifacts:** Tabela centralizada para outputs (`uri`, `checksum`).
- **Audit:** Tabela `audit_events` pronta para rastrear mudanças no Admin.

## 5. Veredito da Especificação
O sistema está **mais avançado que um MVP de automação**, com arquitetura de plataforma (bindings, presets, recipes). A complexidade principal está na *orquestração* (Runner) e na *garantia de configuração* (muitos `load*` functions que podem falhar se o DB não estiver seedado).
