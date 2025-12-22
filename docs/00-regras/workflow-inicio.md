# 📐 WORKFLOW DE INÍCIO DE SESSÃO v2.0

**Projeto:** Video Factory OS  
**Versão:** 2.0 (2025-12-22)  
**Anterior:** [workflow-inicio-v1.md](workflow-inicio-v1.md)

---

> [!IMPORTANT]
> ## 🔄 EXECUÇÃO OBRIGATÓRIA NO INÍCIO DE SESSÃO
>
> Ao receber este arquivo no início de uma sessão, execute os passos abaixo **NA ORDEM**.

---

## PASSO 1: Sincronização Git

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

## PASSO 2: Verificação de Ambiente

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

## PASSO 3: Leitura de Estado

### 3.1 Verificar último dia na Timeline

```bash
LAST_DAY=$(ls -1 docs/05-timeline/ | grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" | sort -r | head -1)
cat "docs/05-timeline/$LAST_DAY/README.md"
```

### 3.2 Documentos a ler (obrigatório)

| Doc | O que verificar |
|-----|-----------------|
| `docs/04-produto/prd.md` | Seções 1.4, 1.5, 2.5 (decisões, status) |
| `docs/00-regras/operacao/troubleshooting.md` | Lições aprendidas |
| Timeline do último dia | Handover e próximos passos |

### 3.3 SHA Âncora

O README da timeline deve ter:
```markdown
**Timeline covers up to:** `<SHA>`
```

Verificar que o SHA corresponde ao HEAD atual ou a um commit recente.

---

## PASSO 4: Status dos 5 Módulos

Verificar em `prd.md` seção 1.5:

| Módulo | Status Esperado |
|--------|-----------------|
| **Project Manager** | ✅ Parcial (Admin) |
| **Script Studio** | ⏳ Não implementado |
| **Voice Lab** | ⏳ Não implementado |
| **Video Factory** | ✅ Parcial (runner) |
| **Dashboard** | ✅ Implementado |

Se o status mudou, atualizar o PRD.

---

## PASSO 5: Criar Session Log do Dia

Se hoje não tem pasta na timeline:

```bash
TODAY=$(date +%Y-%m-%d)
mkdir -p "docs/05-timeline/$TODAY/sessions"
```

Criar `README.md` do dia seguindo template em `workflow-inicio-v1.md`.

---

## DURANTE A SESSÃO

### Regras de Auto-Atualização

| Após qual ação | O que atualizar |
|----------------|-----------------|
| **Decisão fundacional** | `prd.md` ou criar ADR |
| **Problema resolvido** | `troubleshooting.md` |
| **Status de módulo mudou** | Tabela 5 Módulos em `prd.md` |
| **Commit feito** | Session log com SHA |
| **Feature completa** | Adicionar a `docs/index.md` se relevante |

### Checklist de Qualidade

```
[ ] Segurança: Não expor secrets em logs/commits
[ ] Performance: Queries otimizadas
[ ] Tipagem: Sem `any`, types sincronizados
[ ] Build: Projeto compila sem erros
[ ] Docs: Session log atualizado
```

---

## FECHAMENTO DE SESSÃO (OBRIGATÓRIO)

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

## LINKS RÁPIDOS

| Recurso | Caminho |
|---------|---------|
| **Índice de Docs** | [docs/index.md](../index.md) |
| **PRD** | [docs/04-produto/prd.md](../04-produto/prd.md) |
| **Troubleshooting** | [operacao/troubleshooting.md](operacao/troubleshooting.md) |
| **ADRs** | [docs/01-adr/](../01-adr/) |
| **Timeline Atual** | [docs/05-timeline/](../05-timeline/) |

---

## PRINCÍPIOS FUNDAMENTAIS

| Princípio | Regra |
|-----------|-------|
| **Autonomia** | Executar e decidir tecnicamente, nunca pedir para usuário rodar comandos |
| **Sem achismo** | Validar no código, não assumir |
| **Entrega completa** | Nunca finalizar com "parcial" |
| **Documentação viva** | Toda sessão gera session log |
| **Idioma** | Português (Brasil) 🇧🇷 |

---

## RED FLAGS 🚨

```
🚨 Função > 50 linhas → quebrar em menores
🚨 Componente > 200 linhas → extrair sub
🚨 Arquivo > 500 linhas → modularizar
🚨 Magic numbers → criar constantes
🚨 Tipos `any` → tipar corretamente
🚨 console.log em produção → remover
```

---

**Última atualização:** 2025-12-22 | SHA: `d4d9ee9`
