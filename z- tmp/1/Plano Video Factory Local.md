## You asked:

me ajjde a organizar essas ideias aqui Gostaria de fazer um sistema interno independete que fizesse o que o n8n faz junto com ffmpeg-server aqui local para criacao de videos do projeto verdades de graciela. pensando em criar um saas que faça todas as etapas que os nos do n8n faz ate criar o video, porem com interface visual podendo escolher e fazer. o que acha? Analise todo o projeto e me de ideias de como fazer isso. vamos pensar em como fazer primeiro, nao faca execute nada Analisei sistema completo (n8n workflow, ffmpeg-server, Azure TTS, prompts SSML). Usando sequential-thinking, projetei arquitetura SaaS com 5 módulos: Project Manager, Script Studio, Voice Lab, Video Factory, Dashboard. na verdade gostaria de fazer sem o n8n, fazer tudo aqui localmente, talvez em python, talvez em node, ai quero que voce analise e me diga a melhor opcao. mas nao comece a executar, apenas me traga o plano Comparando stacks Python e Node.js para solução local 2 Atualizando implementation\_plan com abordagem local Node.js Recomendação: Node.js — principal motivo é reutilizar o código do ffmpeg-server que já funciona. Documento consolidado completo do Video Factory v2, integrando o pipeline de vídeo com o sistema de prompts do 4pice Studio. Inclui: visão geral, arquitetura em 4 camadas (Banco de Dados, Services, CLI, UI futura), comparação Python vs Node.js, sistema de prompts com knowledge base por tiers, fluxo completo de produção de vídeo, vantagens, roadmap em 3 fases (infraestrutura, integrações, UI), e checklist de implementação. quero que consolide toda a ideia em um documento explicando passo a passo o racional como fazer, porque fazer, a as vnatagens, etc. quero que leve emc onsideracao tambem essa funcionalidade que to pegando de outro projeto e trzaendo pra ca @tmp-prompt.md

---

## ChatGPT Replied:

Pensou por 41s

A seguir vai um **documento consolidado** (em Markdown) que organiza a ideia inteira e te dá um **plano passo a passo**, com **racional**, **porquês**, **vantagens**, **arquitetura**, **stack (Python vs Node)** e **como absorver a funcionalidade do outro projeto**.

> Observação rápida: você citou `@tmp-prompt.md`, mas **esse arquivo não está disponível aqui na conversa**. Então eu vou:
> 
> 1.  desenhar a arquitetura já com um **módulo “Prompt/Template Engine”** pronto pra receber exatamente o que estiver nesse arquivo, e
>     
> 2.  no final deixo um “checklist de encaixe” — quando você colar o conteúdo do `tmp-prompt.md`, eu consolido essa parte com fidelidade total.
>     

* * *

Video Factory Local (Verdades da Graciela) — Documento Consolidado
==================================================================

1) O que você quer construir (em uma frase)
-------------------------------------------

Um **sistema local, independente do n8n**, que execute **todas as etapas do pipeline** (roteiro → SSML/prompt → TTS Azure → assets → composição → render com ffmpeg-server → saída final), com **controle total**, **reprodutibilidade** e, se fizer sentido, uma **interface visual** para configurar e rodar.

* * *

2) Por que fazer sem n8n (o racional)
-------------------------------------

### O que o n8n te dá hoje

*   Orquestração fácil (arrastar nós)
    
*   Execução de um fluxo
    
*   Logs básicos
    
*   Integrações rápidas
    

### O que ele te “custa” (no seu caso)

*   Fluxo fica “preso” num modelo de automação genérico
    
*   Dificulta padronizar _tudo_ como “produto” (manifest, templates, versão, repetibilidade)
    
*   A UI do n8n é ótima pra automação, mas não é perfeita pra **criação de vídeo como produto**
    
*   Cresce a complexidade: debugging, versões, reuso de blocos, parâmetros, asset mgmt, múltiplas variações
    

### O ganho de um sistema próprio

*   Você transforma o pipeline em **produto** (e não “automação”)
    
*   Tudo vira **config + manifest + execução reproduzível**
    
*   Você consegue fazer coisas que o n8n não é bom em fazer:
    
    *   versionar templates/prompts/SSML
        
    *   editor de cenas e assets
        
    *   biblioteca de vozes e pós-processamento de áudio
        
    *   render “determinístico” por manifest
        
    *   re-render rápido trocando 1 peça (ex: só voz, só legenda, só assets)
        
*   Abre a porta pra virar SaaS depois (se você quiser)
    

* * *

3) Decisão de stack: Python vs Node (melhor opção pro seu contexto)
-------------------------------------------------------------------

### Critérios que importam aqui

1.  **Reuso do ffmpeg-server** já funcionando
    
2.  Facilidade de orquestrar jobs (fila, retries, paralelismo controlado)
    
3.  Facilidade de fazer UI web no futuro
    
4.  Manter “local-first” com caminho natural pra SaaS
    

### Minha recomendação: **Node.js (principal)**

**Motivo #1:** você reaproveita o ecossistema/código do **ffmpeg-server** sem fricção.  
**Motivo #2:** Node é excelente pra **orquestração**, filas, I/O, pipelines e API.  
**Motivo #3:** se amanhã você quiser UI, o caminho natural é **Next.js + backend Node**, tudo no mesmo monorepo.

### Quando Python faria sentido

*   Se você fosse colocar muita coisa de ML local (ex: modelos de voz locais, visão, etc.)
    
*   Se seu time já fosse majoritariamente Python
    
*   Se o pipeline fosse muito “científico”/análise pesada
    

### Melhor dos dois mundos (se quiser no futuro)

*   **Node como “control plane”** (API + orquestração + UI)
    
*   **Workers em Python** opcionais (tarefas específicas), plugáveis  
    Mas eu **não começaria híbrido**: começa simples, com Node, e abre a porta pra plug-in depois.
    

* * *

4) Princípio central de arquitetura (a chave do projeto)
--------------------------------------------------------

### “Manifest-first” (determinismo e re-render)

Cada vídeo deve ser representado por um **Render Manifest** (JSON) que descreve:

*   texto final por cena
    
*   SSML final por cena
    
*   voz escolhida e parâmetros
    
*   paths/IDs de assets
    
*   trilha, efeitos, transições
    
*   legendas (fonte, estilo, timing)
    
*   decisões do pipeline (ex: normalização aplicada)
    
*   versão dos templates/prompts usados
    

**Por que isso é crucial?**

*   Você consegue reproduzir o mesmo vídeo sempre
    
*   Você consegue “trocar uma peça” e re-render (ex: mudou só a voz)
    
*   Você consegue debugar e auditar (o que gerou o quê)
    

> O n8n orquestra. O seu sistema vira uma “fábrica com manifesto”.

* * *

5) Arquitetura proposta (local-first, modular, caminho pra SaaS)
----------------------------------------------------------------

### Camadas (simples e escalável)

1.  **Core (Domínio + Pipeline)**
    
    *   regras do pipeline
        
    *   geração e validação do manifest
        
    *   steps (roteiro → voz → assets → render)
        
2.  **Services (Integrações)**
    
    *   Azure TTS
        
    *   ffmpeg-server
        
    *   (futuro) LLM, bancos de assets, storage remoto
        
3.  **Runner (Job System)**
    
    *   fila local + retries + estados
        
    *   controle de concorrência
        
    *   logs estruturados
        
    *   cache de artefatos (voz gerada, thumbnails, etc.)
        
4.  **Interfaces**
    
    *   CLI (primeiro)
        
    *   API local (segundo)
        
    *   UI (terceiro)
        

### Componentes (os 5 módulos que você já citou, refinados)

1.  **Project Manager**
    
    *   projetos (ex: Verdades da Graciela)
        
    *   episódios
        
    *   presets (formato, branding, templates)
        
    *   biblioteca de assets
        
2.  **Script Studio**
    
    *   editor de roteiro
        
    *   segmentação em cenas
        
    *   versionamento
        
    *   regras de formatação (ex: limites por cena)
        
    *   geração do “Scene Plan”
        
3.  **Voice Lab**
    
    *   editor de SSML (por cena)
        
    *   preview rápido (gerar 1 cena)
        
    *   normalização/limpeza de áudio
        
    *   cache de vozes (não re-gerar se não mudou)
        
4.  **Video Factory**
    
    *   composição: assets + áudio + legendas
        
    *   render: chama ffmpeg-server
        
    *   artefatos: MP4 final + SRT/VTT + thumbnails + “manifest final”
        
5.  **Dashboard**
    
    *   lista de jobs/runs
        
    *   status (queued/running/failed/done)
        
    *   logs por etapa
        
    *   comparação de versões (manifest A vs B)
        
    *   botões: re-run step / re-render
        

* * *

6) Fluxo completo do pipeline (passo a passo)
---------------------------------------------

### Fase A — Preparação do conteúdo

1.  Criar Episódio (metadados: tema, duração alvo, formato)
    
2.  Roteiro bruto → roteiro final (Script Studio)
    
3.  Quebrar em cenas (Scene Plan)
    
4.  Aplicar templates/padrões por cena (branding, ritmo, estrutura)
    

### Fase B — Voz (Azure TTS + SSML)

5.  Gerar SSML por cena (Voice Lab)
    
6.  TTS por cena (Azure)
    
7.  Pós-processamento:
    
    *   normalização de volume
        
    *   remoção de silêncio excessivo
        
    *   padding padrão
        
8.  Consolidar áudio final (ou manter por cena, dependendo do render)
    

### Fase C — Visual e composição

