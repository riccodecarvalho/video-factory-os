# Video Factory OS - Gaps e Melhorias

> **Objetivo:** Documentar o que está implementado, parcial e faltando
> **Gerado em:** 2026-01-24

---

## STATUS GERAL

| Categoria | Status | Observação |
|-----------|--------|------------|
| **Core Engine** | ✅ Completo | Pipeline funcional end-to-end |
| **Admin UI** | ✅ Completo | CRUD de todas as entidades |
| **Jobs UI** | ✅ Completo | Lista, detalhes, execução |
| **Wizard Mode** | ✅ Completo | Step-by-step com aprovação |
| **Timeline DSL** | ⚠️ Parcial | Implementado mas não integrado 100% |
| **Image Generation** | ⚠️ Parcial | ImageFX funciona mas requer cookies |
| **Shorts (9:16)** | ⚠️ Parcial | Timeline profiles existem |
| **Multi-tenant** | ❌ Não implementado | Schema preparado, código não |
| **Auth** | ❌ Não implementado | Sem autenticação |
| **Queue** | ❌ Não implementado | Jobs rodam inline |

---

## FEATURES 100% FUNCIONAIS

### ✅ Pipeline de Produção
- Criação de job via UI
- Execução automática (auto mode)
- Execução step-by-step (wizard mode)
- Resume de jobs falhados/cancelados
- Retry com instrução customizada
- Manifest com snapshots completos

### ✅ LLM Integration (Claude)
- Chamadas à API Anthropic
- Template rendering com variáveis
- KB injection por tier
- Validação de output
- Tratamento de erros

### ✅ TTS Integration (Azure)
- Batch synthesis
- Múltiplas vozes
- Estilos e prosody
- SSML com pause mappings
- Extração de ZIP

### ✅ Video Render (FFmpeg)
- Render com imagem de fundo
- Render com cor sólida
- VideoToolbox (Mac)
- Fallback libx264
- Extração de thumbnail

### ✅ Admin UI
- CRUD Prompts
- CRUD Providers
- CRUD Presets (voice, video, ssml, effects)
- CRUD Validators
- CRUD Recipes
- CRUD Knowledge Base
- CRUD Projects
- Execution Map visualization

### ✅ Jobs UI
- Lista com filtros
- Detalhes com tabs
- Artifacts viewer
- Logs viewer
- Manifest viewer
- Config viewer

### ✅ Backup/Restore
- Backup com integrity check
- Rotação automática
- Restore interativo

---

## FEATURES PARCIALMENTE IMPLEMENTADAS

### ⚠️ Timeline DSL

**O que funciona:**
- Schema de Timeline definido
- Compiler para RenderPlan
- Executor básico
- Format profiles (longform/shorts)

**O que falta:**
- Integração completa com runner
- UI para edição de timeline
- Suporte a múltiplas camadas de vídeo
- Efeitos e transições

**Arquivos:**
- `lib/timeline/schema.ts`
- `lib/timeline/compiler.ts`
- `lib/timeline/render-plan.ts`
- `lib/timeline/validator.ts`

---

### ⚠️ Geração de Imagens (ImageFX)

**O que funciona:**
- Adapter para ImageFX API
- Sanitização de prompts
- Geração de imagens

**O que falta:**
- API pública (requer cookies de sessão)
- UI para configurar cookies
- Fallback para outros providers
- Rate limiting

**Arquivos:**
- `lib/adapters/imagefx.ts`
- `lib/engine/executors/generate-images.ts`

---

### ⚠️ Shorts (9:16)

**O que funciona:**
- Format profile 1080x1920
- Safe areas definidos
- Encoder preset

**O que falta:**
- Pipeline específico para shorts
- Clipping automático de áudio
- Legendas estilo TikTok
- Multi-clip generation

**Arquivos:**
- `lib/engine/short-generator.ts`
- `lib/timeline/schema.ts` (FORMAT_PRESETS)

---

### ⚠️ Script Studio

**O que funciona:**
- Tabela script_versions
- Tabela scene_markers

**O que falta:**
- UI de edição de roteiro
- Versionamento visual
- Diff entre versões
- Marcadores de cena interativos

**Arquivos:**
- `lib/db/schema.ts` (scriptVersions, sceneMarkers)
- `app/admin/script-studio/` (pasta existe mas vazia)

---

## FEATURES NÃO IMPLEMENTADAS

### ❌ Autenticação

**Schema preparado:**
```typescript
// Em jobs
ownerUserId: text('owner_user_id'),
createdBy: text('created_by'),
```

