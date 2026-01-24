# Video Factory OS - Checklist de Deploy

> **Objetivo:** Passo a passo para deploy em novo ambiente
> **Gerado em:** 2026-01-24

---

## PRÉ-REQUISITOS

### Sistema Operacional
- [x] macOS (recomendado para VideoToolbox)
- [x] Linux (fallback libx264)
- [x] Windows WSL2 (fallback libx264)

### Software Necessário

| Software | Versão Mínima | Comando de Verificação |
|----------|---------------|------------------------|
| Node.js | 18.x LTS | `node --version` |
| npm | 9.x | `npm --version` |
| FFmpeg | 5.x | `ffmpeg -version` |
| Git | 2.x | `git --version` |

### APIs Necessárias

| Serviço | Obrigatório | Como Obter |
|---------|-------------|------------|
| **Anthropic (Claude)** | ✅ Sim | https://console.anthropic.com → API Keys |
| **Azure Speech** | ✅ Sim | https://portal.azure.com → Speech Services |
| **Google ImageFX** | ❌ Opcional | Cookies de sessão (manual) |

---

## CHECKLIST DE DEPLOY

### Fase 1: Preparação do Ambiente

```bash
# 1.1 Clone o repositório
git clone <repo-url> video-factory-os
cd video-factory-os

# 1.2 Instale dependências
npm install

# 1.3 Verifique FFmpeg
ffmpeg -version
# Se não instalado:
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

- [ ] Repositório clonado
- [ ] `npm install` completou sem erros
- [ ] FFmpeg disponível no PATH

### Fase 2: Configuração de Variáveis de Ambiente

```bash
# 2.1 Copie o arquivo de exemplo
cp .env.example .env.local

# 2.2 Edite com suas credenciais
nano .env.local  # ou code .env.local
```

**Conteúdo do `.env.local`:**
```bash
# OBRIGATÓRIO - Claude API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# OBRIGATÓRIO - Azure TTS
AZURE_SPEECH_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_SPEECH_REGION=eastus2

# OPCIONAL - ImageFX (se for usar geração de imagens)
# IMAGEFX_COOKIES=...
```

- [ ] `.env.local` criado
- [ ] `ANTHROPIC_API_KEY` configurada
- [ ] `AZURE_SPEECH_KEY` configurada
- [ ] `AZURE_SPEECH_REGION` configurada

### Fase 3: Inicialização do Banco de Dados

```bash
# 3.1 Push do schema (cria tabelas)
npm run db:push

# 3.2 Seed dados iniciais
npm run db:seed

# 3.3 Verifique o banco
npm run db:studio
# Abre http://localhost:4983 para visualização
```

- [ ] `db:push` executado com sucesso
- [ ] `db:seed` executou sem erros
- [ ] Banco `video-factory.db` criado (~3MB)

### Fase 4: Teste Local

```bash
# 4.1 Inicie o servidor de desenvolvimento
npm run dev

# 4.2 Acesse no navegador
open http://localhost:3000
```

**Verificações:**
- [ ] Home page carrega
- [ ] `/admin/prompts` mostra prompts do seed
- [ ] `/admin/providers` mostra Claude e Azure TTS
- [ ] `/admin/recipes` mostra recipe Graciela

### Fase 5: Teste de Execução

```bash
# 5.1 Crie um job de teste
# Via UI: /jobs/new
# Selecione recipe: Graciela YouTube Long
# Input: título e brief de teste

# 5.2 Execute o job
# Clique em "Iniciar Execução"

# 5.3 Monitore
# Acompanhe progresso em /jobs/[id]
```

**Checklist de execução:**
- [ ] Job criado com sucesso
- [ ] Step LLM (title) completa
- [ ] Step LLM (brief) completa
- [ ] Step LLM (script) completa
- [ ] Step TTS completa (pode demorar ~5-10 min)
- [ ] Step Render completa
- [ ] Vídeo gerado em `artifacts/[jobId]/render/video.mp4`

### Fase 6: Configuração de Produção

```bash
# 6.1 Build de produção
npm run build