9.  Resolver assets por cena:
    
    *   imagens/vídeos base
        
    *   overlays, background, B-roll, etc.
        
10.  Gerar legendas:
    

*   a partir do script + timestamps
    
*   ou forced alignment (se você tiver/usar)
    

11.  Montar o Render Manifest final
    

### Fase D — Render e entrega

12.  Enviar job pro ffmpeg-server (Video Factory)
    
13.  Render MP4 final
    
14.  Gerar thumbnails e versões (ex: vertical/short/16:9)
    
15.  “Quality pass” (checklist automático + revisão manual)
    
16.  Export / publish-ready package
    

* * *

7) “Interface visual”: como fazer sem cair na armadilha de copiar o n8n
-----------------------------------------------------------------------

Você tem 2 caminhos:

### Caminho 1 (recomendado): UI orientada a “Receitas”

Em vez de um “flow builder genérico”, você cria **Receitas de Vídeo**:

*   Receita = configuração do pipeline (templates, voz, estilo, formato, presets)
    
*   O usuário escolhe uma receita e roda
    
*   UI foca no que importa: cenas, SSML, assets, preview, render
    

**Vantagem:** muito mais “produto” e menos “ferramenta genérica”.

### Caminho 2: Flow builder (nós) — mas com restrição

Se você quiser nós visuais:

*   limite os nós às etapas do seu domínio (Script, SSML, TTS, Captions, Render…)
    
*   cada nó gera artefato versionado e vira parte do Manifest
    
*   nada de “qualquer coisa em qualquer ordem”
    

**Vantagem:** flexível  
**Risco:** vira um “mini-n8n” e você perde foco do produto

* * *

8) O que “puxar do outro projeto” (módulo que encaixa o `tmp-prompt.md`)
------------------------------------------------------------------------

Como você falou que está trazendo uma funcionalidade de outro projeto, o encaixe mais provável (e mais poderoso) é formalizar isso como um:

Prompt & Template Engine (módulo oficial)
-----------------------------------------

Responsável por:

*   templates de roteiro por formato
    
*   prompts SSML por persona/voz
    
*   placeholders (variáveis) e regras
    
*   versionamento e “tiers” (ex: base → projeto → episódio → cena)
    
*   validação (ex: impedir SSML inválido)
    
*   renderização final do texto/SSML antes do TTS
    

### Design recomendado (por tiers)

*   **Tier 0 — Global**: padrões universais (ex: tags SSML, sanitização)
    
*   **Tier 1 — Projeto**: “Verdades da Graciela” (voz, estilo, ritmo)
    
*   **Tier 2 — Receita/Formato**: short, reels, 16:9 etc.
    
*   **Tier 3 — Episódio**: variações daquele conteúdo
    
*   **Tier 4 — Cena**: ajustes finos
    

### Por que isso é ouro

*   você não “espalha prompt/SSML” pelo código
    
*   você consegue evoluir o estilo do projeto sem quebrar pipeline
    
*   você consegue testar e versionar (A/B interno)
    

> Quando você colar o `tmp-prompt.md`, eu transformo ele nesse módulo com: estrutura, contratos, exemplos e como ele injeta no Manifest.

* * *

9) Dados que você precisa persistir (modelo mental simples)
-----------------------------------------------------------

Mesmo local, vale guardar isso direito:

*   **Project**
    
*   **Recipe** (presets do pipeline)
    
*   **Episode**
    
*   **Scene**
    
*   **PromptTemplate / SSMLTemplate** (versionado)
    
*   **VoiceProfile**
    
*   **Asset** (com origem e licença se necessário)
    
*   **RenderRun** (cada execução)
    
*   **Artifacts** (mp4, wav, srt, thumbs, manifest final)
    
*   **Logs** (por step)
    

Começa com **SQLite** (local) e estrutura pronta pra migrar pra Postgres se virar SaaS.

* * *

10) Roadmap de implementação (sem executar nada, só plano)
----------------------------------------------------------

### Fase 1 — “Motor” local reproduzível (CLI)

*   Definir schema do Manifest
    
*   Implementar steps mínimos:
    
    *   script → cenas → SSML → TTS → render
        
*   Cache de áudio
    
*   Logs estruturados
    
*   Um comando tipo: `render episode-id`
    

**Resultado:** você já produz vídeo sem n8n, com re-render.

### Fase 2 — Job runner + API local

*   Job queue com estados + retries
    
*   API local (REST)
    
*   Dashboard simples (lista runs + logs)
    

**Resultado:** confiável, observável, operável.

### Fase 3 — UI de produto (não “clone do n8n”)

*   Script Studio (editor + cenas)
    
*   Voice Lab (SSML + preview)
    
*   Receita/config do projeto
    
*   Botão “Render”
    

**Resultado:** seu “Video Factory” vira produto.

### Fase 4 — Preparar o caminho pra SaaS (se quiser)

*   multi-tenant (projeto = tenant)
    
*   storage abstrato (local/ S3)
    
*   workers escaláveis
    
*   billing, auth, limites
    

* * *

11) Vantagens e desvantagens (sem romantizar)
---------------------------------------------

### Vantagens

*   Controle total do pipeline
    
*   Reprodutibilidade (manifest)
    
*   Debug real (logs por step + artefatos)
    
*   Reuso e padronização (receitas, templates, tiers)
    
*   Crescimento natural pra UI e SaaS
    

### Desvantagens / riscos

*   Você vira responsável por manutenção/observabilidade
    
*   Pode virar complexo se tentar “copiar n8n”
    
*   Se não tiver manifest/versionamento, vira um caos rápido
    

### Mitigações

*   Manifest-first
    
*   Steps bem definidos e idempotentes
    
*   Cache de artefatos
    
*   UI orientada a receitas (produto) em vez de flow genérico
    

* * *

12) Próximo passo (pra eu integrar o `tmp-prompt.md` de verdade)
----------------------------------------------------------------

Cole aqui o conteúdo do `@tmp-prompt.md` (ou os trechos principais).  
Aí eu faço mais 1 entrega: **“Seção Prompt & Template Engine — consolidada e final”**, com:

*   estrutura por tiers exatamente como você quer
    
*   contrato de variáveis
    
*   exemplos aplicados a Verdades da Graciela
    
*   como isso entra no Manifest e no pipeline
    

Se você preferir, pode colar só:

*   quais são as _funções_ dessa funcionalidade
    
*   quais entradas/saídas
    
*   exemplos de templates/prompt/SSML que ela usa

---

## You asked:

tmp-prompt.md

Arquivo

o arquivo que faltava

---

## ChatGPT Replied:

Pensou por 41s

Abaixo está o **documento consolidado** (em Markdown) que junta **Video Factory local (sem n8n)** + a **funcionalidade do outro projeto** (seu _Sistema de Prompts IA_ do 4pice Studio), explicando **o racional**, **o porquê**, **vantagens**, **arquitetura**, e um **plano passo a passo** (sem executar nada).

* * *

Video Factory Local v2 — Verdades da Graciela
=============================================

**Objetivo:** substituir o n8n por um sistema local “produto”, com pipeline completo de vídeo + motor de prompts/knowledge base editável e versionado.

1) Visão geral (o que estamos construindo)
------------------------------------------

Um sistema local que:

*   Orquestra o pipeline: **roteiro → cenas → prompts/SSML → Azure TTS → assets → composição → render via ffmpeg-server → pacotes finais**
    
*   Mantém tudo **reproduzível** (manifest)
    
*   Permite evoluir conteúdo/prompt/SSML **sem deploy**, com **versionamento e auditoria** (módulo trazido do 4pice Studio)
    
    tmp-prompt
    

* * *

2) Por que fazer sem n8n (racional de produto)
----------------------------------------------

### 2.1 O n8n foi ótimo como “orquestrador”

Mas para **fábrica de vídeo**, você quer algo mais “produto” do que “automação genérica”.

### 2.2 O que o sistema próprio te dá

*   **Determinismo e re-render**: trocar só a voz, ou só a legenda, ou só um asset, sem refazer tudo
    
*   **Governança real**: prompts e knowledge base como “infra editorial”, com histórico e regras
    
*   **Observabilidade**: logs por etapa, artefatos por step, auditoria
    
*   **Caminho natural para UI**: uma interface focada em “receitas de vídeo”, não em “nós genéricos”
    

* * *

3) Stack: Python vs Node (recomendação objetiva)
------------------------------------------------

### Recomendação: **Node.js como stack principal**

**Motivo:** reaproveitar e integrar com o **ffmpeg-server já funcional**, com menos fricção, e manter o caminho fácil para UI web depois.

### Quando Python seria melhor

*   Se a parte central virar ML local pesado (ex.: alignment, visão, voz local, etc.)
    
*   Se você quiser workers científicos mais complexos
    

**Estratégia ideal:** começar **Node-only**, com arquitetura que permite plugar workers depois (se precisar), sem nascer híbrido.

* * *

4) Princípios-chave (o que vai impedir o caos)
----------------------------------------------

### 4.1 Manifest-first (a regra nº1)

Todo vídeo deve ser gerado a partir de um **Render Manifest** (JSON) que registra:

*   texto por cena, SSML por cena, voz e parâmetros
    
*   assets por cena (origem/paths)
    
*   legendas e timing
    
*   efeitos e presets
    
*   versões de templates/prompts usados
    

**Por que isso é crítico:** você ganha reprodutibilidade, debug e re-render parcial.

### 4.2 Prompt-as-data (a “funcionalidade que você trouxe”)

Prompts e docs de referência **não ficam hardcoded**. Eles viram conteúdo de banco + UI admin, com:

