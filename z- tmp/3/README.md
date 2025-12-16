# Prompts — Verdades de Graciela

Prompts para automação do pipeline de conteúdo do canal.

---

## Pipeline (Ordem de Uso)

```
PRÉ-PRODUÇÃO:
├── prompt-ideacao-v1      → Gerar ideias de histórias
└── prompt-titulos-v4      → Gerar títulos virais

PRODUÇÃO:
├── prompt-planejamento-v4 → Planejar história (JSON)
├── prompt-roteiro-v3      → Gerar roteiro narrado
├── prompt-thumbnails-v3   → Gerar prompt de imagem
└── prompt-descricao-v1    → Gerar descrição + comentário

PÓS-PRODUÇÃO:
└── prompt-tags-v1         → Gerar tags SEO

ENGAJAMENTO:
└── prompt-community-v1    → Gerar community posts
```

---

## Índice de Prompts

| Prompt | Versão | Linhas | Função |
|--------|:------:|:------:|--------|
| [prompt-ideacao](prompt-ideacao-v1.md) | v1 | 543 | Gerar ideias de histórias |
| [prompt-titulos](prompt-titulos-v4.md) | v4 | 995 | Gerar títulos virais |
| [prompt-planejamento](prompt-planejamento-v4.md) | v4 | 989 | Planejar história (JSON) |
| [prompt-roteiro](prompt-roteiro-v3.md) | v3 | 722 | Gerar roteiro narrado |
| [prompt-thumbnails](prompt-thumbnails-v3.md) | v3 | 1007 | Gerar prompt de imagem |
| [prompt-descricao](prompt-descricao-v1.md) | v1 | 630 | Descrição + comentário |
| [prompt-tags](prompt-tags-v1.md) | v1 | 353 | Tags SEO YouTube |
| [prompt-community](prompt-community-v1.md) | v1 | 373 | Community posts |

**Total:** ~5.612 linhas | 8 prompts

---

## Versões Anteriores

Prompts deprecados estão em `/old/`.

---

## Documentação Completa

Ver ADR: [`../adr/0001-adr-pipeline-prompts.md`](../adr/0001-adr-pipeline-prompts.md)

---

**Última atualização:** 2025-12-15
