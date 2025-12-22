# 📐 WORKFLOW DE INÍCIO DE SESSÃO v2.1

**Projeto:** Video Factory OS  
**Versão:** 2.1 (2025-12-22)


---

> [!IMPORTANT]
> ## 🔄 EXECUÇÃO OBRIGATÓRIA NO INÍCIO DE SESSÃO
>
> Ao receber este arquivo no início de uma sessão, execute os passos abaixo **NA ORDEM**.
> O objetivo é que você tenha **contexto completo** do projeto antes de qualquer ação.

---

# PARTE 0: MAPA COMPLETO DO PROJETO

## 📁 Estrutura de Documentação

```
docs/
├── index.md                    # Índice master - links rápidos para tudo
├── FLUXO-JOBS-STEPS-TABS.md    # Diagrama do pipeline de vídeo
│
├── 00-regras/                  # REGRAS E CONVENÇÕES
│   ├── workflow-inicio.md      # ⭐ ESTE ARQUIVO
│   ├── workflow-inicio-v1.md   # Versão anterior (referência)
│   ├── nomenclatura.md         # Convenções de nomes
│   ├── audit-*.md              # Documentos de auditoria
│   ├── operacao/
│   │   ├── troubleshooting.md  # ⭐ LIÇÕES APRENDIDAS (ler sempre!)
│   │   └── manual-modelos-ia.md
│   └── design-system/
│       └── ui-guidelines.md
│
├── 01-adr/                     # DECISÕES ARQUITETURAIS
│   ├── 2025-12-13-adr-001-stage-directions.md
│   ├── 2025-12-13-adr-004-design-system.md
│   ├── 2025-12-13-adr-005-ui-baseline-4pice-reference.md
│   ├── 2025-12-13-adr-006-ui-patterns-parity-4pice.md
│   ├── 2025-12-13-adr-007-engine-execution-model.md
│   ├── 2025-12-13-adr-008-project-context-execution-bindings.md
│   ├── 2025-12-16-adr-009-azure-tts-zip-extraction.md
│   ├── 2025-12-16-adr-010-projects-hub.md
│   ├── 2025-12-19-adr-011-wizard-mode.md
│   └── 2025-12-19-adr-012-backup-sqlite.md
│
├── 02-features/                # FEATURES DOCUMENTADAS
│   ├── 00-information-architecture.md
│   ├── 01-domain-model.md
│   ├── 02-manifest-contract.md
│   ├── pipeline-fluxo-tabs.md
│   ├── pipeline-map.md
│   └── prompts/                # Prompts por categoria
│
├── 03-development/             # UI E DESENVOLVIMENTO
│   ├── ds-changelog.md         # Changelog do Design System
│   ├── ds-spec.md              # Especificação do Design System
│   └── ui-reference.md         # Referência de componentes UI
│
├── 04-produto/                 # ⭐ DOCUMENTOS CORE DO PRODUTO
│   ├── prd.md                  # ⭐ PRD PRINCIPAL (seções 1.4, 1.5, 2.5)
│   ├── architecture.md         # Arquitetura técnica
│   ├── milestones.md           # Fases e entregas
│   └── qa-acceptance.md        # Critérios de aceite
│
├── 05-timeline/                # ⭐ TIMELINE CRONOLÓGICA (fonte da verdade)
│   ├── 2025-12-13/             # Dia a dia do projeto
│   ├── 2025-12-14/
│   ├── 2025-12-15/
│   ├── 2025-12-16/
│   ├── 2025-12-17/
│   ├── 2025-12-18/
│   ├── 2025-12-19/
│   └── 2025-12-22/             # ← Último dia
│       ├── README.md           # Resumo do dia + SHA âncora
│       └── sessions/           # Logs de sessão detalhados
│
├── 06-archive/                 # ARQUIVOS ARQUIVADOS
│   ├── external-logs/          # Logs de chats externos (ChatGPT, etc)
│   └── z-tmp-consolidation-*.md
│
└── 99-audit/                   # AUDITORIAS E RELATÓRIOS
    └── 2025-12-19/             # Auditoria Big 4
        ├── 00-REALITY-CHECK.md
        ├── 01-GOLDEN-PATHS.md
        ├── 02-DISCOVERY-REPORT.md
        ├── 03-INVENTORY.md
        ├── 04-DEPENDENCY-GRAPH.md
        ├── 05-HEALTH-CHECK-MATRIX.md
        ├── 06-DEAD-CODE-SWEEP.md
        ├── 07-EXECUTIVE-SUMMARY.md
        ├── 08-ACTION-PLAN.md
        └── 09-RUNBOOK.md
```