*   edição sem deploy
    
    tmp-prompt
    
*   versionamento automático (histórico)
    
    tmp-prompt
    
*   knowledge base por tiers
    
    tmp-prompt
    
*   variáveis dinâmicas (templates com `{{}}` e condicionais)
    
    tmp-prompt
    

* * *

5) Arquitetura do sistema (módulos)
-----------------------------------

### 5.1 Módulos de produto (o “SaaS local”, mesmo antes de virar SaaS)

1.  **Project Manager**
    
    *   projetos (ex.: Verdades da Graciela)
        
    *   presets/receitas
        
    *   branding assets (fontes, cores, overlays)
        
2.  **Script Studio**
    
    *   roteiro
        
    *   divisão em cenas (Scene Plan)
        
    *   validações (tamanho/ritmo/padrão)
        
3.  **Prompt System (importado do 4pice Studio)**
    
    *   biblioteca de prompts editável
        
    *   knowledge base por tiers + auto-inject por categoria
        
    *   versionamento/auditoria
        
4.  **Voice Lab**
    
    *   SSML por cena
        
    *   preview rápido por cena
        
    *   cache de TTS
        
    *   normalização/pós (volume/silêncios)
        
5.  **Video Factory**
    
    *   composição (assets + áudio + legendas)
        
    *   render via ffmpeg-server
        
    *   outputs e pacotes
        
6.  **Dashboard**
    
    *   runs/jobs
        
    *   logs por etapa
        
    *   re-run de etapa / re-render
        

* * *

6) O módulo trazido: Sistema de Prompts IA (como encaixa aqui)
--------------------------------------------------------------

Você já tem um “produto interno” maduro: um sistema com **duas tabelas principais** (prompts e knowledge base) e um helper que organiza o fluxo

tmp-prompt

.

### 6.1 Estrutura de dados (adaptada para local)

**Tabela `ai_prompts`**: templates + config do modelo, tokens, temperatura, versionamento, etc.

tmp-prompt

  
**Tabela `ai_knowledge_base`**: docs de referência com tiers e auto-inject por categoria

tmp-prompt

> Local-first: você pode manter isso em **Postgres local** (mais fiel ao original, suporta JSON/arrays bem) ou em **SQLite** com JSON em texto. Se a intenção é virar SaaS depois, Postgres local deixa a migração mais suave.

### 6.2 Sistema de tiers (pra não explodir tokens/latência)

*   **tier1**: sempre carrega (orchestrator / DNA resumo)
    
*   **tier2**: por fase do pipeline
    
*   **tier3**: sob demanda (schemas, exemplos, referências)
    
    tmp-prompt
    

### 6.3 Engine de templates com variáveis (e condicionais)

O helper inclui `replaceVariables` com:

*   `{{variable}}`
    
*   `{{#if var}}...{{/if}}`
    
*   `{{#unless var}}...{{/unless}}`
    
    tmp-prompt
    

Isso é perfeito para SSML e prompts com blocos opcionais (ex.: “se tiver CTA, inclui”, “se tiver referência, injeta”).

### 6.4 Regras de governança (importantíssimo)

O documento é bem rígido em dois pontos:

*   **Nunca** prompt hardcoded ou fallback silencioso
    
    tmp-prompt
    
*   **Sempre** “falhar” se o prompt não existir (`getPromptOrThrow`) e usar model/tokens do banco
    
    tmp-prompt
    

No seu Video Factory, essa regra vira proteção contra “pipeline quebrado sem perceber”.

* * *

7) Como o Prompt System se conecta ao pipeline de vídeo
-------------------------------------------------------

Pensa no pipeline como uma sequência de **steps idempotentes** que produzem artefatos:

### Step A — Script

*   Entrada: ideia/tema do episódio + preset do projeto
    
*   Prompt slug (exemplos): `scripts-plan`, `scripts-generate-*`, `scripts-revise-*`, `scripts-validate-*`
    
    tmp-prompt
    
*   Knowledge: tier1 sempre + tier2 “scripts” (ex.: estrutura de roteiro do projeto)
    

Saída: `script.md` + `scene_plan.json`

### Step B — SSML / Voz

*   Entrada: texto por cena
    
*   Prompt slug (você pode criar categoria “voice” ou manter “scripts/tools”)
    
*   Usa `replaceVariables` para gerar SSML com blocos condicionais
    
    tmp-prompt
    
*   Chama Azure TTS
    

Saída: `scene_001.wav...` + `ssml_001.xml...`

### Step C — Captions

*   Entrada: script + (opcional) timings
    
*   Pode ser deterministicamente gerado, ou passar por prompt (ex.: ajuste de legibilidade)  
    Saída: `.srt` / `.vtt`
    

### Step D — Render

*   Entrada: manifest final (assets + áudios + captions + presets)
    
*   Render via ffmpeg-server  
    Saída: MP4 final + thumbs + pacote de export
    

* * *

8) UI: não copie o n8n — faça UI de “Receitas”
----------------------------------------------

O seu próprio arquivo do prompt system já descreve um **painel admin de prompts e knowledge base** com editor, stats, rollback e UX patterns

tmp-prompt

tmp-prompt

.  
A ideia aqui é:

### 8.1 Duas UIs diferentes (e complementares)

1.  **UI editorial (Prompts/Knowledge)**
    
    *   Biblioteca de prompts + knowledge base (igual ao modelo do arquivo)
        
        tmp-prompt
        
2.  **UI de produção de vídeo (Receitas + cenas + render)**
    
    *   não é um “flow builder”
        
    *   é: receita → cenas → SSML/voz → preview → render
        

Isso evita virar um “mini-n8n” e mantém o produto focado.

* * *

9) Roadmap (passo a passo, sem executar nada)
---------------------------------------------

### Fase 1 — Motor local e reproduzível (CLI)

*   Definir schema do **Render Manifest**
    
*   Implementar os steps mínimos:
    
    *   Script → Scene Plan → SSML → TTS → Render
        
*   Implementar cache (não refazer voz se não mudou)
    
*   Logs por step + artefatos por step
    

### Fase 2 — Prompt System local (trazido do 4pice Studio)

*   Criar as tabelas equivalentes (`ai_prompts`, `ai_knowledge_base`)
    
    tmp-prompt
    
*   Implementar o helper em Node (mesma lógica):
    
    *   getPromptOrThrow (falha explícita)
        
        tmp-prompt
        
    *   replaceVariables (incluindo if/unless)
        
        tmp-prompt
        
    *   getKnowledgeByTier + formatKnowledgeForPrompt
        
        tmp-prompt
        
*   Inserir os prompts iniciais e KB tier1
    

### Fase 3 — Job runner + Dashboard

*   Jobs com estados (queued/running/failed/done)
    
*   Re-run por step
    
*   UI de runs + logs
    

### Fase 4 — UI de produção (Receitas)

*   Editor de cenas + assets
    
*   Voice Lab (preview por cena)
    
*   Render 1-click
    

* * *

10) Vantagens (do desenho final)
--------------------------------

*   **Sem deploy para evoluir prompts** (ganho operacional enorme)
    
    tmp-prompt
    
*   **Versionamento + rollback** em prompts/KB (segurança editorial)
    
    tmp-prompt
    
*   **Tokens sob controle com tiers**
    
    tmp-prompt
    
*   **Governança anti-cagada**: proibido hardcode/fallback silencioso
    
    tmp-prompt
    
*   **Pipeline “produto” (manifest-first)**: re-render e debug real
    

* * *

11) Próxima consolidação (opcional, mas valiosa)
------------------------------------------------

Se você quiser, eu pego esse documento e:

*   desenho um **mapa de slugs** específico do “Verdades da Graciela” (scripts, SSML, captions, validação, etc.)
    
*   proponho a **tier1/tier2/tier3** inicial para esse projeto
    
*   descrevo um **manifest schema** completo (campos, versões e artefatos)
    

Só me diga se você quer que a base seja mais “simples e rápida” (MVP) ou “auditável e escalável” (já com governança forte desde o início).

---

## You asked:

0001-escopo-projeto.md

Arquivo

0002-plano-dna-graciela.md

Arquivo

0003-dna-graciela.md

Arquivo

0004-prompt-roteiro-graciela.md

Arquivo

arquitetura-workflow.md

Arquivo

azure-tts-vozes-configuracoes.md

Arquivo

ffmpeg-filtros-visuais.md

Arquivo

licoes-aprendidas-n8n.md

Arquivo

mcp-ffmpeg-local.md

Arquivo

prompt-stage-directions.md

Arquivo

deixa eu trazer mais alguns documentos para te dar mais contexto

0001-escopo-projeto.md

Arquivo

0002-framework-roteiro.md

Arquivo

0003-prompt-roteiro.md

Arquivo

0012-framework-titulos.md

Arquivo

0013-framework-hooks.md

Arquivo

graciela-pipeline-v1.json

Arquivo

vou trazer mais uns documentos pra te dar ainda mais contexto. Voce vai ter uma visao do todo que fui passando e construindo e o que precisamo ter nesse sistema indepdente de n8n que quero rodar.

---

## You asked:

0001-escopo-projeto.md

Arquivo

0002-plano-dna-graciela.md

Arquivo

0003-dna-graciela.md

Arquivo

0004-prompt-roteiro-graciela.md

Arquivo

arquitetura-workflow.md

Arquivo

azure-tts-vozes-configuracoes.md

Arquivo

ffmpeg-filtros-visuais.md

Arquivo

licoes-aprendidas-n8n.md

Arquivo

