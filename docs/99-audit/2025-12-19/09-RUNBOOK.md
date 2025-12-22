# Runbook Operacional - Video Factory OS

> **Versão**: 1.0  
> **Data**: 2025-12-18

---

## 1. Como Rodar Local

### Pré-requisitos
- Node.js v18+ (testado em v25.2.1)
- npm v9+ (testado em 11.6.2)
- FFmpeg instalado (para step render)

### Setup

```bash
# 1. Clonar repositório
git clone <repo-url>
cd video-factory-os

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com as chaves necessárias

# 4. Inicializar banco de dados
npm run db:push
npm run db:seed  # Opcional: popular com dados iniciais

# 5. Rodar em modo desenvolvimento
npm run dev

# 6. Acessar
# http://localhost:3000
```

---

## 2. Variáveis de Ambiente

| Variável | Descrição | Obrigatória? | Onde Obter |
|----------|-----------|--------------|------------|
| `ANTHROPIC_API_KEY` | Chave da API Claude | ✅ Sim | console.anthropic.com |
| `AZURE_SPEECH_KEY` | Chave Azure TTS | ✅ Sim | portal.azure.com |
| `AZURE_SPEECH_REGION` | Região Azure (ex: eastus) | ✅ Sim | portal.azure.com |

### Exemplo .env.local
```bash
ANTHROPIC_API_KEY=sk-ant-...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus
```

---

## 3. Como Validar os Golden Paths

### GP-01: Criar e Executar Job
```bash
# Via interface:
1. Acessar http://localhost:3000/jobs/new
2. Selecionar recipe "graciela"
3. Preencher título, brief, tema
4. Clicar "Criar Job"
5. Acompanhar execução em /jobs/{id}
6. Verificar tabs: Pipeline, Artifacts, Logs

# Via E2E script:
npm run vf:e2e

# Resultado esperado:
- Job status: completed (ou failed em step render - é stub)
- Artifacts: title/output.txt, brief/output.txt, script/output.txt, tts/audio.mp3
```

### GP-02: Dashboard
```bash
# Acessar
http://localhost:3000

# Verificar
- Cards de métricas mostram dados
- Jobs recentes aparecem
- Links navegam corretamente
```

---

## 4. Onde Ver Logs

| Contexto | Onde | Como Acessar |
|----------|------|--------------|
| Dev local | Terminal | `npm run dev` - logs no console |
| Job execution | UI | `/jobs/{id}` → Tab Logs |
| Manifest completo | UI | `/jobs/{id}` → Tab Manifest |
| Build errors | Terminal | `npm run build` |
| Type errors | Terminal | `npx tsc --noEmit` |

---

## 5. Como Debugar Problemas Comuns

### Problema: Build falha com erro de tipo
```bash
# Verificar erros específicos
npx tsc --noEmit

# Corrigir um por um
# Os 3 erros atuais:
# - admin/prompts/page.tsx:239
# - scripts/fix-all-prompts-ssot.ts:17
# - scripts/fix-kb-bindings.ts:98
```

### Problema: Job fica travado em "running"
```bash
# Verificar logs do job
# UI: /jobs/{id} → Tab Logs

# Verificar se provider está configurado
# Admin: /admin/providers

# Verificar variáveis de ambiente
cat .env.local | grep -E "(ANTHROPIC|AZURE)"
```

### Problema: LLM retorna erro
```bash
# Causas comuns:
# 1. API key inválida
# 2. Cota excedida
# 3. Prompt muito longo

# Verificar na UI:
# /jobs/{id} → Tab Logs (erro detalhado)
# /jobs/{id} → Tab Manifest (request/response)
```

### Problema: TTS falha
```bash
# Verificar Azure credentials
echo $AZURE_SPEECH_KEY
echo $AZURE_SPEECH_REGION

# Verificar voice preset configurado
# Admin: /admin/execution-map → Step TTS
```

### Problema: Render não funciona
```bash
# NOTA: Step render é STUB atualmente
# Ele não gera vídeo real

# Para completar, implementar em:
# lib/engine/ffmpeg.ts
```

---

## 6. Como Reprocessar Jobs/Steps

### Retry de Step Falhado
```bash
# Via UI:
1. Acessar /jobs/{id}
2. Tab Pipeline
3. Clicar no step com erro
4. Clicar botão "Retry"
```

### Recriar Job do Zero
```bash
# Via UI:
1. Acessar /jobs/new
2. Preencher mesmos dados
3. Criar novo job
```

---

## 7. Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Rodar dev server
npm run build        # Build de produção
npm run start        # Rodar build em produção
npm run lint         # Lint (precisa configurar)
npx tsc --noEmit     # Type check
```

### Banco de Dados
```bash
npm run db:generate  # Gerar migrations
npm run db:push      # Push schema para DB
npm run db:studio    # Abrir Drizzle Studio (GUI)
npm run db:seed      # Popular dados iniciais
```

### Scripts Utilitários
```bash
npm run vf:e2e       # Rodar teste E2E
tsx scripts/e2e.ts   # Mesmo que acima
```

---

## 8. Estrutura de Artifacts

```
artifacts/
└── {jobId}/
    ├── title/
    │   └── output.txt      # Títulos gerados
    ├── brief/
    │   └── output.txt      # Brief expandido
    ├── script/
    │   └── output.txt      # Roteiro completo
    ├── parse_ssml/
    │   └── output.txt      # Roteiro limpo
    ├── tts/
    │   └── audio.mp3       # Áudio narrado
    └── render/
        └── video.mp4       # Vídeo (quando implementado)
```

---

## 9. Contatos e Escalação

| Tipo de Problema | Severidade | Ação |
|------------------|------------|------|
| Build quebrado | Alta | Corrigir imediatamente |
| Job individual falha | Média | Retry ou investigar logs |
| Provider indisponível | Alta | Verificar credenciais |
| Lentidão | Baixa | Monitorar |

---

*Última atualização: 2025-12-18*
