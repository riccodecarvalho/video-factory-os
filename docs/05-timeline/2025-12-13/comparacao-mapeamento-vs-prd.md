# 📊 Comparação: Mapeamento ChatGPT vs PRD/Architecture

## Legenda
- ✅ = Está nos dois (alinhado)
- ⚠️ = Está no mapeamento mas não está no PRD/Architecture
- ℹ️ = Contexto adicional útil

---

## Comparação Detalhada

| Decisão | Mapeamento ChatGPT | PRD.md | Architecture.md | Gap? |
|---------|-------------------|--------|-----------------|------|
| **1. Stack Node.js** | ✅ Reuso ffmpeg, I/O, Next.js, Local-first→SaaS | ✅ Linha 173-180 | ✅ Linha 39-49 | ❌ Não |
| **2. Manifest-first** | ✅ Campos do manifest, reprodutibilidade | ✅ Linha 73-80 | ✅ Diagram Job Engine | ❌ Não |
| **3. 4 Camadas** | ✅ Core, Services, Runner, Interfaces | ✅ Linha 182-188 | ✅ Diagram completo | ❌ Não |
| **4. 5 Módulos** | ✅ Project Manager, Script Studio, Voice Lab, Video Factory, Dashboard | ❌ Não está | ❌ Não está | ⚠️ **SIM** |
| **5. Prompt-as-data** | ✅ getPromptOrThrow, versionamento | ✅ Linha 59-64, 103-108 | ✅ Config-First | ❌ Não |
| **6. Tiers de KB** | ✅ tier1/tier2/tier3, controle tokens | ❌ Não está explícito | ❌ Não está | ⚠️ **SIM** |
| **7. Pipeline steps** | ✅ 6 steps detalhados | ✅ Linha 140-152 | ✅ Job Engine flow | ❌ Não |
| **8. UI de Receitas** | ✅ Não copiar n8n, foco produto | ✅ Linha 8-9 | ❌ Não está | ⚠️ **Parcial** |
| **9. Por que sem n8n** | ✅ Custos e ganhos detalhados | ✅ Linha 5-9 | ❌ Não está | ⚠️ **Parcial** |

---

## GAPS IDENTIFICADOS

### 1. 5 Módulos do Produto ⚠️

**O que está no mapeamento e falta no PRD:**
```markdown
| Módulo | Descrição |
|--------|-----------|
| Project Manager | Projetos, episódios, presets, assets |
| Script Studio | Editor de roteiro, cenas, versionamento |
| Voice Lab | SSML, preview, normalização, cache |
| Video Factory | Composição, render, artefatos |
| Dashboard | Jobs, logs, comparação, re-run |
```

**Onde adicionar:** `04-produto/prd.md` na seção "2) Conceitos de domínio"

---

### 2. Tiers de Knowledge Base ⚠️

**O que está no mapeamento e falta no PRD:**
```markdown
| Tier | Descrição | Quando carregar |
|------|-----------|-----------------|
| tier1 | Sempre carrega (DNA, orchestrator) | Toda execução |
| tier2 | Por fase do pipeline | Contexto específico |
| tier3 | Sob demanda (schemas, exemplos) | Apenas se necessário |
```

**Onde adicionar:** `04-produto/prd.md` seção "2.3 Presets" ou nova seção "Knowledge Base Governance"

---

### 3. Racional "Por que sem n8n" ⚠️

**O que está no mapeamento e está superficial no PRD:**

PRD atual (linha 5-9):
> "substituindo o n8n e incorporando o melhor dos fluxos já validados"

Mapeamento tem mais detalhes:
- Custos do n8n (4 pontos)
- Ganhos do sistema próprio (5 pontos)

**Onde adicionar:** `04-produto/prd.md` seção "1.3 Não-objetivos" ou novo "1.4 Por que não n8n"

---

### 4. Lições Aprendidas ℹ️

**O que está no mapeamento e não está em nenhum doc:**
1. FFmpeg precisa de arquivo local — Download → Render → Upload
2. Checkpoint por etapa — Não refazer o que já está pronto
3. Filtros visuais pesados explodem tempo
4. Governança anti-cagada — Proibido hardcode/fallback silencioso

**Onde adicionar:** `00-regras/operacao/troubleshooting.md` ou novo `licoes-aprendidas.md`

---

## RECOMENDAÇÃO

1. **Adicionar ao PRD.md:**
   - Tabela dos 5 Módulos
   - Tabela de Tiers de KB
   - Seção "Por que sem n8n" mais detalhada

2. **Adicionar ao troubleshooting.md:**
   - 4 lições aprendidas operacionais

3. **Manter mapeamento como evidência:**
   - Serve como referência histórica de onde vieram as decisões