mcp-ffmpeg-local.md

Arquivo

prompt-stage-directions.md

Arquivo

deixa eu trazer mais alguns documentos para te dar mais contexto

0001-escopo-projeto.md

Arquivo

0002-framework-roteiro.md

Arquivo

0003-prompt-roteiro.md

Arquivo

0012-framework-titulos.md

Arquivo

0013-framework-hooks.md

Arquivo

graciela-pipeline-v1.json

Arquivo

vou trazer mais uns documentos pra te dar ainda mais contexto. Voce vai ter uma visao do todo que fui passando e construindo e o que precisamo ter nesse sistema indepdente de n8n que quero rodar.

---

## ChatGPT Replied:

Pensou por 4m 51s

A seguir está um **documento consolidado** (em formato de “design doc”) para você construir um **sistema local, independente do n8n**, que gere os vídeos do **Verdades de Graciela** de ponta a ponta — e já **trazendo a funcionalidade do outro projeto** (a “biblioteca/governança de prompts” do `tmp-prompt.md`) para dentro da solução.

* * *

Video Factory Local – Verdades de Graciela (v1)
===============================================

1) Por que fazer isso (e por que sem n8n)
-----------------------------------------

Hoje o n8n está funcionando como “cola” entre: **Google Sheets/Drive → LLM (roteiro) → Azure TTS (áudio) → ffmpeg-server (vídeo) → upload + status**. Isso funciona, mas vira um sistema **frágil de operar e evoluir**: debugging chato, estado espalhado, upgrades perigosos, e pouca governança de prompt/pipeline.

A sua própria documentação já aponta que a chave para estabilidade é **checkpoint + idempotência** (rodar de novo sem estragar) e “cascata de etapas” bem definida.

licoes-aprendidas-n8n

  
E também mostra que “não dá pra render direto do Drive”, precisa baixar localmente antes do FFmpeg (um exemplo clássico de detalhe operacional que n8n não deixa tão óbvio quando quebra).

licoes-aprendidas-n8n

**Resultado:** faz sentido tirar do n8n e criar um “motor” local com:

*   **Máquina de estados + checkpoints** (resiliência real).
    
    arquitetura-workflow
    
*   **Observabilidade/logs por item** (sem “caça ao erro”).
    
*   **Governança de prompts e versionamento** (vindo do `tmp-prompt.md`).
    
    0003-prompt-roteiro
    

* * *

2) O que o sistema precisa entregar (escopo do MVP)
---------------------------------------------------

Baseado no escopo do projeto e no fluxo atual: **planilha como fila**, gerar roteiro, gerar áudio, gerar vídeo e subir resultado, com status.

0001-escopo-projeto

### Requisitos “não negociáveis”

1.  **Rodar local** (independente do n8n).
    
2.  **Checkpoint por etapa** (roteiro salvo / áudio salvo / vídeo concluído).
    
    arquitetura-workflow
    
3.  **Azure Batch TTS** com polling e download do resultado final.
    
    graciela-pipeline-v1
    
4.  **FFmpeg render local** usando seu padrão já validado (com hardware encode quando disponível).
    
    mcp-ffmpeg-local
    
5.  **Prompt system** organizado, versionado, com “knowledge tiers” (do outro projeto).
    
    0003-prompt-roteiro
    

* * *

3) Stack: Python vs Node.js (recomendação pragmática)
-----------------------------------------------------

Você pediu “a melhor opção” pensando **local-first** e reaproveitamento.

### Node.js/TypeScript (recomendado)

**Por quê:** você já tem o conceito e trechos de implementação do **ffmpeg-server em Express**, inclusive com encoder `h264_videotoolbox` e pipeline de render funcionando.

mcp-ffmpeg-local

  
Além disso:

*   Integra muito bem com **fila/worker** (BullMQ/pg-boss), APIs, UI futura (Next.js), e o desenho do `tmp-prompt.md` já está em “mundo web”.
    
    0003-prompt-roteiro
    
*   Ótimo para orquestração I/O (Drive, Azure, chamadas LLM, arquivos).
    

### Python (quando faria sentido)

*   Se você quisesse puxar pesado pra **processamento de mídia/ML** (análises, visão, etc.) ou scripts científicos.
    
*   Mas você perderia o reaproveitamento direto do server/padrões em JS e provavelmente criaria “duas ilhas”.
    

✅ **Decisão recomendada:** **Node.js + TypeScript** como núcleo. (Python pode entrar depois como “tooling” opcional, não como core.)

* * *

4) Arquitetura proposta (local, mas pronta pra virar SaaS)
----------------------------------------------------------

A sua própria visão anterior “4 camadas” é a mais correta aqui:

### Camada A — Persistência (DB + filesystem)

*   **DB local**: SQLite (MVP) ou Postgres (se já quiser mais robusto).
    
*   **Artefatos em disco**: `/projects/graciela/<videoId>/script.md`, `audio.mp3`, `video.mp4`, `meta.json`.
    

### Camada B — Services (domínio)

*   `PromptService` (governança de prompts + knowledge tiers)
    
*   `ScriptService` (LLM + validações do DNA)
    
*   `TTSService` (Azure Batch)
    
*   `VideoService` (FFmpeg render + presets)
    
*   `StorageService` (Drive/local)
    
*   `Orchestrator` (máquina de estados + filas)
    

### Camada C — CLI (MVP operacional)

*   `vf run --project graciela --limit 5`
    
*   `vf retry --videoId ...`
    
*   `vf status --failed`
    

### Camada D — UI (fase 2)

Interface visual (o “n8n com cara de produto”):

*   lista de itens (planilha/fila)
    
*   editor de prompt/roteiro
    
*   player do áudio e preview do vídeo
    
*   botões “regenerar roteiro / regenerar áudio / rerender vídeo”
    
*   dashboard e custos/tempo
    

* * *

5) Máquina de estados (o coração do “sem n8n”)
----------------------------------------------

A arquitetura-workflow já descreve bem o modelo idempotente de status: **pendente → processando → roteiro\_salvo → audio\_salvo → concluido**.

arquitetura-workflow

### Estados sugeridos (mais completos)

*   `PENDENTE`
    
*   `ROTEIRO_OK` (artefato salvo + hash do prompt/model)
    
*   `SSML_OK` (ssml gerado e validado)
    
*   `TTS_SUBMETIDO` (jobId Azure)
    
*   `AUDIO_OK` (mp3 local + drive opcional)
    
*   `VIDEO_OK` (mp4 local + drive opcional)
    
*   `FALHA_EM_<ETAPA>` (com `error_code`, `stack`, `retry_count`)
    

**Regra de ouro:** se existe artefato válido + metadados, a etapa é pulada (checkpoint). Isso replica a “cascata” que você já mapeou.

licoes-aprendidas-n8n

* * *

6) Pipeline passo a passo (racional de execução)
------------------------------------------------

### Passo 0 — Ingest (fila)

Fonte pode ser:

*   Google Sheets (como hoje)
    
    0001-escopo-projeto
    
*   ou “lista local” (JSON/CSV)
    

O sistema cria um `VideoItem` com `videoId`, `title`, `status=PENDENTE`.

* * *

### Passo 1 — Roteiro (LLM) com DNA da Graciela

Aqui entram dois blocos: **DNA do canal/persona** e **prompt de roteiro**.

O DNA define o “produto”: canal, protagonista, framing, estrutura e consistência.

0003-dna-graciela

  
E o prompt de roteiro estabelece checklist, CTAs, e integração com o estilo do projeto.

0004-prompt-roteiro-graciela

Saída:

*   `script.md` (roteiro final)
    
*   `script_meta.json` (modelo, prompt\_version, tempo, tokens, hash)
    

* * *

### Passo 2 — Stage Directions (estrutura visual)

Você já tem um padrão de Stage Directions com parser (v7.0) e formato bem definido: transformar marcações em estrutura para render/edição.

graciela-pipeline-v1

Saída:

*   `directions.json` (timeline: cenas, efeitos, inserts, textos, etc.)
    

* * *

### Passo 3 — SSML Builder + Voice Config (Azure)

O prompt de roteiro já traz regras de fluidez com `<break>` e controle de prosódia.

0004-prompt-roteiro-graciela

  
E o arquivo de Azure TTS define vozes e configurações recomendadas (ex.: `es-MX-DaliaNeural`, `es-MX-JorgeNeural`, etc.).

azure-tts-vozes-configuracoes

Saída:

*   `voice.ssml` validado
    

* * *

### Passo 4 — Azure Batch TTS (assíncrono com polling)

Seu pipeline já usa Batch Synthesis com:

*   output format `audio-48khz-192kbitrate-mono-mp3`
    
*   `concatenateResult: true`
    
*   polling / espera e depois download do `outputs.result`.
    
    graciela-pipeline-v1
    

Saída:

*   `audio.mp3`
    
*   `tts_job.json` (jobId, timestamps, tentativas)
    

* * *

### Passo 5 — Render de vídeo (FFmpeg local)

Aqui você reaproveita o que já está validado: loop de imagem + áudio, escala 720p, encoder do Mac quando possível.

mcp-ffmpeg-local

E mantém filtros visuais como **presets opcionais**, porque você já observou que filtros pesados em single CPU explodem o tempo de render (2–3h).

ffmpeg-filtros-visuais

Saída:

*   `video.mp4`
    

* * *

### Passo 6 — Storage + Status

Se continuar com Drive/Sheets:

*   upload de áudio/vídeo
    
*   update status e links
    

Importante: continuar respeitando a lição operacional — **FFmpeg precisa do arquivo local**, então sempre “download → render → upload”.

