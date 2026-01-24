# Video Factory OS - Scripts e Ferramentas

> **Diretório:** `scripts/`
> **Gerado em:** 2026-01-24

---

## NPM SCRIPTS

### Desenvolvimento

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `next dev` | Servidor de desenvolvimento (hot reload) |
| `build` | `next build` | Build de produção |
| `start` | `next start` | Servidor de produção |
| `lint` | `next lint` | ESLint |
| `clean` | `rm -rf .next` | Remove build cache |
| `reboot` | `rm -rf .next && npm run dev` | Clean + dev |

### Banco de Dados

| Script | Comando | Descrição |
|--------|---------|-----------|
| `db:generate` | `drizzle-kit generate` | Gera migrations do schema |
| `db:migrate` | `drizzle-kit migrate` | Aplica migrations |
| `db:push` | `drizzle-kit push` | Push schema direto (dev) |
| `db:studio` | `drizzle-kit studio` | GUI para explorar DB |
| `db:seed` | `tsx lib/db/seed.ts` | Seed dados iniciais |
| `db:backup` | `./scripts/backup.sh` | Backup do banco |
| `db:restore` | `./scripts/restore.sh` | Restore de backup |

### Video Factory

| Script | Comando | Descrição |
|--------|---------|-----------|
| `vf:e2e` | `tsx scripts/e2e.ts` | Testes end-to-end |

---

## SCRIPTS UTILITÁRIOS

### backup.sh

**Função:** Backup robusto do SQLite com verificação de integridade.

```bash
./scripts/backup.sh

# O que faz:
# 1. WAL checkpoint (garante dados consistentes)
# 2. Verifica integridade ANTES do backup
# 3. Cria backup via .backup (método mais seguro)
# 4. Verifica integridade do BACKUP
# 5. Mostra estatísticas (contagem de registros)
# 6. Rotação automática (mantém 20 backups)

# Output:
# backups/video-factory_YYYYMMDD_HHMMSS.db
```

**Uso recomendado:**
```bash
# Antes de cada sessão de dev
npm run db:backup

# Via cron (a cada 6 horas)
0 */6 * * * cd /path/to/video-factory-os && ./scripts/backup.sh
```

---

### restore.sh

**Função:** Restore de backup com verificação.

```bash
./scripts/restore.sh

# O que faz:
# 1. Lista backups disponíveis
# 2. Solicita seleção (interativo)
# 3. Verifica integridade do backup
# 4. Faz backup do banco atual (segurança)
# 5. Restaura o backup selecionado
# 6. Verifica integridade após restore
```

---

### e2e.ts

**Função:** Testes end-to-end do pipeline.

```bash
npm run vf:e2e

# O que testa:
# 1. Conexão com DB
# 2. Carregamento de recipes
# 3. Criação de job
# 4. Execução de steps LLM
# 5. Execução de TTS (se configurado)
# 6. Execução de render
```

---

### seed-prompts-v3.ts

**Função:** Seed completo dos prompts Graciela v3.

```bash
npx tsx scripts/seed-prompts-v3.ts

# Cria/atualiza:
# - graciela.title.v3
# - graciela.brief.v3
# - graciela.script.v3
# - graciela.script-parts.v3
# Com templates atualizados e KB tiers
```

---

### enrich-knowledge-base.ts

**Função:** Enriquece a Knowledge Base com conteúdo adicional.

```bash
npx tsx scripts/enrich-knowledge-base.ts

# Processa:
# - config/kb/tier1-dna.json
# - config/kb/tier2-hooks.json
# Insere/atualiza na tabela knowledge_base
```

---

### export-claude-project.ts

**Função:** Exporta projeto para uso com Claude Projects.

```bash
npx tsx scripts/export-claude-project.ts

# Gera em export/claude-project/:
# - GRACIELA-COMPLETO.md (todo o contexto)
# - PIPELINE.md (fluxo de execução)
# - README.md (instruções)
```

---

### fix-all-prompts-ssot.ts

**Função:** Corrige prompts para SSOT (Single Source of Truth).

```bash
npx tsx scripts/fix-all-prompts-ssot.ts

# Atualiza todos os prompts para:
# - Remover hardcode
# - Usar variáveis consistentes
# - Manter formato Stage Directions
```

