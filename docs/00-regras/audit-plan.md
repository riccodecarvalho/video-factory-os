# 🕵️‍♂️ PLANO TÁTICO DE AUDITORIA (AS-IS)

> **Status:** Em Execução
> **Auditor:** Antigravity (Persona: Elite Consultant)
> **Data:** 2025-12-19

## 1. 🏗️ Inventário e Integridade Estrutural
- [ ] **Mapeamento de Filesystem:** Listar estrutura completa (profundidade 3) para identificar "lixo" e desvios.
- [ ] **Verificação de Regras (`docs/00-regras/`):**
    - [ ] `00-regras/nomenclatura.md` vs Realidade
    - [ ] `00-regras/workflow-inicio.md` vs Prática
- [ ] **Análise de Dependências:** `package.json` vs Imports reais (Zombie libs).

## 2. 📚 Integridade Documental
- [ ] **PRD Check:** Itens do `prd.md` marcados como "Done" realmente existem?
- [ ] **Timeline Check:** O último SHA da timeline bate com o `git log`?
- [ ] **ADR Compliance:** As decisões de arquitetura (`docs/01-adr/`) estão sendo seguidas?

## 3. ⚙️ Integridade Funcional (Deep Dive)
- [ ] **Pipeline Smoke Test:** Executar um job dummy controlável.
- [ ] **Config-First Audit:** Buscar strings hardcoded em `app/`, `lib/` e `steps/`.
- [ ] **Provider Check:** As chaves de API/Configs estão isoladas corretamente?

## 4. 🚑 Relatório e Remediação
- [ ] Compilar **Relatório de Gaps**.
- [ ] Definir **Plano de Remediação Imediata** (Quick Wins).
- [ ] Definir **Roadmap de Estabilização** (Long Term).
