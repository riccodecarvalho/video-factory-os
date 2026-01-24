# Video Factory OS - Prompts e Knowledge Base

> **Objetivo:** Documentar estrutura de prompts e sistema de Knowledge Base
> **Fonte:** `lib/db/schema.ts`, `lib/db/seed.ts`, `config/kb/`
> **Gerado em:** 2026-01-24

---

## 📋 ÍNDICE

1. [Sistema de Prompts](#sistema-de-prompts)
2. [Knowledge Base (KB)](#knowledge-base-kb)
3. [Variáveis de Template](#variáveis-de-template)
4. [Prompts do Canal Graciela](#prompts-do-canal-graciela)
5. [Como Criar Novos Prompts](#como-criar-novos-prompts)

---

## SISTEMA DE PROMPTS

### Estrutura de um Prompt

```typescript
interface Prompt {
  id: string;
  slug: string;              // 'graciela.script.v1'
  name: string;              // 'Roteiro Graciela v1'
  category: string;          // 'script', 'title', 'brief'
  
  systemPrompt: string;      // Instruções do sistema
  userTemplate: string;      // Template com {{variáveis}}
  
  model: string;             // 'claude-sonnet-4-20250514'
  maxTokens: number;         // 4096-16000
  temperature: number;       // 0.0-1.0
  
  kbTiers: string;           // JSON: ["tier1", "tier2"]
  
  version: number;
  isActive: boolean;
}
```

### Anatomia de um Prompt

```
┌─────────────────────────────────────────────────┐
│                  SYSTEM PROMPT                   │
│  • Persona/papel do assistente                  │
│  • Regras gerais de comportamento               │
│  • Formato de output esperado                   │
│  • Restrições (o que NÃO fazer)                 │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               KNOWLEDGE BASE                     │
│  • Injetado automaticamente baseado em kbTiers  │
│  • tier1: sempre incluído (DNA)                 │
│  • tier2: contexto específico (técnicas)        │
│  • tier3: referências sob demanda               │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                USER TEMPLATE                     │
│  • {{titulo}} - variável do input               │
│  • {{brief}} - variável do input                │
│  • {{previousSteps}} - outputs anteriores       │
│  • {{iterationHint}} - instrução de retry       │
└─────────────────────────────────────────────────┘
```

### Categorias de Prompts

| Categoria | Função | Exemplo |
|-----------|--------|---------|
| `title` | Gerar títulos | graciela.title.v1 |
| `brief` | Expandir ideias | graciela.brief.v1 |
| `script` | Gerar roteiro | graciela.script.v1 |
| `scene_prompts` | Prompts de imagem | graciela.scene-prompts.v1 |
| `validator` | Validação de output | stage-directions-validator |

---

## KNOWLEDGE BASE (KB)

### Sistema de Tiers

```
┌─────────────────────────────────────────────────┐
│  TIER 1: SEMPRE INCLUÍDO                        │
│  • DNA do canal/persona                         │
│  • Personalidade, tom, estilo                   │
│  • Regras fundamentais                          │
│  Ex: "Graciela é uma avó mexicana de 62 anos"   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  TIER 2: CONTEXTO ESPECÍFICO                    │
│  • Técnicas de narrativa                        │
│  • Padrões de hook                              │
│  • Estruturas de história                       │
│  Ex: "Técnicas de gancho emocional"             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  TIER 3: REFERÊNCIAS SOB DEMANDA                │
│  • Exemplos extensos                            │
│  • Roteiros completos                           │
│  • Dados de pesquisa                            │
│  Ex: "10 roteiros de referência"                │
└─────────────────────────────────────────────────┘
```

### Estrutura de um KB Doc

```typescript
interface KnowledgeBase {
  id: string;
  slug: string;           // 'graciela-dna'
  name: string;           // 'DNA Graciela'
  tier: string;           // 'tier1', 'tier2', 'tier3'
  category: string;       // 'dna', 'techniques', 'examples'
  content: string;        // Conteúdo completo
  recipeSlug: string;     // null = global, 'graciela' = específico
  isActive: boolean;
}
```

### Injeção de KB no Prompt

```typescript
// Em providers.ts - executeLLM()

// 1. Determina quais tiers incluir
const tiersToInclude = prompt.kbTiers || ['tier1'];

// 2. Busca KB docs ativos dos tiers
const kbDocs = await db.select()
  .from(knowledgeBase)
  .where(and(
    inArray(kb.tier, tiersToInclude),
    eq(kb.isActive, true)
  ));

// 3. Monta contexto
const kbContext = kbDocs
  .map(doc => `## ${doc.name}\n${doc.content}`)
  .join('\n\n');

// 4. Injeta no system prompt
const fullSystemPrompt = `
${prompt.systemPrompt}

<knowledge_base>
${kbContext}
</knowledge_base>
`;
```

---

## VARIÁVEIS DE TEMPLATE

### Variáveis de Input

| Variável | Fonte | Descrição |
|----------|-------|-----------|
| `{{titulo}}` | job.input | Título do vídeo |
| `{{brief}}` | job.input | Ideia/brief inicial |
| `{{duracao}}` | job.input | Duração alvo (minutos) |
| `{{timestamp}}` | auto | Timestamp para anti-repetição |
| `{{nombre_protagonista}}` | auto | Nome pré-calculado |
| `{{nombre_antagonista_masculino}}` | auto | Nome masculino pré-calculado |
| `{{nombre_antagonista_femenino}}` | auto | Nome feminino pré-calculado |

### Variáveis de Previous Steps

| Variável | Fonte | Descrição |
|----------|-------|-----------|
| `{{previousSteps.title}}` | step output | Títulos gerados |
| `{{previousSteps.brief}}` | step output | Brief expandido |
| `{{previousSteps.script}}` | step output | Roteiro gerado |

### Variáveis Especiais

| Variável | Fonte | Descrição |
|----------|-------|-----------|
| `{{iterationHint}}` | retry | Instrução de ajuste |
| `{{iterationStep}}` | retry | Step sendo iterado |
| `{{knowledge}}` | KB | Alias para KB injetado |

### Exemplo de Rendering

```typescript
// Input
const variables = {
  titulo: "La Nuera Envidiosa",
  duracao: "8",
  nombre_protagonista: "Graciela",
};

// Template
const template = `
Escribe un roteiro sobre: {{titulo}}
Duración: {{duracao}} minutos
Protagonista: {{nombre_protagonista}}
`;

// Resultado
const rendered = `
Escribe un roteiro sobre: La Nuera Envidiosa
Duración: 8 minutos
Protagonista: Graciela
`;
```

---

## PROMPTS DO CANAL GRACIELA

### graciela.title.v1

**Categoria:** title
**Função:** Gerar títulos clickbait para YouTube

```typescript
systemPrompt: `
Eres un experto en títulos virales para YouTube en español mexicano.
Tu audiencia son mujeres de 45-65 años.
Genera 5 títulos que:
- Usen curiosidad y drama familiar
- Tengan entre 50-70 caracteres
- NO usen clickbait engañoso
`;

userTemplate: `
Tema del video: {{brief}}
Duración: {{duracao}} minutos

Genera 5 opciones de títulos.
`;
```

### graciela.brief.v1

**Categoria:** brief
**Função:** Expandir ideia inicial em brief estruturado

```typescript
systemPrompt: `
Expande la idea en un brief de producción.
Incluye:
- Premisa principal
- Conflicto central
- Arco emocional
- Ganchos de retención
`;

userTemplate: `
Idea original: {{titulo}}

{{brief}}

Expande en un brief de 300-500 palabras.
`;
```

### graciela.script.v1

**Categoria:** script
**Función:** Gerar roteiro completo em formato Stage Directions

```typescript
systemPrompt: `
Eres Graciela, una abuela mexicana de 62 años que cuenta historias.
Tu tono es:
- Cercano y cálido
- Con sabiduría popular
- Drama familiar pero con moraleja

FORMATO DE OUTPUT:
- Usa Stage Directions: (voz: NARRADORA), (voz: ANTAGONISTA)
- Pausas: [PAUSA CORTA], [PAUSA], [PAUSA LARGA]
- NO uses SSML directo
- NO uses Markdown

ESTRUCTURA:
1. Gancho (primeros 30 segundos)
2. Contexto
3. Desarrollo del conflicto
4. Clímax emocional
5. Resolución con moraleja
`;

userTemplate: `
TÍTULO: {{titulo}}

BRIEF:
{{previousSteps.brief}}

NOMBRES:
- Protagonista: {{nombre_protagonista}}
- Antagonista (si hombre): {{nombre_antagonista_masculino}}
- Antagonista (si mujer): {{nombre_antagonista_femenino}}

DURACIÓN: {{duracao}} minutos (aproximadamente {{duracao * 150}} palabras)

{{#if iterationHint}}
INSTRUCCIÓN DE AJUSTE:
{{iterationHint}}
{{/if}}

Escribe el roteiro completo.
`;
```

---

## COMO CRIAR NOVOS PROMPTS

### 1. Via Admin UI

```
/admin/prompts → "Novo Prompt"
1. Defina slug único (canal.tipo.versao)
2. Escreva systemPrompt
3. Escreva userTemplate com {{variáveis}}
4. Configure model, maxTokens, temperature
5. Selecione kbTiers necessários
```

### 2. Via Seed Script

```typescript
// scripts/seed-novo-prompt.ts

const novoPrompt = {
  id: uuid(),
  slug: 'meucanal.script.v1',
  name: 'Roteiro Meu Canal v1',
  category: 'script',
  systemPrompt: `...`,
  userTemplate: `...`,
  model: 'claude-sonnet-4-20250514',
  maxTokens: 8000,
  temperature: 0.75,
  kbTiers: JSON.stringify(['tier1', 'tier2']),
  version: 1,
  isActive: true,
};

await db.insert(schema.prompts).values(novoPrompt);
```

### 3. Boas Práticas

**DO:**
- ✅ Versione prompts (v1, v2, v3)
- ✅ Documente mudanças em cada versão
- ✅ Teste com casos diversos antes de ativar
- ✅ Use KB para contexto que muda pouco
- ✅ Use variáveis para dados dinâmicos

**DON'T:**
- ❌ Hardcode nomes ou dados específicos
- ❌ Misture instruções de formato no userTemplate
- ❌ Use temperature muito alta (>0.9) para scripts
- ❌ Ignore a estrutura tier1/tier2/tier3

### 4. Testando um Prompt

```typescript
// Via console ou script
import { executeLLM } from '@/lib/engine/providers';

const result = await executeLLM({
  provider: await getProvider('claude'),
  prompt: await getPrompt('meucanal.script.v1'),
  variables: {
    titulo: "Teste",
    brief: "Uma história de teste",
    duracao: "5",
  },
  kbContext: await loadKBContext(['tier1']),
});

console.log(result.output);
```

---

## EXEMPLO COMPLETO: KB GRACIELA

### tier1-dna.json

```json
{
  "slug": "graciela-dna",
  "name": "DNA Graciela",
  "tier": "tier1",
  "category": "dna",
  "content": "# Quem é Graciela\n\nGraciela é uma avó mexicana de 62 anos que mora na Cidade do México. Ela conta histórias de drama familiar baseadas em experiências reais de sua vida e de pessoas que conheceu.\n\n## Personalidade\n- Calorosa e acolhedora\n- Sábia mas não arrogante\n- Usa expressões mexicanas autênticas\n- Tem senso de humor sutil\n\n## Tom\n- Narrativa em primeira pessoa\n- Como se estivesse conversando com uma amiga\n- Pausas dramáticas naturais\n- Sempre termina com uma reflexão ou moraleja\n\n## Audiência\n- Mulheres de 45-65 anos\n- México e América Latina\n- Interessadas em dramas familiares reais\n- Buscam entretenimento e sabedoria"
}
```

### tier2-hooks.json

```json
{
  "slug": "graciela-hooks",
  "name": "Técnicas de Hook Graciela",
  "tier": "tier2",
  "category": "techniques",
  "content": "# Técnicas de Gancho\n\n## Hook de Abertura (primeiros 15 segundos)\n1. Comece no meio do conflito\n2. Faça uma pergunta retórica\n3. Revele um resultado surpreendente\n\n## Exemplos de Hooks\n- \"Nunca imaginé que mi propia nuera haría algo así...\"\n- \"¿Alguna vez han sentido que alguien de su familia los traicionó?\"\n- \"Lo que pasó en la boda de mi hijo me cambió para siempre.\"\n\n## Retenção\n- Plante sementes de mistério nos primeiros 2 minutos\n- Use 'loops abertos' (prometa resolver depois)\n- Faça transições com ganchos: \"Pero eso no fue lo peor...\""
}
```

---

## BINDINGS DE PROMPT

### Como Prompts São Vinculados a Steps

```typescript
// execution_bindings
{
  scope: 'global',
  recipeId: 'graciela-youtube-long',
  stepKey: 'script',
  slot: 'prompt',
  targetId: 'uuid-do-prompt-graciela-script-v1',
}
```

### Override por Projeto

```typescript
// Projeto "test" usa prompt diferente
{
  scope: 'project',
  projectId: 'uuid-do-projeto-test',
  recipeId: 'graciela-youtube-long',
  stepKey: 'script',
  slot: 'prompt',
  targetId: 'uuid-do-prompt-test-script',
}
```

---

*Documento gerado da análise do sistema de prompts do Video Factory OS.*
