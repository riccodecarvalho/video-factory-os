# ADR-014: Render Farm Strategy (Mac Workers)

> **Status:** Proposto  
> **Data:** 2025-12-22  
> **Decisores:** Ricardo (owner), Antigravity (implementador)

---

## Contexto

O Video Factory OS precisa escalar para produzir mais vídeos em paralelo. A estratégia inicial é usar Macs (M1/M2) como workers devido ao VideoToolbox para encoding acelerado.

### Requisitos

1. Múltiplos Macs processando jobs em paralelo
2. Queue centralizada com distribuição de jobs
3. Monitoramento de saúde dos workers
4. Failover automático se worker cair
5. Suporte a workers remotos (futuro)

---

## Decisão

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────┐
│                    VIDEO FACTORY OS                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              RENDER COORDINATOR                   │   │
│  │  - Mantém queue de RenderPlans                   │   │
│  │  - Distribui jobs para workers disponíveis       │   │
│  │  - Monitora progresso e saúde                    │   │
│  └─────────────────────┬────────────────────────────┘   │
│                        │                                 │
│           ┌────────────┼────────────┐                   │
│           │            │            │                   │
│  ┌────────▼───┐ ┌──────▼────┐ ┌─────▼─────┐            │
│  │  WORKER 1  │ │  WORKER 2 │ │  WORKER N │            │
│  │  (Local)   │ │  (Mac M1) │ │  (Mac M2) │            │
│  │            │ │           │ │           │            │
│  │ VideoTool  │ │ VideoTool │ │ VideoTool │            │
│  │   box      │ │   box     │ │   box     │            │
│  └────────────┘ └───────────┘ └───────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Fase 1: Worker Local (Implementado)

- `RenderWorker` com queue local
- Concorrência configurável
- Retry automático
- Eventos de progresso

### Fase 2: Workers Remotos (Futuro)

1. **Heartbeat** — Workers pingam coordinator a cada N segundos
2. **Job Distribution** — Coordinator atribui jobs ao worker com menor load
3. **Result Upload** — Worker faz upload do vídeo final para storage
4. **Health Monitoring** — Se worker não responde, job é redistribuído

### Comunicação

| Fase | Protocolo | Descrição |
|------|-----------|-----------|
| 1 (Local) | In-process | Worker roda no mesmo processo |
| 2 (Remoto) | HTTP + Polling | Worker busca jobs via API |
| 3 (Escala) | WebSocket | Comunicação bidirecional real-time |

---

## Modelo de Dados

```typescript
interface Worker {
    id: string;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    capabilities: {
        hasVideoToolbox: boolean;
        maxConcurrency: number;
        supportedFormats: string[];
    };
    currentJobs: string[];
    lastHeartbeat: string;
    stats: {
        jobsCompleted: number;
        jobsFailed: number;
        avgRenderTimeMs: number;
    };
}
```

---

## Alternativas Consideradas

### Cloud Render (AWS/GCP)
**Rejeitado para MVP**: Custo alto, sem VideoToolbox, latência de upload.

### Kubernetes + FFmpeg containers
**Rejeitado**: Complexidade operacional, sem hardware acceleration.

---

## Consequências

### Positivas
- Escala horizontal com hardware próprio
- VideoToolbox para encoding rápido
- Controle total sobre pipeline

### Negativas
- Requer Macs físicos
- Complexidade de coordination
- Networking entre máquinas

---

## Implementação Atual

| Arquivo | Função |
|---------|--------|
| `lib/engine/render-worker.ts` | Worker local com queue |
| `lib/engine/timeline-executor.ts` | Executor de RenderPlan |
| `lib/engine/preset-registry.ts` | Presets VideoToolbox |

---

## Próximos Passos

1. ~~Worker local (single Mac)~~ ✅
2. API de status de worker
3. Coordinator para múltiplos workers
4. Heartbeat e health monitoring
5. Storage compartilhado para artefatos

---

**Última atualização:** 2025-12-22
