# ADR-001: Stage Directions como Formato de Roteiro

**Data:** 2025-12-13  
**Status:** Aceito  
**Decisores:** Equipe Video Factory OS

## Contexto

O pipeline de produção de vídeo precisa converter roteiros gerados por LLM em áudio via Azure TTS. O Azure TTS espera SSML válido com tags específicas.

**Problema:** Se o LLM gerar SSML diretamente, há alto risco de:
- Tags mal-formadas
- `<voice>` aninhados (que Azure rejeita)
- Mistura de Markdown com SSML
- Dificuldade de edição humana do roteiro

## Decisão

**O roteiro gerado pelo LLM NUNCA contém SSML nem Markdown.**

Em vez disso, usa o formato **Stage Directions** (direções de cena), que:

1. É texto puro com marcadores semânticos
2. Um parser controlado converte para SSML
3. O parser garante estrutura válida

### Formato Stage Directions

```
(voz: NARRADORA)
Texto da narradora aqui.
[PAUSA]
Mais texto.

(voz: ANTAGONISTA)
Texto do antagonista.
[PAUSA CORTA]
```

### Regras

| Regra | Descrição |
|-------|-----------|
| Sem SSML | Nenhuma tag `<speak>`, `<voice>`, `<break>`, etc. |
| Sem Markdown | Nenhum `**bold**`, `# header`, ``` code ``` |
| Início obrigatório | Deve começar com `(voz: NARRADORA)` |
| Marcadores de voz | NARRADORA, ANTAGONISTA, OTRO |
| Marcadores de pausa | [PAUSA CORTA], [PAUSA], [PAUSA LARGA] |
| Mínimo palavras | 6000 palavras |

### Parser Stage Directions → SSML

O parser:

1. Identifica blocos `(voz: X)` → gera `<voice name="...">` correspondente
2. Converte pausas → `<break time="..."/>`
3. Aplica prosody/style do preset de voz
4. **NUNCA** aninha `<voice>` dentro de `<voice>`

### Mapeamento de Pausas (configurável via DB)

| Stage Direction | SSML |
|-----------------|------|
| `[PAUSA CORTA]` | `<break time="300ms"/>` |
| `[PAUSA]` | `<break time="500ms"/>` |
| `[PAUSA LARGA]` | `<break time="1000ms"/>` |

## Consequências

### Positivas

- ✅ LLM foca em conteúdo, não em markup
- ✅ Roteiro editável por humanos sem conhecer SSML
- ✅ Parser controlado garante SSML válido
- ✅ Zero risco de `<voice>` aninhado
- ✅ Mapeamentos configuráveis via DB (voz, pausas)
- ✅ Validadores podem rejeitar roteiro com SSML/MD

### Negativas

- ❌ Etapa extra de parsing (mitigado: ~5ms)
- ❌ Marcadores fixos (mitigado: podem ser expandidos)

## Alternativas Consideradas

### 1. LLM gera SSML diretamente

**Rejeitado porque:**
- Alto risco de SSML inválido
- Difícil de validar/corrigir
- LLM pode aninhar `<voice>` por "criatividade"
- Roteiro fica difícil de editar

### 2. LLM gera JSON estruturado

**Rejeitado porque:**
- Menos natural para roteiros longos
- LLM pode falhar na estrutura JSON
- Difícil de ler/editar por humanos

### 3. Markdown com substituições

**Rejeitado porque:**
- Conflito entre sintaxe Markdown e texto do roteiro
- LLM pode usar formatação não mapeada
- Mais complexo de parsear

## Validação

O validador `stage-directions.ts` deve verificar:

```typescript
const validator = {
  // Não pode conter
  forbidden: [
    /<[^>]+>/,     // Qualquer tag HTML/XML/SSML
    /\*\*/,        // Markdown bold
    /^#+\s/m,      // Markdown headers
  ],
  
  // Deve começar com
  startsWith: "(voz: NARRADORA)",
  
  // Marcadores permitidos
  voiceMarkers: ["NARRADORA", "ANTAGONISTA", "OTRO"],
  pauseMarkers: ["[PAUSA CORTA]", "[PAUSA]", "[PAUSA LARGA]"],
  
  // Mínimo
  minWords: 6000,
};
```

## Referências

- PRD.md seção 3.1 (Stage Directions)
- PRD.md seção 3.2 (SSML Azure)
- QA-ACCEPTANCE.md (testes stage_directions_valid, ssml_no_voice_nesting)