**O que falta:**
- Provider de auth (NextAuth, Clerk, etc)
- Middleware de proteção de rotas
- UI de login/logout
- Permissões por role

---

### ❌ Multi-tenant

**Schema preparado:**
```typescript
// Projects como tenants
// Bindings por project
```

**O que falta:**
- Isolamento de dados por tenant
- Seletor de projeto global
- Filtros automáticos por projeto

---

### ❌ Queue/Background Jobs

**Atual:**
- Jobs rodam inline no processo Node
- Apenas um job por vez

**O que falta:**
- Queue system (Bull, BullMQ)
- Workers separados
- Priorização
- Retry automático

**Schema preparado:**
```typescript
// Em jobs
priorityTier: text('priority_tier').default('standard'),
queuePosition: integer('queue_position'),
etaSeconds: integer('eta_seconds'),
```

---

### ❌ Webhooks/Notificações

**O que falta:**
- Webhook para job completed/failed
- Notificações por email
- Integração com Slack/Discord

---

### ❌ API REST Pública

**Atual:**
- Apenas Server Actions (Next.js)
- API routes internas

**O que falta:**
- API REST documentada
- Autenticação por API key
- Rate limiting
- OpenAPI/Swagger

---

### ❌ Métricas/Dashboard

**Atual:**
- Métricas básicas no manifest
- Sem dashboard

**O que falta:**
- Dashboard de métricas
- Histórico de uso
- Custos por API
- Performance por step

---

## DÉBITO TÉCNICO

### Alta Prioridade

1. **Testes automatizados**
   - Sem unit tests
   - Sem integration tests
   - Apenas e2e manual

2. **Error handling consistente**
   - Alguns erros não são tratados
   - Mensagens inconsistentes

3. **Logging estruturado**
   - Console.log manual
   - Sem log rotation
   - Sem log aggregation

### Média Prioridade

1. **Otimização de queries**
   - Algumas queries N+1
   - Sem indexes explícitos

2. **Validação de input**
   - Zod parcialmente usado
   - Alguns endpoints sem validação

3. **Cache**
   - Sem cache de configs
   - Recarrega do DB a cada request

### Baixa Prioridade

1. **Documentação inline**
   - JSDoc parcial
   - Alguns tipos Any

2. **Código duplicado**
   - Alguns patterns repetidos
   - Oportunidade de refactor

---

## SUGESTÕES DE MELHORIA

### Curto Prazo (Semanas)

1. **Testes básicos**
   ```
   - Vitest para unit tests
   - Playwright para e2e
   - Cobertura das funções críticas
   ```

2. **Logging melhorado**
   ```
   - Pino ou Winston
   - Structured logging
   - Log levels por ambiente
   ```

3. **Health checks expandidos**
   ```
   - DB connectivity
   - API keys válidas
   - FFmpeg disponível
   - Disk space
   ```

### Médio Prazo (Meses)

1. **Queue system**
   ```
   - BullMQ para jobs
   - Workers separados
   - Dashboard de queue
   ```

2. **Auth básico**
   ```
   - NextAuth com credentials
   - Ou Clerk/Auth0
   - Roles: admin, operator
   ```

3. **API REST**
   ```
   - Endpoints públicos
   - API key auth
   - Rate limiting
   ```

### Longo Prazo (Trimestres)

1. **Multi-tenant completo**
   ```
   - Isolamento por tenant
   - Billing por tenant
   - Custom domains
   ```

2. **Render farm**
   ```
   - Workers distribuídos
   - GPU rendering
   - Auto-scaling
   ```

3. **IA avançada**
   ```
   - Fine-tuning de modelos
   - Feedback loop
   - A/B testing de prompts
   ```

---

## TODOs ENCONTRADOS NO CÓDIGO

```bash
# Busca por TODOs
grep -r "TODO" --include="*.ts" --include="*.tsx" lib/ app/
```

### Exemplos:
- `// TODO: Implementar retry automático`
- `// TODO: Adicionar cache`
- `// TODO: Melhorar error message`

---

## CONCLUSÃO

O Video Factory OS está **funcional para produção básica** de vídeos. O pipeline core (LLM → TTS → Render) funciona bem. As principais lacunas são:

1. **Segurança:** Sem auth, qualquer um pode acessar
2. **Escalabilidade:** Sem queue, apenas um job por vez
3. **Observabilidade:** Logs e métricas básicas

Para uso em produção real, recomenda-se priorizar:
1. Autenticação básica
2. Queue para jobs
3. Monitoramento

---

*Documento gerado pela análise exaustiva do Video Factory OS.*