---

## 📋 Quando Consultar Cada Pasta

| Pasta | Quando Consultar | O que Contém |
|-------|------------------|--------------|
| `00-regras/` | **SEMPRE no início** | Regras operacionais, troubleshooting, nomenclatura |
| `01-adr/` | Antes de decisões arquiteturais | Histórico de decisões documentadas |
| `02-features/` | Ao implementar features | Specs de features, pipeline, prompts |
| `03-development/` | Ao criar/modificar UI | Design System, componentes, changelog |
| `04-produto/` | **SEMPRE no início** | PRD, arquitetura, milestones, QA |
| `05-timeline/` | **SEMPRE no início** | Estado atual, handover, SHA âncora |
| `06-archive/` | Quando precisar de referência histórica | Logs antigos, arquivos arquivados |
| `99-audit/` | Para diagnóstico/troubleshooting | Relatórios de auditoria |

---

## 🎯 Status dos 5 Módulos do Produto

| Módulo | Descrição | Status Atual |
|--------|-----------|--------------|
| **Project Manager** | Projetos, episódios, presets, biblioteca | ✅ Parcial (Admin) |
| **Script Studio** | Editor de roteiro, segmentação em cenas | ⏳ Não implementado |
| **Voice Lab** | Editor SSML, preview por cena, TTS | ⏳ Não implementado |
| **Video Factory** | Composição, render FFmpeg, artefatos | ✅ Parcial (runner) |
| **Dashboard** | Lista de jobs, logs, re-run | ✅ Implementado |

---

## 🏗️ Estrutura de Código

```
video-factory-os/
├── app/                        # Next.js App Router
│   ├── (dashboard)/            # Grupo de rotas dashboard
│   ├── admin/                  # Páginas de administração
│   ├── api/                    # API Routes
│   ├── jobs/                   # Páginas de jobs
│   └── wizard/                 # Modo wizard
│
├── components/                 # Componentes React
│   ├── layout/                 # AppShell, Sidebar, etc
│   ├── ui/                     # Componentes base (shadcn)
│   └── vf/                     # Componentes Video Factory
│
├── lib/                        # Bibliotecas
│   ├── db/                     # Schema Drizzle + seed
│   ├── engine/                 # Job engine + executors
│   ├── adapters/               # Claude, Azure, FFmpeg
│   └── transformers/           # Transformações de dados
│
├── config/                     # Configurações JSON
│   ├── kb/                     # Knowledge Base tiers
│   ├── presets/                # Presets de voz, vídeo, efeitos
│   ├── prompts/                # Prompts JSON
│   ├── recipes/                # Receitas
│   └── validators/             # Validadores
│
├── recipes/                    # Assets por receita
│   └── graciela/
│
└── jobs/                       # Outputs (gitignored)
```

---

# PARTE 1: SINCRONIZAÇÃO GIT

```bash
# 1.1 Fetch e status
git fetch origin
git status

# 1.2 Se divergiu, sincronizar
git pull --rebase origin main

# 1.3 Verificar últimos commits
git log --oneline -10
```

**Esperado:** Branch `main` sincronizado com `origin/main`.

---

# PARTE 2: VERIFICAÇÃO DE AMBIENTE

```bash
# 2.1 Verificar build
npm run build 2>&1 | tail -20

# 2.2 Se falhar por dependências
npm install

# 2.3 Se falhar por banco corrompido
npm run db:push && npm run db:seed
```

**Esperado:** Build passa sem erros.

---

# PARTE 3: LEITURA DE ESTADO

## 3.1 Timeline do Último Dia

```bash
LAST_DAY=$(ls -1 docs/05-timeline/ | grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" | sort -r | head -1)
cat "docs/05-timeline/$LAST_DAY/README.md"
```

