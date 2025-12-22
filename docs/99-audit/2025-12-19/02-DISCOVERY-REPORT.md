# Discovery Report - 2025-12-18

## 1. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Framework** | Next.js (App Router) | 14.2.18 |
| **Linguagem** | TypeScript | 5.7.2 |
| **Runtime** | Node.js | 25.2.1 |
| **DB ORM** | Drizzle ORM | 0.38.3 |
| **Banco** | SQLite (better-sqlite3) | 11.7.0 |
| **UI** | React + Radix UI + Tailwind | 18.3 |
| **LLM** | Anthropic Claude | SDK 0.39.0 |
| **TTS** | Azure Speech Services | HTTP API |
| **Video** | FFmpeg (fluent-ffmpeg) | 2.1.3 |
| **Validation** | Zod | 3.25.76 |

---

## 2. Estrutura de Diretórios

```
video-factory-os/
├── app/                    # Next.js App Router
│   ├── admin/              # Páginas de administração (8 subáreas)
│   ├── api/                # API Routes (3 endpoints)
│   ├── jobs/               # UI de jobs (list, create, detail)
│   └── page.tsx            # Dashboard principal
├── artifacts/              # Arquivos gerados por jobs (gitignored)
├── components/             # Componentes React (41 arquivos)
│   ├── layout/             # Layout components
│   ├── ui/                 # Design system (Radix-based)
│   └── vf/                 # Video Factory specific
├── docs/                   # Documentação (68 arquivos)
│   ├── 00-regras/          # Regras de operação
│   ├── 01-adr/             # Architecture Decision Records (8)
│   ├── 02-features/        # Documentação de features
│   ├── 03-development/     # Guias de desenvolvimento
│   ├── 04-produto/         # PRD, Architecture, Milestones
│   ├── 05-timeline/        # Logs de sessão por data
│   └── 06-archive/         # Documentos arquivados
├── lib/                    # Core libraries
│   ├── db/                 # Schema + migrations + seed (6 arquivos)
│   ├── engine/             # Job Engine (7 arquivos)
│   ├── prompts/            # Prompt utilities
│   └── types/              # TypeScript types
├── recipes/                # Definições de pipelines
│   └── graciela/           # Recipe ativa
├── scripts/                # Scripts utilitários (13 arquivos)
└── z- archive/             # Referência legada (n8n, 4pice)
└── z- tmp/                 # Arquivos temporários (78 arquivos!)
```

---

## 3. Documentação Existente

| Categoria | Qtd | Localização | Status |
|-----------|-----|-------------|--------|
| Regras/Workflows | 5 | `docs/00-regras/` | ✅ Ativo |
| ADRs | 8 | `docs/01-adr/` | ✅ Ativo |
| Features | 4 | `docs/02-features/` | ⚠️ Verificar |
| Development | 3 | `docs/03-development/` | ⚠️ Verificar |
| Produto | 4 | `docs/04-produto/` | ⚠️ Verificar |
| Timeline | 4 datas | `docs/05-timeline/` | ✅ Ativo |
| Archive | 2 | `docs/06-archive/` | 📦 Arquivado |
| Fluxo Jobs | 1 | `docs/FLUXO-JOBS-STEPS-TABS.md` | ✅ Ativo |
| Índice | 1 | `docs/index.md` | ✅ Ativo |

**Total**: 38 arquivos .md na documentação

---

## 4. Integrações Externas

| Serviço | Uso | Auth | Status |
|---------|-----|------|--------|
| **Anthropic Claude** | LLM para geração de texto | API Key (env) | ✅ Funciona |
| **Azure TTS** | Text-to-Speech | API Key (env) | ✅ Funciona |
| **FFmpeg** | Render de vídeo | Local binary | ⚠️ Stub |

---

## 5. Banco de Dados

| Tabela | Propósito |
|--------|-----------|
| `jobs` | Jobs de execução |
| `recipes` | Definições de pipelines |
| `prompts` | Templates de prompt LLM |
| `providers` | Configuração de providers |
| `presets_voice` | Presets de voz TTS |
| `presets_ssml` | Templates SSML |
| `presets_video` | Presets de encoding |
| `validators` | Regras de validação |
| `knowledge_base` | Base de conhecimento |
| `projects` | Projetos/contextos |

---

## 6. Observações Críticas

### ⚠️ Pontos de Atenção
- `z- tmp/` com 78 arquivos - avaliar limpeza
- `z- archive/` contém código legado de referência
- Build quebrado por 3 erros de TypeScript
- ESLint não configurado
- Sem testes automatizados