---

### seed-graciela-recipe-v2.ts

**Função:** Seed da recipe Graciela v2.

```bash
npx tsx scripts/seed-graciela-recipe-v2.ts

# Cria recipe com pipeline:
# title → brief → script → parse_ssml → tts → render → export
```

---

### seed-video-preset-binding.ts

**Função:** Cria bindings de preset de vídeo.

```bash
npx tsx scripts/seed-video-preset-binding.ts

# Vincula preset de vídeo aos steps de render
```

---

### test-full-pipeline.ts

**Função:** Teste completo do pipeline (não interativo).

```bash
npx tsx scripts/test-full-pipeline.ts

# Executa:
# 1. Cria job de teste
# 2. Roda todo o pipeline
# 3. Verifica artifacts gerados
# 4. Reporta resultados
```

---

### test-render-api.ts

**Função:** Testa API de render isoladamente.

```bash
npx tsx scripts/test-render-api.ts

# Testa:
# - FFmpeg disponível
# - Render com imagem de fundo
# - Render com cor sólida
# - Fallback VideoToolbox → libx264
```

---

### test-short-generator.ts

**Função:** Testa geração de shorts (9:16).

```bash
npx tsx scripts/test-short-generator.ts

# Testa:
# - Timeline DSL para shorts
# - Render em formato vertical
# - Safe areas
```

---

### test-timeline-executor.ts

**Função:** Testa executor do Timeline DSL.

```bash
npx tsx scripts/test-timeline-executor.ts

# Testa:
# - Compilação de Timeline
# - Execução de RenderPlan
# - Concatenação de cenas
```

---

### verify-normalizer.ts

**Função:** Verifica normalização de step keys.

```bash
npx tsx scripts/verify-normalizer.ts

# Verifica mapeamento:
# - roteiro → script
# - titulo → title
# - etc
```

---

## DRIZZLE STUDIO

**Acesso:** `npm run db:studio`

Interface web para explorar o banco:
- Visualizar tabelas
- Executar queries
- Editar dados
- Exportar/importar

**URL:** http://localhost:4983

---

## FERRAMENTAS DE DEBUG

### Verificar Logs do Job

```typescript
// Via código
const job = await getJobById(jobId);
const steps = await getJobSteps(jobId);
for (const step of steps) {
  console.log(`${step.stepKey}: ${step.status}`);
  if (step.logs) console.log(JSON.parse(step.logs));
}
```

### Verificar Manifest

```typescript
// O manifest contém snapshot completo da execução
const job = await getJobById(jobId);
const manifest = JSON.parse(job.manifest);
console.log(manifest.steps);
console.log(manifest.artifacts);
console.log(manifest.metrics);
```

### Verificar Config Efetiva

```typescript
// Via app/admin/execution-map/actions.ts
import { getEffectiveConfig } from '@/app/admin/execution-map/actions';

const config = await getEffectiveConfig(recipeId, 'script', projectId);
console.log(config.prompt);
console.log(config.provider);
console.log(config.kb);
```

### Resetar Job para Retry

```sql
-- Reset job
UPDATE jobs SET status='pending', last_error=NULL WHERE id='...';

-- Reset steps
UPDATE job_steps SET status='pending', last_error=NULL, attempts=0 WHERE job_id='...';
```

---

## MANUTENÇÃO

### Limpar Artifacts Antigos

```bash
# Jobs com mais de 30 dias
find artifacts -type d -mtime +30 -exec rm -rf {} +

# Ou criar script:
npx tsx scripts/cleanup-old-artifacts.ts --days 30
```

### Verificar Integridade do Banco

```bash
sqlite3 video-factory.db "PRAGMA integrity_check;"
# Deve retornar: ok
```

### Compactar Banco (VACUUM)

```bash
sqlite3 video-factory.db "VACUUM;"
# Reduz tamanho e desfragmenta
```

### Exportar Dados

```bash
# Via Drizzle Studio ou:
sqlite3 video-factory.db ".dump" > backup.sql
```

---

*Documento gerado pela análise exaustiva do Video Factory OS.*