licoes-aprendidas-n8n

* * *

7) A funcionalidade “do outro projeto” (como trazer pra cá)
-----------------------------------------------------------

O `tmp-prompt.md` descreve uma **biblioteca de prompts com governança**, incluindo:

*   prompts e templates versionados
    
*   knowledge base por tiers
    
*   endpoints `/api/prompts`, `/api/templates`, `/api/execute`
    
*   logs de execução e auditoria
    
    0003-prompt-roteiro
    

### Como isso entra no Video Factory Local

Você cria um **Prompt Studio interno** (mesmo no MVP, pode ser só CLI + arquivos):

*   `prompts/` (prompt files)
    
*   `knowledge/` (docs base por tier)
    
*   DB registra: `prompt_name`, `version`, `vars`, `tier_links`, `hash`
    

E o pipeline sempre roda assim:

1.  Orchestrator pede: `PromptService.get("graciela.script.v1")`
    
2.  `PromptService` monta **prompt final = template + vars + knowledge tiers**
    
3.  `ExecutionLog` salva: prompt\_version + inputs + outputs
    

**Benefício real:** você consegue evoluir DNA/prompts com rastreabilidade e “rollback”, sem virar caos.

* * *

8) Roadmap em 3 fases (sem travar a entrega)
--------------------------------------------

### Fase 1 — MVP local (CLI + engine)

*   DB + filesystem
    
*   máquina de estados + fila
    
*   Script → SSML → Azure TTS → FFmpeg → status
    
*   logs + reprocessamento por etapa
    

### Fase 2 — UI local (o “n8n com interface de produto”)

*   lista de itens + filtros
    
*   editor de prompt e knowledge base
    
*   reprocessamento por botão
    
*   painel de performance (tempo por etapa, taxa de falha)
    

### Fase 3 — “pronto pra SaaS”

*   multi-projeto, multi-tenant
    
*   workers distribuídos
    
*   billing/custos por vídeo
    
*   templates compartilháveis
    

* * *

9) Vantagens objetivas vs n8n
-----------------------------

*   **Confiabilidade:** checkpoints e idempotência como regra do sistema.
    
    arquitetura-workflow
    
*   **Reprocessamento inteligente:** refaz só o que quebrou (cascata).
    
    licoes-aprendidas-n8n
    
*   **Governança de prompts:** versionamento + knowledge tiers + auditoria.
    
    0003-prompt-roteiro
    
*   **Performance e controle:** render local com presets e hardware encode.
    
    mcp-ffmpeg-local
    
*   **Evolução mais fácil:** novos módulos (shorts, cortes, thumbnails, multi-voz, etc.) entram como services, não como “nós”.
    

* * *

Se você quiser, no próximo passo eu posso transformar isso em um **“PRD técnico”** com:

*   entidades do banco (tabelas),
    
*   contratos de cada service (interfaces),
    
*   especificação exata do state machine,
    
*   e o desenho da UI (telas e ações) — **sem escrever código ainda**, só deixando 100% mastigado pro Antigravity/implementação.

---

## You asked:

O que acha de incluirmos isso aqui 🎬 Fluxo Completo: Da Ideia ao Vídeo Final Visão Geral do Pipeline ┌─────────────────────────────────────────────────────────────────────────────────┐ │ PIPELINE DE CRIAÇÃO DE VÍDEOS │ │ 4pice Studio │ ├─────────────────────────────────────────────────────────────────────────────────┤ │ │ │ 1. IDEIA 2. BRIEF 3. ROTEIRO 4. PROMPTS │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │ │Biblioteca│ → │Desenvol-│ → │ Criar │ → │Prompts │ │ │ │de Ideias │ │ver Ideia│ │ Roteiro │ │p/ Cenas │ │ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │ ↓ ↓ ↓ ↓ │ │ script\_ideas briefs\_library scripts script\_scene\_prompts │ │ │ │ 5. IMAGENS 6. SYNC TABLE 7. EDIÇÃO │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │ │ Gerador │ → │ Tabela │ → │ CapCut │ │ │ │ Imagens │ │ Sync │ │ Export │ │ │ └─────────┘ └─────────┘ └─────────┘ │ │ ↓ ↓ │ │ generated\_images script\_sync\_tables │ │ │ └─────────────────────────────────────────────────────────────────────────────────┘ 📋 ETAPA 1: Biblioteca de Ideias Página: /biblioteca/ideias → BibliotecaIdeias.tsx Propósito: Armazenar ideias brutas antes de desenvolver Tabelas: script\_ideas - Ideias manuais (título + notas) video\_ideas - Ideias geradas por IA Funcionalidades: Criar/editar/excluir ideias Buscar por título/descrição Copiar ideia para clipboard Ação principal: "Criar Roteiro" → navega para /criacao/roteiros 📋 ETAPA 2: Desenvolvedor de Ideia (Brief) Página: /criacao/desenvolver-ideia → DesenvolvedorIdeia.tsx Propósito: Transformar ideia vaga em brief estruturado Edge Function: develop-idea Prompt do Banco: develop-idea Input: Ideia (texto livre) Link de referência (opcional) Contexto adicional (opcional) Output (JSON estruturado): json { "arquetipo": { "tipo": "VIRAL|ENGAGEMENT|RETENTION\_MAX", "justificativa": "..." }, "titulos": \[{ "titulo": "...", "chars": 45 }\], "protagonista": { "nome": "...", "idade": 0, "backstory\_emocional": "..." }, "viloes": \[{ "tipo": "principal", "nome": "...", "filosofia": "..." }\], "mentor": { "nome": "...", "funcao\_narrativa": "DOADOR" }, "interesse\_romantico": { "nome": "...", "aparicoes\_por\_ato": \[\] }, "objetos\_simbolicos": \[{ "objeto": "...", "introducao": "ato X" }\], "thumbnail\_sugestoes": \[{ "conceito": "...", "texto\_overlay": "..." }\] } Tabela: briefs\_library 📋 ETAPA 3: Criar Roteiro Página: /criacao/roteiros → ScriptCreate.tsx Propósito: Gerar roteiro completo com IA Hook: useScriptCreate → useScriptCreate.ts Fluxo de Geração: Brief + Arquétipo → Planejamento Estratégico → Aprovação → Roteiro Final Steps de Geração: typescript // @/Users/riccodecarvalho/IDEs/video-save-guardian/src/components/ScriptProgressLoader.tsx:175-180 SCRIPT\_GENERATION\_STEPS = \[ { id: 'loading', label: 'Carregando frameworks e DNA', estimatedSeconds: 5 }, { id: 'planning', label: 'Criando planejamento estratégico', estimatedSeconds: 60 }, { id: 'structure', label: 'Estruturando 7 atos', estimatedSeconds: 30 }, { id: 'validation', label: 'Validando com Framework V5', estimatedSeconds: 15 }, \] Inputs: Título (opcional - IA gera se vazio) Brief (texto ou importado da biblioteca) Duração alvo (minutos) Arquétipo (VIRAL / ENGAGEMENT / RETENTION\_MAX) Modelo Claude (claude-sonnet-4-20250514 recomendado) Referências extras (roteiros de referência) Edge Functions: scripts-plan - Planejamento estratégico scripts-generate - Geração do roteiro scripts-validate-deep - Validação Tabela: scripts 📋 ETAPA 4: Prompts para Cenas (Story Rhythm / SR) Página: /criacao/prompts-cenas → PromptsParaCenas.tsx Propósito: Gerar prompts de imagem para cada cena do roteiro Hook: usePromptsParaCenas → usePromptsParaCenas.ts Arquitetura Background Job: ┌──────────────────┐ ┌─────────────────────────┐ ┌──────────────────┐ │ scene-prompts- │ → │ script\_scene\_prompts │ ← │ scene-prompts- │ │ start │ │ (tabela de jobs) │ │ background │ │ (inicia job) │ │ status: processing │ │ (processa cenas) │ └──────────────────┘ └─────────────────────────┘ └──────────────────┘ ↓ ↑ ↓ Retorna job\_id Polling do frontend Atualiza prompts\[\] Edge Functions: scene-prompts-start → Inicia job, divide roteiro em cenas scene-prompts-background → Processa cada cena com Claude Modos de Divisão: Modo Descrição 7x1 6 cenas (40s cada) + 1 imagem final genérica by-words X palavras por cena (configurável) by-paragraphs Divide por parágrafos automatic ~80 palavras por cena (~30s narração) Configurações: Estilo de imagem (cinematográfico, foto-realista, anime, etc.) Plataforma (ImageFX, Midjourney, DALL-E, etc.) Idioma (PT/EN) Incluir texto na imagem Descrição de personagens Output por Cena: json { "scene\_number": 1, "prompt\_pt": "...", "prompt\_en": "...", "prompt\_formatted": "..., cinematic, dramatic lighting --ar 16:9 --v 6", "language\_used": "pt" } Tabela: script\_scene\_prompts 📋 ETAPA 5: Gerador de Imagens Página: /criacao/gerador-imagens → GeradorImagens.tsx Propósito: Gerar imagens usando ImageFX (Google) Hook: useGeradorImagens → useGeradorImagens.ts Edge Function: generate-imagefx Fluxo: Importar prompts da sessão de script\_scene\_prompts Configurar cookies do ImageFX (autenticação) Gerar imagens em batch (com retry automático) Download individual ou em lote Salvar na nuvem (Supabase Storage) Configurações: Aspect ratio (16:9, 9:16, 1:1, etc.) Estilo (photorealistic, cinematic, anime, etc.) Negative prompt Imagens por prompt 📋 ETAPA 6: Tabela de Sincronização Página: /criacao/sync-table/:id → SyncTableGenerator.tsx Propósito: Gerar timestamps para sincronizar imagens com áudio no CapCut Edge Function: sync-table-generate Input: Total de imagens Duração do áudio (segundos) Duração mínima/máxima por imagem Output: json { "sync\_table": \[ { "image\_index": 1, "image\_name": "cena\_001.png", "start\_time": "00:00:00", "end\_time": "00:00:30", "duration\_seconds": 30, "prompt": "..." } \], "exports": { "csv": "...", "txt": "...", "json": "..." } } Tabela: script\_sync\_tables Uso no CapCut: Exportar CSV/TXT Importar no CapCut como marcadores Sincronizar imagens com narração 🗄️ Arquitetura de Prompts Tabela Principal: ai\_prompts ┌─────────────────────────────────────────────────────────────────┐ │ SISTEMA DE PROMPTS │ ├─────────────────────────────────────────────────────────────────┤ │ ┌─────────────────────┐ ┌────────────────────────┐ │ │ │ ai\_prompts │ │ ai\_knowledge\_base │ │ │ │ (~30 prompts) │────▶│ (Framework V6.1) │ │ │ │ │ │ │ │ │ │ • Templates com │ │ • Documentos de │ │ │ │ {{variáveis}} │ │ referência │ │ │ │ • Model/Tokens │ │ • Auto-inject por │ │ │ │ • Edge Function │ │ categoria │ │ │ └─────────────────────┘ └────────────────────────┘ │ │ ▲ ▲ │ │ │ │ │ │ ┌─────────────────────────────────────────────────────┐ │ │ │ \_shared/prompts.ts │ │ │ │ │ │ │ │ • getPrompt(slug) │ │ │ │ • getPromptOrThrow(slug) │ │ │ │ • replaceVariables(template, vars) │ │ │ │ • getKnowledgeByTier(tier) │ │ │ └─────────────────────────────────────────────────────┘ │ └─────────────────────────────────────────────────────────────────┘ Mapeamento Edge Function → Prompt: Edge Function Prompt Slug Categoria develop-idea develop-idea generation scripts-plan scripts-plan scripts scripts-generate scripts-generate scripts scene-prompts-background scene-prompts-background generation generate-titles generate-titles generation generate-thumbs generate-thumbs generation generate-descriptions generate-descriptions generation Admin: /admin/prompts para editar prompts sem deploy 🗄️ Tabelas do Banco de Dados Tabela Propósito Etapa script\_ideas Ideias manuais 1 video\_ideas Ideias geradas por IA 1 briefs\_library Briefs desenvolvidos 2 channel\_dna DNA do canal (nicho, tom, público) 2-3 reference\_scripts Roteiros de referência 3 scripts Roteiros finais 3 script\_scene\_prompts Jobs de geração de prompts 4 generated\_images Imagens geradas 5 script\_sync\_tables Tabelas de sincronização 6 ai\_prompts Templates de prompts Sistema ai\_knowledge\_base Documentos de referência Sistema video\_projects Projetos unificados (opcional) Todos 🔄 Fluxo Resumido (Ponta a Ponta) 1. IDEIA └─ /biblioteca/ideias → script\_ideas 2. BRIEF └─ /criacao/desenvolver-ideia └─ Edge: develop-idea └─ Prompt: develop-idea └─ Output: briefs\_library 3. ROTEIRO └─ /criacao/roteiros └─ Edge: scripts-plan → scripts-generate └─ Prompts: scripts-plan, scripts-generate └─ Output: scripts 4. PROMPTS PARA CENAS └─ /criacao/prompts-cenas └─ Edge: scene-prompts-start → scene-prompts-background └─ Prompt: scene-prompts-background └─ Output: script\_scene\_prompts.prompts\[\] 5. IMAGENS └─ /criacao/gerador-imagens └─ Edge: generate-imagefx └─ Input: prompts da etapa 4 └─ Output: imagens base64 / Supabase Storage 6. SYNC TABLE └─ /criacao/sync-table/:id └─ Edge: sync-table-generate └─ Output: script\_sync\_tables (CSV/TXT/JSON) 7. EDIÇÃO (externo) └─ Importar CSV no CapCut └─ Sincronizar imagens com áudio 📊 Resumo de Edge Functions Função Propósito Tipo develop-idea Desenvolver brief Síncrona scripts-plan Planejamento estratégico Síncrona scripts-generate Gerar roteiro Síncrona scene-prompts-start Iniciar job de prompts Síncrona (fire & forget) scene-prompts-background Processar cenas Background generate-imagefx Gerar imagem via ImageFX Síncrona sync-table-generate Gerar tabela de sync Síncrona generate-titles Gerar títulos Síncrona generate-thumbs Gerar conceitos de thumb Síncrona generate-descriptions Gerar descrição + tags Síncrona Esse é o fluxo completo do sistema 4pice Studio, da ideia inicial até a tabela de sincronização para edição no CapCut. 🚀

