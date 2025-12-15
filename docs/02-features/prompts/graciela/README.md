# Prompts — Verdades de Graciela v2

Pipeline completo de 8 prompts LLM para automação do canal "Verdades de Graciela".

---

## Pipeline Completo (12 Steps)

```
PRÉ-PRODUÇÃO (2 steps):
├── ideacao         (llm) → Gerar ideias de histórias
└── titulo          (llm) → Gerar títulos virais (CTR 5-8%)

PRODUÇÃO CORE (6 steps):
├── planejamento    (llm) → JSON estruturado (32 técnicas + 7 atos)
├── roteiro         (llm) → Roteiro narrado (~6000 palavras)
├── parse_ssml      (transform) → Limpar marcações SSML
├── tts             (tts) → Azure Batch TTS (es-ES-XimenaMultilingualNeural)
├── renderizacao    (render) → FFmpeg render
└── exportacao      (export) → Pacote final

PÓS-PRODUÇÃO (3 steps):
├── miniaturas      (llm) → Prompt de imagem (layout ANTES→DEPOIS)
├── descricao       (llm) → Descrição YouTube + comentário fixado
└── tags            (llm) → Tags SEO (15-30 tags)

ENGAJAMENTO (1 step):
└── comunidade      (llm) → Community posts
```

---

## Prompts no Banco

| Slug | Nome | Categoria | Versão |
|------|------|-----------|:------:|
| `graciela.ideacao.v2` | Graciela - Ideação de Histórias | ideacao | v2 |
| `graciela.titulo.v2` | Graciela - Títulos Virais | titulo | v2 |
| `graciela.planejamento.v2` | Graciela - Planejamento Estruturado | planejamento | v2 |
| `graciela.roteiro.v2` | Graciela - Roteiro Narrado | roteiro | v2 |
| `graciela.miniaturas.v2` | Graciela - Miniaturas (Thumbnails) | miniaturas | v2 |
| `graciela.descricao.v2` | Graciela - Descrição YouTube | descricao | v2 |
| `graciela.tags.v2` | Graciela - Tags SEO | tags | v2 |
| `graciela.comunidade.v2` | Graciela - Community Posts | comunidade | v2 |

---

## Decisões Implementadas

### 1. Substituição de Brief por Planejamento

**Antes (v1):** `title → brief → script`

**Agora (v2):** `title → planejamento → script`

**Motivo:** `planejamento.v2` é 16x mais complexo (989 linhas vs 6), gera JSON estruturado com 32 técnicas narrativas.

### 2. Nomenclatura PT-BR

Step keys: `ideacao`, `titulo`, `planejamento`, `roteiro`, `miniaturas`, `descricao`, `tags`, `comunidade`

### 3. Versionamento v2

Todos resetados para v2 (novo começo unificado).

---

## Documentação de Referência

Arquivos `.md` completos (~5.600 linhas total):

```
docs/02-features/prompts/graciela/reference/
├── ideacao-v2.md       (543 linhas)
├── titulo-v2.md        (995 linhas)
├── planejamento-v2.md  (989 linhas)
├── roteiro-v2.md       (722 linhas)
├── miniaturas-v2.md    (1007 linhas)
├── descricao-v2.md     (630 linhas)
├── tags-v2.md          (353 linhas)
└── comunidade-v2.md    (373 linhas)
```

---

**Versão:** 2.0  
**Data:** 2025-12-15  
**Gate:** 1.7 — Prompt Governance (Graciela)