# 6.2 Inicie servidor de produção
npm run start
```

**Configurações adicionais para produção:**
- [ ] Configurar processo daemon (PM2, systemd)
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Limpar artifacts antigos periodicamente

---

## TROUBLESHOOTING

### Erro: "ANTHROPIC_API_KEY não configurada"
```
Causa: Variável não está no .env.local
Solução: Verifique se .env.local existe e tem a key correta
```

### Erro: "AZURE_SPEECH_KEY não configurada"
```
Causa: Variável não está no .env.local
Solução: Verifique se .env.local existe e tem a key correta
```

### Erro: "better-sqlite3" build failed
```
Causa: Compilação nativa falhou
Solução: 
  - macOS: xcode-select --install
  - Linux: sudo apt install build-essential python3
  - Depois: rm -rf node_modules && npm install
```

### Erro: FFmpeg não encontrado
```
Causa: FFmpeg não está no PATH
Solução:
  - macOS: brew install ffmpeg
  - Linux: sudo apt install ffmpeg
  - Ou: Verificar se @ffmpeg-installer/ffmpeg está instalado
```

### Erro: VideoToolbox encoder failed
```
Causa: h264_videotoolbox não disponível (Linux/Windows)
Solução: Sistema faz fallback automático para libx264
         Ou: Edite preset para usar libx264 diretamente
```

### Erro: Azure TTS timeout
```
Causa: Batch synthesis demorou mais de 30 min
Solução: 
  - Verificar tamanho do texto (muito longo?)
  - Verificar status da Azure (outages?)
  - Tentar novamente (retry)
```

### Erro: Database locked
```
Causa: Múltiplos processos acessando o DB
Solução:
  - Parar outros processos node
  - rm video-factory.db-shm video-factory.db-wal
  - Reiniciar servidor
```

---

## BACKUP E RESTORE

### Backup Manual
```bash
npm run db:backup
# Cria: backups/video-factory_YYYYMMDD_HHMMSS.db
```

### Backup Automático (cron)
```bash
# Adicione ao crontab
0 */6 * * * cd /path/to/video-factory-os && npm run db:backup
```

### Restore
```bash
npm run db:restore
# Interativo: seleciona backup para restaurar
```

---

## ESTRUTURA DE DIRETÓRIOS PÓS-DEPLOY

```
video-factory-os/
├── .env.local              # ✅ Suas credenciais
├── video-factory.db        # ✅ Banco SQLite
├── video-factory.db-shm    # WAL shared memory
├── video-factory.db-wal    # WAL log
├── artifacts/              # ✅ Output dos jobs
│   └── [job-id]/
│       ├── title/
│       ├── brief/
│       ├── script/
│       ├── tts/
│       └── render/
├── backups/                # ✅ Backups do banco
├── node_modules/           # Dependências
├── .next/                  # Build Next.js
└── ...
```

---

## MANUTENÇÃO

### Diária
- [ ] Verificar `/api/health`
- [ ] Monitorar jobs falhados
- [ ] Verificar disk space

### Semanal
- [ ] Backup manual do banco
- [ ] Limpar artifacts de jobs antigos (>30 dias)
- [ ] Verificar logs de erro

### Mensal
- [ ] Atualizar dependências (`npm update`)
- [ ] Verificar uso de API (costs)
- [ ] Revisar prompts (qualidade do output)

---

## CONTATOS E REFERÊNCIAS

### Documentação
- ADRs: `docs/01-adr/`
- Features: `docs/02-features/`
- System Map: `docs/SYSTEM-MAP.md`

### APIs
- Anthropic Console: https://console.anthropic.com
- Azure Portal: https://portal.azure.com
- Azure Speech Docs: https://learn.microsoft.com/azure/cognitive-services/speech-service/

---

*Checklist gerado pela análise exaustiva do Video Factory OS.*
