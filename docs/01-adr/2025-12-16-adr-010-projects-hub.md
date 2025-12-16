# ADR-010: Projects como Hub Central

| Campo | Valor |
|-------|-------|
| Data | 2025-12-16 |
| Status | Aceito |
| Decisores | Ricardo Carvalho, Antigravity |

## Contexto

A arquitetura original tinha páginas separadas para:
- **Presets**: configurações de voz e vídeo
- **Providers**: serviços LLM e TTS
- **Recipes**: pipelines de execução

Problema: usuário não sabia onde configurar projeto específico. As páginas soltas não davam contexto.

## Decisão

Transformar **Projects** no **hub central** onde o usuário configura tudo por projeto:
- Qual Recipe usar
- Qual Provider LLM (Claude)
- Qual Provider TTS (Azure)
- Qual Preset Voice (Ximena, Jorge, etc)
- Qual Preset Video (720p, 1080p)

## Como Funciona

O DB já suportava `project_id` em `execution_bindings`:

```sql
execution_bindings
├── scope: 'project'
├── project_id: FK → projects
├── recipe_id: FK → recipes
├── step_key: 'script' | 'tts' | 'render' | '*'
├── slot: 'provider' | 'preset_voice' | 'preset_video'
└── target_id: FK → providers/presets
```

Agora a UI expõe isso através de tabs:
- **Configuração**: recipe ativa
- **Providers**: dropdown LLM, dropdown TTS
- **Presets**: dropdown Voice, dropdown Video
- **Geral**: nome, key, descrição

## Consequências

### Positivas
- UX clara: usuário sabe onde configurar projeto
- Flexibilidade: cada projeto pode ter configurações diferentes
- Overrides: bindings de projeto sobrepõem globais

### Negativas
- Páginas Presets/Providers viram "biblioteca" menos usada
- Precisa migrar bindings existentes para scope project

## Alternativas Consideradas

1. **Wizard de criação**: descartado por complexidade
2. **Inline em cada página**: descartado, fragmentava configuração
