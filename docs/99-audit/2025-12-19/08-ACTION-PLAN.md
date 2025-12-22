# Plano de Ação - Video Factory OS

> **Data**: 2025-12-18  
> **Total Estimado**: ~18 horas de trabalho
> **Horizonte**: 90 dias

---

## Fórmula de Priorização

```
Score = (Impacto × Frequência × BlastRadius) / Esforço
```

| Fator | Escala |
|-------|--------|
| Impacto | 1-5 (quanto valor entrega) |
| Frequência | 1-5 (quanto acontece) |
| BlastRadius | 1-5 (quanto quebra junto) |
| Esforço | 1-5 (quanto custa fazer) |

---

## ⚡ Quick Wins (0-7 dias)

| # | Ação | Impacto | Freq | Blast | Esforço | Score | Responsável |
|---|------|---------|------|-------|---------|-------|-------------|
| 1 | **Corrigir erro TS em `admin/prompts/page.tsx`** | 5 | 5 | 5 | 1 | **125** | Dev |
| 2 | **Corrigir erro TS em `scripts/fix-all-prompts-ssot.ts`** | 3 | 1 | 1 | 1 | **3** | Dev |
| 3 | **Corrigir erro TS em `scripts/fix-kb-bindings.ts`** | 3 | 1 | 1 | 1 | **3** | Dev |
| 4 | **Rodar `npm audit fix`** | 3 | 1 | 2 | 1 | **6** | Dev |
| 5 | **Criar `.eslintrc.json` básico** | 4 | 5 | 3 | 1 | **60** | Dev |

### Detalhamento dos Quick Wins

#### Quick Win #1: Corrigir admin/prompts/page.tsx
```typescript
// ANTES (linha 239):
subtitle={
    <div className="flex items-center gap-2">
        ...
    </div>
}

// DEPOIS:
// Opção A: Mudar tipo do prop para aceitar ReactNode
// Opção B: Converter para string
subtitle={`v${prompt.version} - ${prompt.slug}`}
```

#### Quick Win #2: Corrigir fix-all-prompts-ssot.ts
```typescript
// ANTES (linha 17):
eq(kb.is_active, 1)

// DEPOIS:
eq(kb.is_active, true)
```

#### Quick Win #3: Corrigir fix-kb-bindings.ts
```typescript
// Opção A: Alterar tsconfig.json target para ES2018+
// Opção B: Refatorar regex sem flag 's'
```

---

## 📅 Short-Term (7-30 dias)

| # | Ação | Impacto | Freq | Blast | Esforço | Score | Responsável |
|---|------|---------|------|-------|---------|-------|-------------|
| 1 | **Adicionar smoke tests para GP-01** | 5 | 5 | 4 | 3 | **33** | Dev |
| 2 | **Limpar diretório z-tmp (78 arquivos)** | 2 | 1 | 1 | 2 | **1** | Dev |
| 3 | **Completar step render (FFmpeg)** | 5 | 4 | 3 | 4 | **15** | Dev |
| 4 | **Documentar variáveis de ambiente** | 3 | 3 | 2 | 1 | **18** | Dev |
| 5 | **Criar RUNBOOK básico** | 4 | 3 | 2 | 2 | **12** | Dev |

### Detalhamento Short-Term #1: Smoke Tests

Criar arquivo `scripts/smoke-test.ts`:
```typescript
// Testa:
// 1. npm run build passa ✅
// 2. Cria job com recipe graciela ✅
// 3. Executa até step tts ✅
// 4. Valida artifacts gerados ✅
```

### Detalhamento Short-Term #3: Completar Render

O arquivo `lib/engine/ffmpeg.ts` já existe mas precisa:
- Integração real com FFmpeg binary
- Background images/videos
- Audio sync
- Output path correto

---

## 📆 Medium-Term (30-90 dias)