---

## ChatGPT Replied:

Pensou por 1m 32s

Sim — **vale muito incluir**. Esse “Fluxo Completo: Da Ideia ao Vídeo Final” vira o **mapa-mãe** do 4pice Studio: onboarding rápido, visão ponta-a-ponta e, principalmente, amarra **UI → Edge Functions → Tabelas** num único lugar.

O único cuidado que eu faria é **evitar duplicação** (pra não dar drift). A parte **“Arquitetura de Prompts”** já está bem canonizada no guia do sistema de prompts (com diagrama, tabelas `ai_prompts` / `ai_knowledge_base` e helper `_shared/prompts.ts`). Em vez de repetir tudo, eu deixaria no pipeline só um resumo + link interno do tipo “ver doc X” (ou “Fonte de Verdade”).

tmp-prompt

tmp-prompt

Ajustes que deixariam essa doc ainda mais “governável”:

*   **Definir “entidade pivô” do pipeline** (ex: `video_projects`) como _opcional mas recomendado_ e explicar: “todas as etapas escrevem em tabelas específicas, mas o projeto unifica status, ids e navegação”.
    
*   **Adicionar “Estados do pipeline”** (ex.: `idea_draft → brief_ready → script_ready → scene_prompts_ready → images_ready → sync_ready → edited_external`) e como retomar/reprocessar (idempotência + retry).
    
*   **Padronizar IDs e relações** (ex.: `idea_id`, `brief_id`, `script_id`, `project_id`) + “o que é foreign key de quê”.
    
*   **Bloco de “Operação e riscos”**: cookies do ImageFX (sensível), limites de batch/retry, custo/latência de modelos, e responsabilidades (o que é “humano”, o que é “IA”).
    
*   **Transformar o diagrama ASCII em Mermaid** (fica mais fácil de manter no docs e de renderizar).
    

Se você curtir, eu sugiro posicionar esse texto como **doc de Overview do produto** (ex.: “Pipeline de Criação de Vídeos”) e, dentro dele, deixar links para docs específicos por etapa (Brief, Roteiro, Scene Prompts job, ImageFX, Sync Table), mantendo o sistema de prompts como referência única (já bem documentado).

tmp-prompt

---

## You asked:

Tudo isso que te mandei sao de varios projetos. O que eu quero fazer agora e pegar toda essa inteligencia para criar um novo projeto em cima do qeu a gente faz no mmpeg. no n8n ele precisa pegar uma planillha com titulo e brief para acionar o clauide, criar o roteiro, gerar o audio e gerar o video no 4pice studio, gera ideia, cria titulo, cria brief, cria roteiro, cria prompt de imagens, cria imagens e gera planiha de sync para dizer onde entra cada imagem O que eu quero é criar um sistema que tenha o melhor dos 2 Eu falo a ideia e vamos passando por cada etapa, titulo, brief, planejamento, roteiro, audio, imagens, video, render, thumb, upload Faz sentido?

---

## ChatGPT Replied:

Sim, **faz total sentido**! O objetivo é criar um **fluxo de criação de vídeo** que combine as melhores funcionalidades de ambos os sistemas, com **autonomia e escalabilidade**:

1.  **Entrada:** Você fornece uma **ideia** (o que pode ser uma simples descrição ou inspiração inicial).
    
2.  **Fluxo:** A partir da ideia, o sistema passa por cada etapa até gerar o vídeo final:
    
    *   **Criação de Título**
        
    *   **Criação de Brief** (definição estratégica do vídeo)
        
    *   **Planejamento do Roteiro** (estruturando a narrativa)
        
    *   **Geração do Roteiro** (com Claude, LLM, etc.)
        
    *   **Criação de Prompt de Imagens** (definição das imagens necessárias)
        
    *   **Geração de Imagens** (utilizando ferramentas como ImageFX ou outras plataformas)
        
    *   **Tabela de Sincronização** (organizando o tempo e a sequência das imagens com o áudio)
        
    *   **Renderização do Vídeo** (compilação final com áudio e imagens)
        
    *   **Criação de Thumbnail** (geração automática de imagem de destaque)
        
    *   **Upload e Finalização** (envio para a plataforma ou entrega final)
        

### O que vai fazer isso funcionar bem:

*   **Automação de etapas chave** (criando um fluxo contínuo e integrado sem depender de ações manuais para cada tarefa).
    
*   **Inteligência artificial aplicada nas etapas** (Claude para roteiros, ImageFX ou similar para geração de imagens).
    
*   **Orquestração local/independente** (combinando a flexibilidade do 4pice Studio e a automação de ferramentas como n8n).
    

