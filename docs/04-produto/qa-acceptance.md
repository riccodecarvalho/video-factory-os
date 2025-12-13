# 🧪 Video Factory OS - QA e Critérios de Aceite

## Definition of Done (por PR)

Antes de mergear qualquer PR:

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm run test`)
- [ ] Migrações aplicadas sem erro
- [ ] Logs por etapa funcionando
- [ ] Erros são rastreáveis (mensagem clara + stack)
- [ ] 1 teste "happy path" existe
- [ ] 1 teste de idempotência existe (quando aplicável)
- [ ] Docs atualizados (MILESTONES.md no mínimo)
- [ ] ADR criado (se decisão arquitetural)

---

## Testes por Prioridade

### P0 — Críticos (devem passar sempre)

| Teste | Descrição | Onde |
|-------|-----------|------|
| `checkpoint_resume` | Falha na etapa 3, retoma exatamente da 3 | lib/engine |
| `checkpoint_skip` | Etapa completa com mesmo hash é pulada | lib/engine |
| `prompt_not_found` | `getPromptOrThrow("xyz")` lança erro explícito | lib/prompts |
| `stage_directions_valid` | Roteiro sem SSML/MD, min words, marcadores | lib/validators |
| `ssml_no_voice_nesting` | Parser nunca gera `<voice>` dentro de `<voice>` | lib/adapters |

### P1 — Importantes

| Teste | Descrição | Onde |
|-------|-----------|------|
| `render_uses_videotoolbox` | Preset Mac injeta encoder certo | lib/adapters |
| `preset_change_triggers_rerun` | Mudar preset muda hash → step re-executa | lib/engine |
| `knowledge_base_tiers` | Tier1 sempre carrega, Tier3 sob demanda | lib/prompts |

### P2 — Nice to Have

| Teste | Descrição | Onde |
|-------|-----------|------|
| `job_manifest_complete` | Manifest final tem todos os snapshots | lib/engine |
| `artifact_versioning` | Novo artifact não sobrescreve anterior | lib/engine |
| `ui_job_retry` | Botão retry dispara step correto | app/ |

---

## Testes de Stage Directions

O roteiro DEVE:

```typescript
// Teste: stage_directions_valid

const rules = {
  // Não pode conter
  forbidden: [
    /<[^>]+>/,     // HTML/XML/SSML tags
    /\*\*/,        // Markdown bold
    /^#+\s/m,      // Markdown headers
    /```/,         // Markdown code blocks
  ],
  
  // Deve começar com
  startsWith: "(voz: NARRADORA)",
  
  // Marcadores de voz válidos
  voiceMarkers: ["NARRADORA", "ANTAGONISTA", "OTRO"],
  
  // Pausas válidas
  pauseMarkers: ["[PAUSA CORTA]", "[PAUSA]", "[PAUSA LARGA]"],
  
  // Mínimo de palavras
  minWords: 6000,
};
```

---

## Testes de SSML

O SSML gerado DEVE:

```typescript
// Teste: ssml_no_voice_nesting

const rules = {
  // Estrutura obrigatória
  hasRootSpeak: true,
  hasAzureNamespace: true,
  
  // NUNCA aninhado
  voiceNesting: "sequential_only",
  
  // Pausas mapeadas
  breakTimeMapping: {
    "[PAUSA CORTA]": "300ms",
    "[PAUSA]": "500ms",
    "[PAUSA LARGA]": "1000ms",
  },
  
  // Prosody vem do preset
  prosodyFromPreset: true,
};

// Exemplo válido:
`<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts">
  <voice name="es-MX-DaliaNeural">
    <mstts:express-as style="narration-professional">
      Texto aqui...
      <break time="500ms"/>
      Mais texto...
    </mstts:express-as>
  </voice>
  <voice name="es-MX-JorgeNeural">
    Outro texto...
  </voice>
</speak>`

// Exemplo INVÁLIDO (aninhado):
`<voice name="A">
  <voice name="B">  <!-- ❌ ERRO: voice dentro de voice -->
    Texto
  </voice>
</voice>`
```

---

## Testes de Checkpoints

```typescript
// Teste: checkpoint_skip

// 1. Executar job completo
await runJob(jobId);
expect(job.status).toBe("completed");

// 2. Re-executar sem mudar input
await runJob(jobId);

// 3. Verificar que steps foram SKIPPED
for (const step of job.steps) {
  expect(step.status).toBe("skipped"); // Não re-executou
}

// 4. Verificar input_hash permanece igual
expect(step.input_hash).toBe(previousInputHash);
```

```typescript
// Teste: checkpoint_resume

// 1. Executar job e simular falha no step 3
mockStep3ToFail();
await runJob(jobId);

expect(job.steps[0].status).toBe("success");
expect(job.steps[1].status).toBe("success");
expect(job.steps[2].status).toBe("failed");

// 2. Corrigir e re-executar
unmockStep3();
await runJob(jobId);

// 3. Verificar: steps 1-2 pulados, step 3 re-executado
expect(job.steps[0].status).toBe("skipped");
expect(job.steps[1].status).toBe("skipped");
expect(job.steps[2].status).toBe("success"); // Agora passou
```

---

## Testes de Prompt Governance

```typescript
// Teste: prompt_not_found

// Deve lançar erro explícito, NÃO fallback silencioso
await expect(getPromptOrThrow(db, "inexistente"))
  .rejects
  .toThrow("Prompt not found: inexistente");

// Deve incluir sugestões se houver similar
await expect(getPromptOrThrow(db, "graciela.scrpt.v1"))
  .rejects
  .toThrow(/Did you mean: graciela.script.v1/);
```

---

## Evidências Requeridas por Fase

### Fase 0
- [ ] Screenshot: `npm run dev` rodando
- [ ] Output: `curl /api/health` retorna OK
- [ ] Output: `sqlite3 video-factory.db "SELECT * FROM prompts;"` mostra seed

### Fase 1
- [ ] Log: Job executado step a step
- [ ] Log: Job retomado do step exato após falha
- [ ] Screenshot: artifacts versionados no disco

### Fase 3
- [ ] Output: 3 roteiros válidos diferentes
- [ ] Validação: todos passam no stage_directions_valid

### Fase 4
- [ ] Output: SSML gerado (sem nesting)
- [ ] Arquivo: mp3 gerado pelo Azure

### Fase 5
- [ ] Arquivo: mp4 final
- [ ] Log: encoder usado = h264_videotoolbox

### Fase 6
- [ ] Screenshot: UI listando jobs
- [ ] Screenshot: UI mostrando steps de um job
- [ ] Vídeo: demonstração de retry
