# Golden Paths - Catálogo de Fluxos Críticos

> Data: 2025-12-18  
> Sistema: Video Factory OS

---

## Resumo Executivo

O Video Factory OS possui **6 Golden Paths** identificados:
- 3 fluxos de **Produção de Vídeo** (core business)
- 2 fluxos de **Administração** (config)
- 1 fluxo de **Monitoramento** (ops)

---

## GP-01: Criar e Executar Job de Vídeo (FLUXO PRINCIPAL)

**Criticidade**: 🔴 Alta  
**Frequência**: Diária  

### Passos
1. Usuário acessa `/jobs/new` → Wizard de criação
2. Seleciona Recipe (ex: `graciela`) → Define pipeline
3. Preenche inputs (`title`, `brief`, `tema`) → Dados do vídeo
4. Clica "Criar Job" → Job salvo no DB com status `pending`
5. Sistema inicia execução → status muda para `running`
6. Steps executam em sequência:
   - `title` (LLM) → Gera opções de títulos
   - `brief` (LLM) → Expande o resumo
   - `script` (LLM) → Gera roteiro ~6000 palavras
   - `parse_ssml` (Transform) → Limpa roteiro
   - `tts` (TTS) → Gera áudio MP3
   - `render` (Render) → Gera vídeo MP4 *(stub)*
7. Job finaliza com status `completed` ou `failed`

### Inputs
- `title`: Título da história
- `brief`: Resumo expandido
- `tema`: Tema central

### Outputs
- `artifacts/{jobId}/title/output.txt`
- `artifacts/{jobId}/brief/output.txt`
- `artifacts/{jobId}/script/output.txt`
- `artifacts/{jobId}/parse_ssml/output.txt`
- `artifacts/{jobId}/tts/audio.mp3`
- `artifacts/{jobId}/render/video.mp4`

### Onde Verificar Evidência
| Camada | O que verificar |
|--------|-----------------|
| **UI** | `/jobs/{id}` → Tabs Pipeline/Artifacts/Logs |
| **DB** | `jobs.status = 'completed'`, `jobs.progress = 100` |
| **Logs** | Tab Logs mostra cada step com timestamp |
| **Files** | Pasta `artifacts/{jobId}/` contém arquivos |

### Status Atual
- [x] Pipeline executa até step `tts`
- [ ] Step `render` é stub (não gera vídeo real)
- [ ] Step `export` é stub

---

## GP-02: Monitorar Produção (Dashboard)

**Criticidade**: 🟡 Média  
**Frequência**: Diária  

### Passos
1. Acessa `/` (Dashboard) → Control Room
2. Vê métricas: Em Produção, Concluídos Hoje, Taxa Sucesso, Falhados
3. Vê Jobs Recentes (últimos 6) → Cards com status
4. Clica em job → Vai para `/jobs/{id}`

### Inputs
- Nenhum (read-only)

### Outputs
- Métricas calculadas em tempo real
- Lista de jobs recentes

### Onde Verificar Evidência
| Camada | O que verificar |
|--------|-----------------|
| **UI** | Dashboard mostra cards com dados reais |
| **DB** | Query em `jobs` por status e datas |

### Status Atual
- [x] Funciona completamente

---

## GP-03: Configurar Recipe (Admin)

**Criticidade**: 🟡 Média  
**Frequência**: Semanal  

### Passos
1. Acessa `/admin/recipes` → Lista de recipes
2. Seleciona recipe → Abre detalhes
3. Configura steps → Binding de prompts/presets
4. Salva configuração

### Inputs
- Recipe slug, steps definition, bindings

### Outputs
- Recipe atualizada no DB

### Onde Verificar Evidência
| Camada | O que verificar |
|--------|-----------------|
| **UI** | Recipe aparece com steps configurados |
| **DB** | `recipes.steps` contém definições |

### Status Atual
- [ ] Precisa verificar funcionamento completo

---

## GP-04: Gerenciar Prompts (Admin)

**Criticidade**: 🟡 Média  
**Frequência**: Semanal  

### Passos
1. Acessa `/admin/prompts` → Lista de prompts
2. Cria/edita prompt → Template com variáveis
3. Define model, maxTokens, temperature
4. Salva e versiona

### Inputs
- Prompt name, systemPrompt, userTemplate, config

### Outputs
- Prompt versionado no DB

### Onde Verificar Evidência
| Camada | O que verificar |
|--------|-----------------|
| **UI** | Prompt na lista com versão |
| **DB** | `prompts.version` incrementado |

### Status Atual
- [ ] ⚠️ Erro TS na página (`subtitle` type mismatch)

---

## GP-05: Configurar Execution Map (Admin)

**Criticidade**: 🟡 Média  
**Frequência**: Sob demanda  

### Passos
1. Acessa `/admin/execution-map` → Mapa de execução
2. Seleciona recipe + step
3. Configura: prompt, provider, presets, validators, KB
4. Salva bindings

### Inputs
- Recipe ID, Step key, binding configs

### Outputs
- Bindings salvos para execução

### Onde Verificar Evidência
| Camada | O que verificar |
|--------|-----------------|
| **UI** | Config aparece no execution map |
| **DB** | Tabelas de binding populadas |

### Status Atual
- [ ] Precisa verificar funcionamento completo

---

## GP-06: Retry de Step Falhado

**Criticidade**: 🔴 Alta  
**Frequência**: Sob demanda (quando falha)  

### Passos
1. Job falha em algum step
2. Usuário acessa `/jobs/{id}` → Tab Pipeline
3. Vê step com status `failed` e erro
4. Clica "Retry" no step → Re-executa a partir daquele ponto
5. Pipeline continua até concluir

### Inputs
- Job ID, Step key

### Outputs
- Job continua execução

### Onde Verificar Evidência
| Camada | O que verificar |
|--------|-----------------|
| **UI** | Step muda de `failed` para `running` → `success` |
| **DB** | `jobs.status` volta a `running` depois `completed` |

### Status Atual
- [ ] Precisa verificar se retry funciona corretamente

---

## Matriz de Cobertura

| Golden Path | Documentado? | Testado? | Funciona? |
|-------------|--------------|----------|-----------|
| GP-01: Criar Job | ✅ | ❓ | ⚠️ Parcial |
| GP-02: Dashboard | ✅ | ❓ | ✅ |
| GP-03: Config Recipe | ❓ | ❓ | ❓ |
| GP-04: Gerenciar Prompts | ❓ | ❓ | ❌ (erro TS) |
| GP-05: Execution Map | ❓ | ❓ | ❓ |
| GP-06: Retry Step | ❓ | ❓ | ❓ |

---

## Próximos Passos

1. Testar cada Golden Path manualmente
2. Documentar bugs encontrados
3. Criar testes automatizados para GP-01 e GP-02