**Próximos passos**:

*   **Mapeamento completo do fluxo**: Especificar todas as etapas, como elas se conectam, quais inputs e outputs são necessários, e como garantir que cada etapa é executada corretamente.
    
*   **Escolha da stack e arquitetura**: Baseando-se na sua experiência, podemos continuar com Node.js como backend principal (para integração com ffmpeg, TTS, etc.), mais uma camada de automação para orquestrar as tarefas.
    

Com esses pontos bem desenhados, podemos transformar essa ideia em um **produto completo**! O que acha de começarmos pelo **mapa de etapas** para estruturar cada uma delas, detalhando entradas e saídas?

---

## You asked:

a parte dos fluxos de criar roteiro, etc tudo isso temos funcional no 4pice studio, o n8n ele comecou so para criar o video, mas no final ja aprendemos a fazer localmente no mmpeg serv, entao nao precisamo do n8n para nada,podemos faer tudo localmente, faz sentido?

---

## ChatGPT Replied:

Pensou por 50s

Faz **muito sentido** — e, na prática, você já tem os 2 ingredientes que tornam isso viável:

1.  o “**cérebro**” (ideia → brief → roteiro → prompts etc.) já está funcionando no 4pice Studio, e
    
2.  o “**braço de execução**” (render) você já provou que roda **local no Mac** bem mais rápido (com VideoToolbox) e com um servidor simples em Node/Express.
    
    mcp-ffmpeg-local
    
    mcp-ffmpeg-local
    

Então sim: **n8n vira descartável**.

O que “tudo local” significa de verdade
---------------------------------------

*   **Orquestração + estado + artefatos**: 100% local (fila, checkpoints, logs, arquivos, renders).
    
*   **Serviços externos**: ainda podem existir (Claude / Azure TTS / gerador de imagens), porque são APIs. Mesmo assim, você continua “sem n8n” (o seu sistema chama essas APIs direto).
    
*   Se um dia você quiser “offline total”, aí é outro projeto (LLM/TTS/imagens locais).
    

O desenho ideal: Control Plane + Execution Plane
------------------------------------------------

Você fica com o melhor dos dois mundos:

### A) 4pice Studio = **Control Plane**

*   UI + biblioteca de prompts/knowledge base (fonte de verdade) — com as regras de governança (ex.: `getPromptOrThrow`, nada hardcoded).
    
    tmp-prompt
    
*   fluxo criativo (ideia/brief/roteiro/scene prompts/imagens/sync) continua onde já está.
    

### B) Video Factory Local = **Execution Plane**

Um “runner” local (no seu Mac) que faz:

*   TTS (Azure batch + polling) — exatamente como no workflow.
    
    graciela-pipeline-v1
    
*   render FFmpeg local (rápido) — como seu server Express já faz (download → render → upload).
    
    mcp-ffmpeg-local
    
*   checkpoints / idempotência / retry — pegando o melhor padrão do n8n (“checkpoints em cascata”).
    
    licoes-aprendidas-n8n
    
*   estados “tipo planilha”, só que no seu banco/manifest local (pendente → processando → roteiro\_ok → audio\_ok → video\_ok → concluído/erro).
    
    arquitetura-workflow
    

> Se você tirar o n8n, você também elimina a necessidade de túnel pro Mac (ele era só pra deixar o n8n “enxergar” o seu ffmpeg local).
> 
> mcp-ffmpeg-local

Como isso substitui o n8n sem perder o que ele te dava
------------------------------------------------------

O n8n era basicamente: **fila (planilha) + orquestração + retry improvisado**.  
Você mantém isso, só que melhor:

*   Fila vira: **tabela “jobs”** (ou ainda a planilha, se quiser no começo)
    
*   Orquestração vira: **state machine** (determinística e observável)
    
*   Retry vira: **re-run por etapa** (sem refazer tudo)
    

Próximo passo lógico (sem executar nada): decidir o “ponto de integração”
-------------------------------------------------------------------------

Existem 2 jeitos bons:

1.  **4pice Studio dispara o runner local** (webhook/HTTP local/CLI):
    
    *   Studio cria job → runner consome → devolve links/artefatos/status
        
2.  **runner local lê direto uma fila** (Sheet/Supabase/DB local):
    
    *   mais simples operacionalmente, menos acoplamento com UI
        

Se você me disser qual você prefere, eu fecho um **plano final de arquitetura** (contratos de payload, estados, artefatos e módulos) já alinhado com:

*   governança de prompts (ai\_prompts/knowledge tiers)
    
    tmp-prompt
    
*   padrão idempotente/checkpoints
    
    licoes-aprendidas-n8n
    
*   TTS batch/poll
    
    graciela-pipeline-v1
    
*   render local rápido
    
    mcp-ffmpeg-local
    

E sim: **a conclusão é exatamente essa** — dá pra fazer tudo sem n8n, e a tendência é ficar **mais sólido, mais rápido e mais “produto”**.

---

## ChatGPT Replied:

Sim — **faz sentido total**. E do jeito que você descreveu, o “n8n” já cumpriu o papel dele: virar um **protótipo de orquestração** até você aprender o pipeline e provar que o **render local no ffmpeg-server** funciona e é muito mais rápido.

mcp-ffmpeg-local

mcp-ffmpeg-local

O ponto importante é só alinhar o que “tudo local” significa:

*   **Sem n8n:** ✅ totalmente plausível (você mesmo chama Claude/Azure/Drive/ImageFX etc. direto, sem ferramenta intermediária).
    
*   **100% offline:** ❌ só se você trocar Claude/Azure/ImageFX por alternativas locais. Mas você _não precisa disso_ pra remover o n8n.
    

Como eu desenharia isso (o “melhor dos 2”)
------------------------------------------

### 1) 4pice Studio fica como “cérebro”

Tudo que você disse que já está funcional (ideia → título → brief → planejamento → roteiro → prompts de imagem → imagens → sync table) continua sendo o **Control Plane**: UI, prompts, knowledge base, histórico, etc. E segue a governança: `ai_prompts` como fonte de verdade, sem hardcode, com tiers.

tmp-prompt

tmp-prompt

### 2) Você cria um “Runner / Factory” local (Execution Plane)

Esse cara roda no seu Mac e faz o que o n8n fazia:

*   **idempotência + checkpoints em cascata** (tem roteiro? tem áudio? tem vídeo? etc.)
    
    licoes-aprendidas-n8n
    
*   **Azure Batch TTS** (job → wait/poll → download)
    
    graciela-pipeline-v1
    
*   **render FFmpeg local** com VideoToolbox
    
    mcp-ffmpeg-local
    

> Isso é literalmente o que você descreveu como workflow idempotente (pendente → processando → roteiro\_ok → audio\_ok → video\_ok → concluído/erro), só que sem n8n.
> 
> arquitetura-workflow

O que muda na prática
---------------------

*   Você não precisa mais de túnel/ngrok/cloudflare só pra “o n8n enxergar o Mac”.
    
    mcp-ffmpeg-local
    
*   Você troca “planilha como estado” por **estado de job** (DB/manifest). Se quiser, pode manter a planilha como “inbox”, mas o estado de verdade deve ser seu runner.
    

Decisão-chave pra fechar o desenho
----------------------------------

Tem dois jeitos bons (ambos sem n8n):

1.  **4pice Studio dispara o runner local** (HTTP local/webhook/CLI) e acompanha status.
    
2.  **runner local puxa jobs** (da planilha ou do banco do Studio) e executa sozinho.
    

Eu recomendo o #2 se você quer autonomia operacional; o #1 se você quer uma UX “apertei um botão e ele faz”.

Se você me disser qual desses dois você quer, eu te devolvo um **plano final “canônico”** do novo sistema (etapas, contratos de input/output, estados, artefatos e como encaixar thumb/upload) sem escrever código ainda.

---

## You asked:

Quero criar um sistema do zero, que hoje é local mas nada impede que amanha seja um saas de verdade.

---

## ChatGPT Replied:

Pensou por 7m 55s

Video Factory OS (local-first) — Documento consolidado do “melhor dos 2 mundos”
===============================================================================

Você está propondo algo bem coerente: **juntar o “motor de criação” do 4pice Studio** (ideia → título → brief → planejamento → roteiro → prompts → imagens…) com o **motor de produção de vídeo** que nasceu no n8n (planilha → roteiro → TTS → ffmpeg render), só que **sem n8n**, rodando **100% local** hoje — e **SaaS-ready** amanhã.

A sacada é: **o n8n era só um orquestrador visual**. Vocês já descobriram o padrão mais importante dele: **workflow idempotente + checkpoints em cascata** (retomar de onde parou)

arquitetura-workflow

licoes-aprendidas-n8n

. Isso dá pra replicar muito melhor num sistema próprio.

* * *

1) Objetivo do novo projeto
---------------------------

Criar um sistema único que permita:

*   **Modo Wizard (interativo):** você fala/cola a ideia, vai aprovando etapa por etapa (título → brief → roteiro → áudio → imagens → vídeo → thumb → upload).
    
*   **Modo Batch (produção em massa):** importar uma planilha/CSV com `titulo + brief/tema`, e produzir em lote como o n8n fazia (só que local).
    

O que a gente quer preservar do legado:

*   Do **n8n**: o padrão “**checkpoints em cascata**” (tem roteiro? tem áudio? tem vídeo? se falhar, roda de novo e continua)
    
    licoes-aprendidas-n8n
    
    e os estados intermediários para retry automático
    
    graciela-pipeline-v1
    
    .
    
