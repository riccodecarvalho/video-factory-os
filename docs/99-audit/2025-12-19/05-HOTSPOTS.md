# 05-HOTSPOTS & RISCOS

**Data:** 2025-12-19

## 🔥 Hotspots (Complexidade & Risco)

### 1. `lib/engine/runner.ts` (The Monolith)
- **Risco:** Alto
- **Por quê:** Centraliza toda a execução (LLM, TTS, Render). Contém lógica de negócio misturada com orquestração.
- **Sintoma:** Uso excessivo de `any` em `previousOutputs`.
- **Mitigação:** Quebrar em `runners/llm.ts`, `runners/tts.ts` etc.

### 2. `lib/engine/ffmpeg.ts` (The Blocker)
- **Risco:** Crítico (P0)
- **Por quê:** Importa `server-only`, quebrando scripts de automação/CLI que tentam importar o engine.
- **Mitigação:** Remover `server-only` (já que Codec logic pode ser isomórfica ou Node-only, mas não necessariamente Next.js Server Component only) ou isolar em sub-arquivo.

### 3. `scripts/e2e.ts` (The Blind Spot)
- **Risco:** Alto
- **Por quê:** É a única validação E2E. Se está quebrada, voamos às cegas.
- **Mitigação:** Torná-lo robusto e parte do CI.

## 🏚️ Código Morto / Órfão

### 1. `recipes/graciela` (Diretório)
- **Status:** Duvidoso
- **Por quê:** Contém apenas `assets/`. A definição da receita está hardcoded no seed script (`scripts/seed-graciela-recipe-v2.ts`).
- **Problema:** Viola o princípio de "Recipes as Code" se o JSON não estiver lá.

### 2. `lib/audit`
- **Status:** Vazio/Desconhecido
- **Por quê:** Mapeado na estrutura, mas sem utilidade clara detectada.

## 📉 Debt Técnico
- **Prerender Crash:** O app quebra o build se o DB não estiver pronto. Isso acopla Build Time com Runtime Data.
- **Config Hardcoded em Seed:** Receitas definidas dentro de strings JSON em arquivos `.ts` em vez de arquivos `.json` puros carregados.
