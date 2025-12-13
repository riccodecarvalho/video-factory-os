# Video Factory OS - Design System Spec

## Identidade

### Vibe
- **É:** Produção, fábrica, pipeline, transformação, progresso
- **Não é:** Dashboard corporativo, analytics frio, admin genérico

### Inspiração
- Ferramentas de criação (Figma, Linear, Vercel)
- Pipelines de CI/CD (GitHub Actions, Railway)
- Estúdios de produção (DaVinci, Premiere - mas simplificado)

### Sensação desejada
- "Estou produzindo algo"
- "Posso ver o progresso claramente"
- "É profissional mas não intimidador"

---

## Requisitos Técnicos

### Stack
- **Base:** shadcn/ui (primitivos)
- **Styling:** Tailwind CSS
- **Tokens:** CSS vars (HSL format)
- **Framework:** Next.js 14 (App Router)

### Dark Mode
- **Dark first** (padrão)
- Light mode como opção secundária

### Acessibilidade
- WCAG 2.1 AA (contraste mínimo)
- Focus visible em todos interativos
- Keyboard navigation
- Screen reader friendly (aria labels)

---

## Paleta de Cores (direção)

### Direção desejada
- Primária: Azul/Roxo (produção, tecnologia)
- Accent: Verde/Cyan (sucesso, progresso)
- Destruitva: Vermelho/Coral (erros, atenção)
- Neutros: Cinzas com leve tom frio

### Status colors
- Success: Verde vibrante
- Warning: Amarelo/Laranja
- Error: Vermelho
- Info: Azul claro
- Pending: Cinza
- Running: Azul pulsante (animação)

---

## Componentes VF Necessários

### 1. JobCard
- **Propósito:** Card de um job (vídeo) na lista
- **Variantes:** compact, default, expanded
- **Estados:** pending, running, success, failed
- **Props:** title, status, progress, recipe, createdAt, actions

### 2. PipelineView
- **Propósito:** Visualização horizontal do pipeline com steps
- **Variantes:** horizontal, vertical (mobile)
- **Estados:** cada step tem seu estado
- **Props:** steps[], currentStep, onStepClick

### 3. StepIndicator
- **Propósito:** Indicador visual de um step no pipeline
- **Variantes:** icon, number, minimal
- **Estados:** pending, running, success, failed, skipped
- **Props:** step, status, isActive, onClick

### 4. StatusBadge
- **Propósito:** Badge colorido com status
- **Variantes:** default, outline, subtle
- **Estados:** pending, running, success, failed, warning
- **Props:** status, size, showIcon

### 5. QuickAction
- **Propósito:** Botão de ação rápida (retry, preview, download)
- **Variantes:** icon-only, with-label
- **Estados:** default, hover, disabled, loading
- **Props:** action, icon, label, onClick, disabled

### 6. ProgressRing (opcional)
- **Propósito:** Progresso circular para jobs
- **Props:** value, max, size, showPercent

### 7. MetricCard (opcional)
- **Propósito:** Card de métrica (custo, tempo, tokens)
- **Props:** label, value, unit, trend, icon

---

## Telas para Validar

### 1. Dashboard
- Lista de jobs recentes (JobCard)
- Métricas resumidas (MetricCard)
- Ações rápidas (criar novo, ver todos)
- Status geral do sistema

### 2. Nova Produção
- Seletor de recipe (dropdown/cards)
- Form de input (título, brief)
- Preview de configurações
- Botão de iniciar

### 3. Job Detail
- Header com título e status (StatusBadge)
- Pipeline visual (PipelineView + StepIndicator)
- Logs por step (expandable)
- Previews de artefatos
- Ações (retry, download, delete)

---

## Estados Obrigatórios

Todo componente interativo deve ter:
- `default`
- `hover`
- `focus` (visible ring)
- `active/pressed`
- `disabled`
- `loading` (quando aplicável)

---

## Animações

- **Transições:** 150-200ms ease-out
- **Loading:** Pulse ou skeleton
- **Progresso:** Animação suave de barra/ring
- **Status running:** Pulse sutil ou shimmer
- **Hover:** Scale sutil (1.02) ou shadow

---

## Qualidade Esperada

- **Premium:** Parecer ferramenta paga
- **Moderno:** 2024-2025 aesthetic
- **Consistente:** Mesmos tokens em tudo
- **Responsivo:** Desktop-first, mas funciona em tablet
- **Rápido:** Sem animações que atrasem uso