*   Do **4pice Studio**: governança de prompts e knowledge base por tiers (prompts no DB, editáveis sem deploy, versionados, com `getPromptOrThrow`, etc.)
    
    tmp-prompt
    
    tmp-prompt
    
    .
    

* * *

2) Princípios de arquitetura (o “porquê” das decisões)
------------------------------------------------------

### Local-first sem gambiarra

O workflow atual do Graciela depende de Sheets/Drive + Azure + FFmpeg server local

arquitetura-workflow

. No sistema novo:

*   **Sheets/Drive viram adapters opcionais** (entrada/saída), não “o sistema”.
    
*   **O core é um banco local + pasta de assets**, garantindo rastreabilidade e reprodutibilidade.
    

### Idempotência como requisito (não feature)

O workflow Graciela já foi desenhado idempotente

arquitetura-workflow

: se falhar, roda de novo e ele retoma.  
O novo sistema nasce com isso no centro, inspirado no mesmo modelo de “status intermediário → retry automático”

graciela-pipeline-v1

.

### Prompt governance como “sistema nervoso”

Nada de prompt hardcoded. A regra é: **ai\_prompts é fonte única de verdade** (ADR-001), com knowledge base em tiers (ADR-002)

tmp-prompt

. Isso é literalmente o que permite evoluir rápido sem quebrar pipeline.

* * *

3) Fluxo ponta a ponta (o que o sistema faz)
--------------------------------------------

### Entrada

*   **Wizard**: ideia livre (texto/voz) + contexto (canal/DNA/projeto).
    
*   **Batch**: CSV/Sheet com colunas mínimas (`titulo`, `tema/brief`, `status`) inspirado no modelo existente
    
    arquitetura-workflow
    
    .
    

### Etapas (com outputs persistidos)

1.  **Ideia → Título**
    
    *   Usa frameworks (títulos/hooks) + DNA do canal.
        
2.  **Título → Brief**
    
3.  **Brief → Planejamento**
    
4.  **Planejamento → Roteiro**
    
    *   Aqui você pode manter o formato “texto humano” com checklist de qualidade (40 min etc.)
        
        0003-dna-graciela
        
        .
        
5.  **Roteiro → “Script de Narração”**
    
    *   Vocês têm dois caminhos compatíveis:
        
    *   **Stage Directions (legível)**: o prompt de stage directions explicitamente manda **NÃO usar SSML** e padroniza tags como `(voz:)` e `(pausa:)`
        
        prompt-stage-directions
        
        .
        
    *   Depois, um **compiler interno** transforma isso em SSML para TTS.
        
6.  **TTS (Azure) → áudio**
    
    *   O pipeline atual já usa Azure Batch com `inputKind: "ssml"` e output mp3
        
        graciela-pipeline-v1
        
        .
        
7.  **Imagens**
    
    *   (Opcional no MVP) gerar prompts e imagens.
        
8.  **Vídeo (FFmpeg local)**
    
    *   Chamada POST multipart com `titulo`, `outputName`, `audioFile`, retornando `videoUrl`
        
        arquitetura-workflow
        
        .
        
    *   Otimizações reais já aprendidas: uso de `h264_videotoolbox`, scale, preset ultrafast/veryfast e remoção de filtros caros
        
        mcp-ffmpeg-local
        
        graciela-pipeline-v1
        
        .
        
9.  **Thumb + Metadata**
    
10.  **Upload (YouTube)**
    

*   Deixa “manual-first”, com o sistema preparando tudo e registrando.
    

* * *

4) O “motor” do sistema: Workflow Engine próprio (sem n8n)
----------------------------------------------------------

A essência é copiar o _comportamento_ do n8n (não a ferramenta):

### Checkpoints em cascata

Exatamente o padrão:

*   “Tem roteiro?”
    
*   “Tem áudio?”
    
*   “Tem vídeo?”
    
*   Se não tiver, executa a próxima etapa; se tiver, pula.
    
    licoes-aprendidas-n8n
    

### Estados por etapa (resumo)

O Graciela já usa uma cadeia de status (`pendente → processando → roteiro_ok → audio_ok → video_ok → concluido`)

arquitetura-workflow

e regras claras de retomada após falha (se falha no áudio, retoma do áudio, etc.)

arquitetura-workflow

.  
No sistema novo, isso vira **estado no banco** (não em planilha), com:

*   `status` por etapa
    
*   `attempt_count`
    
*   `last_error`
    
*   `artifacts` gerados (paths/URLs)
    

* * *

5) Arquitetura recomendada (local hoje, SaaS amanhã)
----------------------------------------------------

### Camadas

1.  **DB** (local): SQLite no começo; Postgres no SaaS.
    
2.  **Services**:
    
    *   LLM Service (Claude)
        
    *   Prompt Service (ai\_prompts + KB tiers)
        
    *   Script Compiler (stage-directions → SSML)
        
    *   TTS Service (Azure batch)
        
    *   Media Service (FFmpeg render)
        
    *   Image Service (opcional)
        
    *   Upload Service (YouTube)
        
3.  **Runner**
    
    *   CLI para batch + daemon para jobs
        
4.  **UI**
    
    *   Wizard + painel de jobs + biblioteca de prompts (reaproveitando o design mental do Studio)
        

> Essa separação é exatamente o que torna “migrável” para SaaS depois: no SaaS você troca SQLite→Postgres, local FS→S3, runner local→workers.

* * *

6) Stack: Node/TypeScript como base (e por quê)
-----------------------------------------------

**Minha recomendação segue sendo Node/TypeScript como stack principal**, por três motivos objetivos:

1.  Você já tem o **ffmpeg-server local** e o contrato de integração (multipart / endpoints) bem definido
    
    arquitetura-workflow
    
    .
    
2.  O 4pice Studio nasceu em TS/React; isso facilita reaproveitar patterns (prompt system, UI admin, hooks, etc.)
    
    tmp-prompt
    
    .
    
3.  O sistema de prompts “correto” (ai\_prompts/KB tiers, `getPromptOrThrow`, versionamento) está todo documentado em TS mental-model
    
    tmp-prompt
    
    tmp-prompt
    
    .
    

**Onde Python pode entrar (sem virar o core):**

*   Se amanhã você quiser **Stable Diffusion local**, ou processamento pesado de mídia/ML — mas como “worker plugin”, não como arquitetura principal.
    

* * *

7) Modelo de dados mínimo (pra não virar caos)
----------------------------------------------

Entidades que eu criaria desde o dia 1:

*   `projects`
    
*   `ideas`
    
*   `briefs`
    
*   `plans`
    
*   `scripts`
    
*   `narration_scripts` (stage directions)
    
*   `tts_jobs` + `audio_assets`
    
*   `render_jobs` + `video_assets`
    
*   `image_prompts` + `image_assets` (opcional no MVP)
    
*   `thumbnails`
    
*   `uploads`
    
*   `workflow_runs` (log/linha do tempo)
    
*   `ai_prompts` + `ai_knowledge_base` (copiado do Studio como “fundação”)
    
    tmp-prompt
    

* * *

8) Roadmap prático (sem executar nada agora)
--------------------------------------------

### Fase 0 — “Substituir o n8n” (MVP real)

*   Entrada por CSV/Sheet → gerar roteiro → TTS Azure batch → mandar pro ffmpeg-server render → salvar vídeo local.
    
*   Motor com checkpoints (roteiro/áudio/vídeo) e retry.
    

### Fase 1 — “Trazer o 4pice Studio pra dentro”

*   Implementar Prompt System (ai\_prompts + KB tiers + versionamento) como fundação
    
    tmp-prompt
    
    .
    
*   Wizard UI: ideia → título → brief → planejamento → roteiro.
    
*   Compiler stage-directions → SSML (mantendo o padrão de não-escrever-SSML no texto final)
    
    prompt-stage-directions
    
    .
    

### Fase 2 — “Imagens + templates de vídeo”

*   Gerar prompts por cena, gerar imagens, render com sequência (ou variações).
    
*   Consolidar presets de render (os filtros e otimizações já aprendidos)
    
    graciela-pipeline-v1
    
    .
    

### Fase 3 — “Upload + SaaS-ready”

*   Upload YouTube + metadados
    
*   Multi-projetos/multi-canais
    
*   Migrar storage/DB para cloud quando quiser.
    

* * *

9) Vantagens claras do sistema próprio
--------------------------------------

*   **Controle total do pipeline** (sem “debug de n8n”, sem risco de nó quebrar por referência/expressão) — e vocês já mapearam os antipadrões
    
    licoes-aprendidas-n8n
    
    .
    
*   **Retomada automática** por checkpoints (o maior ganho prático)
    
    arquitetura-workflow
    
    .
    
*   **Iteração rápida de prompts** sem deploy (o maior ganho estratégico)
    
    tmp-prompt
    
    .
    
*   **Local-first de verdade**: elimina o “download do Drive pro servidor” como etapa obrigatória
    
    licoes-aprendidas-n8n
    
    .
    

* * *

Próximo passo (ainda sem executar nada)
---------------------------------------

Se você quiser, eu monto a **especificação do Workflow Engine** (contratos dos steps, estados, artifacts, retries, e o formato do “pipeline manifest” em JSON/YAML) já pronta pra virar ADRs e tasks.

Só me diga o nome oficial do projeto (ex: **Video Factory OS** / **4pice Video Engine** / outro) e se o **MVP** vai começar no modo **Batch (planilha/CSV)** ou **Wizard (UI)** — eu recomendo Batch primeiro porque replica 1:1 o que já funcionava no n8n.

---