| # | Ação | Impacto | Freq | Blast | Esforço | Score | Responsável |
|---|------|---------|------|-------|---------|-------|-------------|
| 1 | **Setup GitHub Actions CI** | 4 | 5 | 3 | 3 | **20** | DevOps |
| 2 | **Completar step export** | 4 | 3 | 2 | 3 | **8** | Dev |
| 3 | **Consolidar tabelas presets** | 3 | 2 | 2 | 3 | **4** | Dev |
| 4 | **Refatorar StepPreview.tsx** | 2 | 2 | 1 | 2 | **2** | Dev |
| 5 | **Aumentar cobertura de testes** | 4 | 5 | 4 | 4 | **20** | Dev |
| 6 | **Adicionar diagramas Mermaid** | 2 | 2 | 1 | 2 | **2** | Doc |

---

## 🚦 Gates de Controle

### Gate 1: Build Funcional ✅
- [ ] Todos os 3 erros TS corrigidos
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` sem erros

### Gate 2: Qualidade Básica
- [ ] ESLint configurado e passando
- [ ] Smoke test para GP-01 criado
- [ ] z-tmp limpo

### Gate 3: Pipeline Completo
- [ ] Step render funcionando
- [ ] Step export funcionando
- [ ] Job executa do início ao fim

### Gate 4: Produção Ready
- [ ] CI/CD configurado
- [ ] Testes passando
- [ ] RUNBOOK completo
- [ ] Docs atualizados

---

## 📏 Métricas de Sucesso

| Métrica | Baseline Atual | Meta Gate 1 | Meta Gate 4 | Como Medir |
|---------|---------------|-------------|-------------|------------|
| Build Status | ❌ Falha | ✅ Passa | ✅ Passa | npm run build |
| Erros TS | 3 | 0 | 0 | npx tsc --noEmit |
| Health Score | 85% | 90% | 95% | audit matrix |
| Test Coverage | 0% | 10% | 50% | npm test --coverage |
| Pipeline Steps Funcionais | 5/7 | 5/7 | 7/7 | job execution |
| Docs Atualizados | 80% | 85% | 95% | manual review |

---

## 📋 Checklist de Execução

### Semana 1
```
[ ] Quick Win #1: Corrigir admin/prompts/page.tsx
[ ] Quick Win #2: Corrigir fix-all-prompts-ssot.ts
[ ] Quick Win #3: Corrigir fix-kb-bindings.ts
[ ] Quick Win #4: npm audit fix
[ ] Quick Win #5: Criar .eslintrc.json
[ ] Validar: npm run build passa
```

### Semana 2
```
[ ] Short-Term #1: Criar smoke-test.ts
[ ] Short-Term #2: Limpar z-tmp
[ ] Short-Term #4: Documentar env vars
[ ] Short-Term #5: Criar RUNBOOK
```

### Semana 3-4
```
[ ] Short-Term #3: Completar render step
[ ] Validar: Job executa até render
[ ] Medium-Term #1: Iniciar setup CI
```

### Mês 2-3
```
[ ] Medium-Term #2: Completar export step
[ ] Medium-Term #3: Consolidar presets
[ ] Medium-Term #5: Aumentar testes
[ ] Validar: Gate 3 completo
```

---

## 💡 Decisões Pendentes

| Decisão | Opções | Impacto | Recomendação |
|---------|--------|---------|--------------|
| Tabelas presets separadas ou unificadas? | A: Manter separadas / B: Migrar para unificada | Médio | B - simplifica código |
| Scripts de migration - arquivar? | A: Manter / B: Mover para `z-archive` | Baixo | B - são one-time |
| z-tmp - apagar ou arquivar? | A: Apagar tudo / B: Arquivar importantes | Baixo | Revisar + limpar |

---

## 📞 Contatos e Escalação

| Tipo de Problema | Quem Acionar | Como |
|------------------|--------------|------|
| Bug crítico no Engine | Dev Lead | Issue + Slack |
| Erro de build | Qualquer dev | PR fix |
| Dúvida de arquitetura | Tech Lead | Criar ADR |
| Problema de deploy | DevOps | Issue urgente |

---

*Plano gerado em 2025-12-18 | Válido por 90 dias | Revisar mensalmente*