## 3.2 Documentos Obrigatórios

| Doc | O que Verificar |
|-----|-----------------|
| `docs/04-produto/prd.md` | Seções 1.4 (por que não n8n), 1.5 (5 módulos), 2.5 (Knowledge Base) |
| `docs/00-regras/operacao/troubleshooting.md` | Lições aprendidas recentes |
| `docs/index.md` | Links e status geral |
| Timeline do último dia | Handover, próximos passos, SHA âncora |

## 3.3 Verificar SHA Âncora

```markdown
**Timeline covers up to:** `<SHA>`
```

Comparar com `git log --oneline -1`. Devem estar próximos.

---

# PARTE 4: CRIAR SESSION LOG (se necessário)

```bash
TODAY=$(date +%Y-%m-%d)
mkdir -p "docs/05-timeline/$TODAY/sessions"
```

Criar `README.md` do dia usando template de dias anteriores.

---

# PARTE 5: REGRAS DURANTE A SESSÃO

## 5.1 Regras de Auto-Atualização

| Após Qual Ação | O que Atualizar |
|----------------|-----------------|
| **Decisão fundacional** | `04-produto/prd.md` ou criar ADR em `01-adr/` |
| **Decisão arquitetural** | Criar ADR em `01-adr/` |
| **Problema resolvido** | `00-regras/operacao/troubleshooting.md` |
| **Status de módulo mudou** | Tabela 5 Módulos em `prd.md` seção 1.5 |
| **Commit feito** | Session log com SHA |
| **Feature completa** | `index.md` e `02-features/` se relevante |
| **UI/componente novo** | `03-development/` |

## 5.2 Checklist de Qualidade

```
[ ] Segurança: Não expor secrets em logs/commits
[ ] Performance: Queries otimizadas
[ ] Tipagem: Sem `any`, types sincronizados
[ ] Build: Projeto compila sem erros
[ ] Docs: Session log atualizado
```

## 5.3 Red Flags 🚨

```
🚨 Função > 50 linhas → quebrar em menores
🚨 Componente > 200 linhas → extrair sub
🚨 Arquivo > 500 linhas → modularizar
🚨 Magic numbers → criar constantes
🚨 Tipos `any` → tipar corretamente
🚨 console.log em produção → remover
```

---

# PARTE 6: FECHAMENTO DE SESSÃO

```bash
# 1. Verificar mudanças
git status

# 2. Commitar pendentes
git add .
git commit -m "docs: <descrição>"

# 3. Push
git push origin main

# 4. Atualizar SHA âncora no README do dia
# **Timeline covers up to:** `<SHA FINAL>`
```

---

# PARTE 7: PRINCÍPIOS FUNDAMENTAIS

| Princípio | Regra |
|-----------|-------|
| **Autonomia** | Executar e decidir tecnicamente, NUNCA pedir para usuário rodar comandos |
| **Sem achismo** | Validar no código, não assumir |
| **Entrega completa** | Nunca finalizar com "parcial", fechar com evidência |
| **Documentação viva** | Toda sessão gera session log + atualiza README do dia |
| **Prompts do banco** | NUNCA hardcodar prompts no código |
| **Dados reais** | Calcular antes de enviar para IA |
| **Idioma** | Português (Brasil) 🇧🇷 |

---

# LINKS RÁPIDOS

| Recurso | Caminho |
|---------|---------|
| **Índice Master** | [docs/index.md](../index.md) |
| **PRD** | [docs/04-produto/prd.md](../04-produto/prd.md) |
| **Arquitetura** | [docs/04-produto/architecture.md](../04-produto/architecture.md) |
| **Troubleshooting** | [operacao/troubleshooting.md](operacao/troubleshooting.md) |
| **ADRs** | [docs/01-adr/](../01-adr/) |
| **Features** | [docs/02-features/](../02-features/) |
| **Timeline** | [docs/05-timeline/](../05-timeline/) |
| **Auditoria** | [docs/99-audit/](../99-audit/) |

---

**Última atualização:** 2025-12-22 | SHA: `81c0de7`
