## You asked:

\[Portuguese (auto-generated)\] Criando um Vídeo do zero com o DarkFlow - IA QUE FAZ VIDEOS LONGOS COMPLETOS para o Youtube \[DownSub.com\].txt

Documento

Em anexo está a trancricao de como funciona o SAAS. Estou enviando os prints pois preciso passar para um aIA com uma IDE detalhadamente tudoque tem como funciona como é, visualmente a funcao, tudo, par replicar no meu saas

---

## ChatGPT Replied:

Perfeito. Vou **traduzir tudo que está nos prints + na transcrição** para um **documento técnico–funcional completo**, no nível que você pode **copiar e colar direto em outra IA com IDE** (Cursor, Windsurf, Replit, Lovable, etc.) para **replicar o SaaS**.

A ideia aqui é: **o outro agente “enxerga” o produto sem ver os prints**.

* * *

1\. Visão Geral do Produto (Resumo Executivo)
---------------------------------------------

**Tipo de SaaS**  
Plataforma web para **criação automática de vídeos longos (YouTube)** baseada em IA, com pipeline visual em cards e automação de ponta a ponta.

**Proposta central**

> Criar vídeos completos (roteiro + narração + imagens + música + render final) em poucos cliques, com opção de controle manual ou totalmente automático.

**Fluxo-chave**

    Novo Vídeo
    → Configuração
    → Gerar Roteiro
    → Gerar Narração
    → Gerar Vídeo
    → Download
    

* * *

2\. Arquitetura Mental do Produto (Como pensar o sistema)
---------------------------------------------------------

O produto é organizado em **CARDS DE VÍDEO**, que percorrem **ETAPAS DE PIPELINE**.

### Etapas fixas do pipeline (colunas Kanban):

1.  **Vídeos a Fazer**
    
2.  **Gerar Roteiro**
    
3.  **Gerar Narração**
    
4.  **Gerar Vídeo**
    
5.  **Concluído**
    

Cada vídeo = **1 card** que se move horizontalmente.

* * *

3\. Dashboard Principal (Home)
------------------------------

### Elementos do topo:

*   Logo (DarkFlow)
    
*   Menu:
    
    *   Início
        
    *   Meus Vídeos
        
    *   Tutoriais
        
    *   Thumbs
        
    *   Feedback
        
*   Botões:
    
    *   **Upgrade**
        
    *   Créditos ($)
        
    *   Perfil do usuário
        

### Controles principais:

*   Dropdown: **Meus Cards (Padrão)**
    
*   Botão: **Meus Prompts**
    
*   Toggle: **Auto Vídeo (ON/OFF)**
    
*   Botão CTA primário: **\+ Novo Vídeo**
    

* * *

4\. Criação de Novo Vídeo (Modal)
---------------------------------

Ao clicar em **\+ Novo Vídeo**, abre um modal com opções:

1.  **Modelar Vídeo**
    
    *   Input: URL de um vídeo existente (YouTube)
        
    *   Função: extrair estrutura, ritmo e estilo
        
2.  **Usar Modelo Salvo**
    
    *   Usa presets previamente salvos pelo usuário
        
3.  **Criar Vídeo Sem Modelo** ✅ (fluxo principal)
    
    *   Criação do zero
        
4.  **Roteiro Personalizado**
    
    *   Usuário escreve prompt livre para roteiro
        
5.  **Gerar Apenas Vídeo**
    
    *   Upload manual de áudio + imagens
        

* * *

5\. Tela “Detalhes do Vídeo” (Core do Produto)
----------------------------------------------

Essa tela é organizada em **abas horizontais**:

*   Informações
    
*   Outline
    
*   Roteiro
    
*   Áudios
    
*   Imagens
    
*   Logs
    

* * *

6\. Aba: Informações → Detalhes do Conteúdo
-------------------------------------------

### Campos:

*   **Título do Vídeo** (input texto)
    
*   **Idioma** (dropdown)
    
*   **Duração**
    
    *   Curto (~12 min)
        
    *   Médio
        
    *   Longo
        
*   **Tipo de História**
    
    *   História Geral
        
    *   (Possível expansão futura)
        

* * *

7\. Produção e Voz (Narração)
-----------------------------

### Provedor de Voz:

*   CapCut Voices (ou outro TTS provider)
    

### Lista de vozes (cards clicáveis):

*   Knightley
    
*   Valentino
    
*   ASMR Alice
    
*   ASMR Ethan
    
*   Adam
    
*   Adina
    
*   Alejandro
    
*   etc.
    

Cada voz tem:

*   Botão ▶️ preview
    
*   Ícone ⭐ (favoritar)
    
*   Estado visual selecionado
    

* * *

8\. Mídia e Visual (Parte MAIS IMPORTANTE)
------------------------------------------

### Narrativa Visual – 2 modos

#### 🔹 MODO MANUAL

*   Upload de imagens (até 40)
    
*   Ou geração manual com prompt único
    
*   Controle total imagem por imagem
    

#### 🔹 MODO AUTOMÁTICO ✅

*   Sistema gera imagens baseado no roteiro
    
*   Usuário define:
    
    *   Quantidade de imagens (máx. 10)
        
    *   Repetir imagens (loop) ON/OFF
        

**Comportamento:**

*   Se loop OFF → imagens distribuídas proporcionalmente pelo tempo do vídeo
    
*   Se loop ON → última imagem repete até o final
    

* * *

9\. Geração de Imagens com IA (Manual Avançado)
-----------------------------------------------

### Configurações:

*   Tamanho da imagem:
    
    *   1K (padrão)
        
*   Modo:
    
    *   Única
        
    *   Em lote
        

### Prompt:

Campo grande de texto:

    "Uma paisagem montanhosa ao pôr do sol com céu alaranjado..."
    

### Em lote:

*   Prompts separados por linha
    
*   Sistema detecta automaticamente:
    
    *   nº de prompts
        
    *   nº de imagens a gerar
        

Botão CTA:  
**Gerar Imagem com IA**

* * *

10\. Música de Fundo
--------------------

*   Upload de arquivo `.mp3`
    
*   Música aplicada como background
    
*   (Volume automático ou configurável no futuro)
    

* * *

11\. Legendas e Efeitos
-----------------------

*   Toggle: **Ativar Legenda**
    
*   Toggle: **Efeito de Zoom**
    
    *   Zoom lento e contínuo nas imagens (efeito Ken Burns)
        

* * *

12\. Automação do Pipeline (Auto Vídeo)
---------------------------------------

### Toggle global: **Auto Vídeo**

#### Quando ATIVO:

*   Card avança sozinho:
    
    *   Gerar Roteiro → Narração → Vídeo → Concluído
        

#### Quando DESATIVADO:

*   Card pausa em cada etapa
    
*   Usuário clica manualmente em:
    
    *   “Gerar Narração”
        
    *   “Gerar Vídeo”
        

* * *

13\. Roteiro (IA)
-----------------

*   Gerado automaticamente ao arrastar card para “Gerar Roteiro”
    
*   Baseado em:
    
    *   Título
        
    *   Idioma
        
    *   Tipo de história
        
    *   Duração
        

Usuário pode:

*   Visualizar
    
*   Editar manualmente
    
*   Regerar
    

* * *

14\. Narração (IA)
------------------

*   Texto do roteiro → TTS
    
*   Voz escolhida anteriormente
    
*   Geração rápida (segundos)
    

* * *

15\. Renderização Final
-----------------------

*   Combina:
    
    *   Áudio narrado
        
    *   Imagens
        
    *   Música de fundo
        
    *   Zoom
        
    *   Legendas (se ativas)
        

Após render:

*   Card move para **Concluído**
    
*   Botão **Download**
    
*   Exibe:
    
    *   Duração final
        
    *   Idioma
        
    *   Voz usada
        

* * *

16\. Aba Logs
-------------

*   Mostra:
    
    *   Status de cada etapa
        
    *   Erros de geração
        
    *   Tempo de processamento
        

* * *

17\. Entidades Principais do Backend (Modelagem)
------------------------------------------------

### Video

    id
    title
    language
    duration
    story_type
    status
    auto_video
    created_at
    

### Script

    video_id
    outline
    full_text
    

### Audio

    video_id
    voice_id
    audio_url
    

### Images

    video_id
    image_url
    order
    generated_by_ai (bool)
    

### Render

    video_id
    final_video_url
    render_time
    

* * *

18\. Prompt FINAL para passar para outra IA / IDE
-------------------------------------------------

Copie e cole isso 👇

    Você é um arquiteto de software e product designer sênior.
    
    Quero que você recrie um SaaS idêntico ao DarkFlow (IA de criação de vídeos longos para YouTube).
    
    Vou te descrever exatamente como o sistema funciona visualmente, funcionalmente e logicamente. Seu trabalho é:
    
    1. Criar a arquitetura do sistema (frontend + backend)
    2. Definir componentes de UI
    3. Criar o fluxo completo de estados
    4. Gerar estrutura de banco de dados
    5. Pensar em escalabilidade e automação
    
    O produto funciona com um pipeline Kanban de vídeos:
    Vídeos a Fazer → Gerar Roteiro → Gerar Narração → Gerar Vídeo → Concluído
    
    Cada vídeo é um CARD que percorre esse fluxo.
    
    [COLAR A ESPECIFICAÇÃO QUE EU TE ENTREGUEI AQUI]
    

* * *

19\. Observação Importante (Estratégia)
---------------------------------------

Você não está só “replicando” um SaaS.  
Você está:

*   Criando **uma engine de vídeo baseada em pipeline**
    
*   Que pode virar:
    
    *   Produto standalone
        
    *   Feature interna do seu ecossistema
        
    *   Base para automação de canais dark
        

Se quiser, no próximo passo eu posso:

*   Converter isso em **PRD técnico**
    
*   Converter em **especificação de componentes React**
    
*   Criar **schema Supabase/Postgres**
    
*   Criar **prompt específico para Cursor/Windsurf**
    
*   Ou adaptar isso para **seu SaaS atual**
    

Só me diga qual é o próximo nível.

---

## You asked:

![Imagem carregada](https://chatgpt.com/backend-api/estuary/content?id=file_000000009aec71f58474b89576f5712c&ts=491025&p=fs&cid=1&sig=e7688bf785ccbdc8a7e3b1cf2850af8de150d2915de857c06a79f375ad44ef5e&v=0)

![Imagem carregada](https://chatgpt.com/backend-api/estuary/content?id=file_0000000017f071f593de8ede883f38e4&ts=491025&p=fs&cid=1&sig=1644043e7fb121c9a8a8b18ccc7eded26ace0cbd65e5aa021110cdf05416f7d4&v=0)

![Imagem carregada](https://chatgpt.com/backend-api/estuary/content?id=file_00000000da40720e8e79a77d24058ca9&ts=491025&p=fs&cid=1&sig=e7233f4d1b52450eef9a079495e7ce0c1521a3d45ef3b7726c28dd47c10e0430&v=0)

![Imagem carregada](https://chatgpt.com/backend-api/estuary/content?id=file_00000000e5c071f5a5004e2279da5ddb&ts=491025&p=fs&cid=1&sig=857f285d351cbcf60bc01519e6f60c2587d7afdbd8926edbd5ea913668501fb3&v=0)

![Imagem carregada](https://chatgpt.com/backend-api/estuary/content?id=file_000000005c18720ea2777ec4ecbb0e19&ts=491025&p=fs&cid=1&sig=d87c8dca7fbd034bb12b09e557aed687b2675f4701c4eed7cf6d0ca4dd5d0f2c&v=0)

![Imagem carregada](https://chatgpt.com/backend-api/estuary/content?id=file_000000008b9871f5940ff89a6c780f13&ts=491025&p=fs&cid=1&sig=8aafb70fcfdcbf114ac9caea54ad2de8cd1ac497c706be04886b0513f2802e49&v=0)

Sehuem as imagen (prints) que estavam saltando

---

## ChatGPT Replied:

Perfeito — agora **fechamos o ciclo completo do produto**.  
Esses prints que você mandou **completam as “lacunas visuais” do pipeline**, principalmente **status intermediários, feedback visual, progresso e estados do card**.

Vou organizar isso em **4 camadas**, do jeito ideal para passar para **uma IA com IDE** e **replicar com fidelidade**:

* * *

1️⃣ Estados Visuais do CARD (Pipeline Kanban)
=============================================

Cada **card de vídeo** tem **estados explícitos**, com **feedback visual forte** (isso é parte do valor do produto).

Estrutura base do Card
----------------------

Cada card sempre mostra:

*   **Título do vídeo**
    
*   **Idioma**
    
*   **Voz**
    
*   **Tipo de história**
    
*   **Timestamp (há X minutos)**
    

* * *

1.1 Estado: Gerando Roteiro
---------------------------

**Coluna:** `Gerar Roteiro`

### Elementos visuais:

*   Texto de status:  
    **“Criando roteiro…”**
    
*   Barra de progresso **vermelha**
    
*   Percentual visível (ex: `5%`)
    
*   Ícone animado de loading
    
*   Card **não clicável**
    

📌 **Regra funcional**

*   Esse estado é acionado automaticamente ao:
    
    *   Arrastar o card
        
    *   Ou Auto Video ligado
        

* * *

1.2 Transição automática
------------------------

Quando termina:

*   Toast (canto inferior):
    
    > ✅ **Roteiro gerado!**  
    > Transição automática para narração…
    
*   Card **move automaticamente** para a próxima coluna
    

* * *

1.3 Estado: Gerando Narração
----------------------------

**Coluna:** `Gerar Narração`

### Elementos visuais:

*   Texto: **“Gerando narração…”**
    
*   Ícone de ondas sonoras
    
*   Barra de progresso **vermelha contínua**
    
*   Duração estimada implícita
    

📌 Aqui o sistema:

*   Converte roteiro → TTS
    
*   Usa a **voz escolhida**
    
*   Gera 1 arquivo de áudio final
    

* * *

1.4 Estado: Pronto para Gerar Vídeo (manual)
--------------------------------------------

Se **Auto Video = OFF**:

**Coluna:** `Gerar Vídeo`

O card mostra:

*   Botão primário: **Gerar Vídeo**
    
*   Ícone de câmera
    
*   Nenhuma barra ativa
    

📌 Usuário decide quando renderizar.

* * *

1.5 Estado: Renderizando Vídeo
------------------------------

**Coluna:** `Gerar Vídeo`

### Elementos visuais:

*   Texto: **“Renderizando vídeo…”**
    
*   Barra de progresso **roxa**
    
*   Ícone de frames
    
*   Card bloqueado
    

📌 Aqui ocorre:

*   Sincronização áudio + imagens
    
*   Aplicação de:
    
    *   Zoom
        
    *   Legendas
        
    *   Música de fundo
        
*   Render final (FFmpeg / pipeline)
    

* * *

1.6 Estado: Concluído
---------------------

**Coluna:** `Concluído`

### Elementos visuais:

*   Botão **Download**
    
*   Ícone de download
    
*   Status fixo
    
*   Sem barra de progresso
    
*   Timestamp final
    

📌 Card agora é “produto final”.

* * *

2️⃣ Aba “Imagens” – Pós-Geração Automática
==========================================

Quando as imagens são geradas automaticamente:

### Estrutura:

*   Título:  
    **Imagens Geradas Automaticamente**
    
*   Contador:  
    **6 / 6 imagens**
    
*   Grid 3x2 (ou responsivo)
    

Cada imagem tem:

*   Numeração (`#1`, `#2`, etc.)
    
*   Preview grande
    
*   Ícone de deletar individual
    

📌 **Essas imagens vêm do roteiro**, não de prompts manuais.

* * *

3️⃣ Feedback do Sistema (Micro-interações)
==========================================

Esse SaaS é **muito forte em feedback visual**.  
Isso **precisa ser replicado**.

### Tipos de feedback:

*   Toasts (canto inferior direito):
    
    *   “Roteiro gerado!”
        
    *   “Enviando para geração…”
        
    *   “Vídeo gerado com sucesso!”
        
*   Mudança automática de coluna
    
*   Barras com cores diferentes por etapa
    

📌 Cores como semântica:

*   **Vermelho** → geração textual/áudio
    
*   **Roxo** → render pesado
    
*   **Verde** → sucesso
    
*   **Cinza** → estado neutro
    

* * *

4️⃣ Aba “Efeitos e Acabamento” (Detalhe importante)
===================================================

Essa parte aparece **no final da aba Informações**.

Opções disponíveis:
-------------------

### 🎵 Música de Fundo

*   Upload `.mp3`
    
*   Limite: **100MB**
    
*   Área drag & drop
    
*   Música única para todo vídeo
    

* * *

### ✨ Efeitos

*   **Legendas Automáticas** (toggle)
    
*   **Efeito de Zoom** (toggle)
    
    *   Zoom suave nas imagens (Ken Burns)
        

📌 Esses toggles **impactam diretamente o render**.

* * *

5️⃣ Modelo Mental do Sistema (IMPORTANTE para replicar)
=======================================================

Esse SaaS funciona como:

> **Uma máquina de estados visuais + jobs assíncronos**

### Cada etapa:

*   Dispara um job
    
*   Atualiza status
    
*   Atualiza UI
    
*   Move card automaticamente
    

📌 Não é “uma tela com botão”.  
É **um orquestrador visual de jobs de IA**.

* * *

6️⃣ Prompt FINAL (versão definitiva para IDE / IA)
==================================================

Copie e cole isso 👇  
Esse prompt está **pronto para Cursor / Windsurf / Claude / GPT-4o**:

    Você é um arquiteto de software sênior especializado em SaaS com IA.
    
    Quero recriar um SaaS idêntico ao DarkFlow (plataforma de criação automática de vídeos longos para YouTube).
    
    O sistema funciona com:
    - Pipeline Kanban visual
    - Cards que representam vídeos
    - Estados visuais explícitos (gerando roteiro, gerando narração, renderizando, concluído)
    - Automação opcional via toggle “Auto Video”
    
    Cada etapa é um job assíncrono que:
    1. Atualiza status
    2. Atualiza UI
    3. Move o card de coluna automaticamente
    
    O produto inclui:
    - Geração de roteiro por IA
    - Narração por TTS
    - Geração automática de imagens baseada no roteiro
    - Upload manual opcional
    - Música de fundo
    - Legendas automáticas
    - Efeito de zoom
    - Render final com barra de progresso
    
    Quero:
    - Arquitetura frontend (React)
    - Modelagem backend (jobs, filas, estados)
    - Estrutura de banco
    - Componentes de UI
    - Fluxo de estados
    - Estratégia de render (FFmpeg ou equivalente)
    
    Use como referência um SaaS com UX premium, feedback visual constante e automação forte.
    

* * *

7️⃣ Próximo passo (sugestão estratégica)
========================================

Se quiser, no próximo passo eu posso:

1.  **Converter isso em PRD técnico**
    
2.  **Criar schema de banco (Postgres / Supabase)**
    
3.  **Desenhar o state machine (XState / Zustand)**
    
4.  **Gerar backlog de features**
    
5.  **Comparar com seu SaaS atual e integrar**
    
6.  **Criar versão melhorada (DarkFlow 2.0)**
    

👉 Me diga:  
**você quer replicar 1:1 ou quer evoluir esse produto?**

---

## You asked:

Ja tenho um SAAS bem adiantado, quero trazer a inteligencia desse , tem coisas melhores que o meu que posso aproveitar para melhorar, pra isso talvez um PRD e um prompt sejam o ideal. oque acha? Quer que eu traga alguma informação?

---

## ChatGPT Replied:

Acho **exatamente o caminho certo** 👍  
E melhor ainda: **não precisa trazer tudo agora** — dá pra fazer isso em **2 camadas bem objetivas**, sem te gerar retrabalho.

Vou te responder em três partes:

1.  **O que eu recomendo fazer (estratégia)**
    
2.  **Como seria o PRD ideal nesse caso**
    
3.  **Quais informações você PRECISA trazer (mínimo necessário)**
    

* * *

1️⃣ Minha recomendação (direto ao ponto)
----------------------------------------

Como você **já tem um SaaS avançado**, o objetivo **não é replicar o DarkFlow**, e sim:

> **Extrair a inteligência operacional, de UX e de automação**  
> e **acoplar isso ao seu produto atual**.

Por isso, o melhor combo é exatamente o que você sugeriu:

### ✅ **PRD focado em “Inteligência Aproveitável”**

### ✅ **Prompt de engenharia para IDE / IA**

👉 Não um PRD genérico.  
👉 Um **PRD comparativo e cirúrgico**.

* * *

2️⃣ Como eu faria o PRD (estrutura ideal)
-----------------------------------------

Esse PRD não descreve “o produto inteiro”.  
Ele descreve **o que vale a pena absorver**.

### 📄 Estrutura do PRD (enxuto e poderoso)

### 1\. Contexto

*   Seu SaaS atual (nível alto)
    
*   Problema que queremos resolver
    
*   Por que o DarkFlow é referência nesse ponto
    

* * *

### 2\. Inteligências-chave identificadas no DarkFlow

Aqui entram coisas como:

*   Pipeline Kanban com jobs assíncronos
    
*   Feedback visual constante
    
*   Automação via toggle (Auto Video)
    
*   Card como unidade de execução
    
*   Estado explícito > botão
    

📌 **Isso vira requisito conceitual**, não cópia visual.

* * *

### 3\. O que o SEU SaaS já faz melhor

(importantíssimo para não piorar o produto)

Ex:

*   Performance
    
*   Qualidade de IA
    
*   Controle manual
    
*   Público mais avançado
    
*   Flexibilidade maior
    

* * *

### 4\. O que vamos importar do DarkFlow

Exemplos:

*   Máquina de estados visuais
    
*   Orquestração automática de etapas
    
*   Progresso visível
    
*   Separação clara: “configurar” vs “executar”
    

* * *

### 5\. O que NÃO vamos importar

(anti-features)

Ex:

*   Limitações de customização
    
*   UX simplificada demais
    
*   Falta de controle fino
    

* * *

### 6\. Requisitos Funcionais (novos ou ajustados)

*   Estados
    
*   Jobs
    
*   UI
    
*   Automação
    
*   Logs
    
*   Feedback
    

* * *

### 7\. Requisitos Não Funcionais

*   Escalabilidade
    
*   Observabilidade
    
*   Performance
    
*   UX premium
    

* * *

### 8\. Métricas de sucesso

*   Tempo de execução
    
*   Redução de cliques
    
*   Clareza percebida
    
*   Taxa de erro
    
*   Satisfação do usuário
    

* * *

3️⃣ Prompt ideal (para IA + IDE)
--------------------------------

Depois do PRD, eu gero **um prompt único**, do tipo:

> “Use este PRD para adaptar o sistema existente, sem quebrar arquitetura, reaproveitando código onde possível”.

Esse prompt serve para:

*   Cursor
    
*   Windsurf
    
*   Claude
    
*   GPT-4.1 / 4o
    
*   Lovable
    
*   Replit
    

* * *

4️⃣ O que você precisa me trazer (mínimo necessário)
----------------------------------------------------

Você perguntou se precisa trazer informação — **sim, mas pouca**.

### 🔑 Traga apenas isso (responda em texto mesmo):

#### 1️⃣ Seu SaaS hoje:

*   O que ele faz em **1 frase**
    
*   Público-alvo
    
*   Stack (ex: Next + Supabase, etc.)
    

#### 2️⃣ Onde você sente que ele é mais fraco hoje:

Escolha 1 ou 2:

*   UX confusa
    
*   Falta de feedback
    
*   Automação ruim
    
*   Execução muito manual
    
*   Usuário se perde no fluxo
    

#### 3️⃣ Onde você acha o DarkFlow melhor que o seu:

Ex:

*   “Fluxo visual”
    
*   “Sensação de progresso”
    
*   “Automação”
    
*   “Velocidade percebida”
    

📌 **Não precisa explicar tudo**, só listar.

* * *

5️⃣ Próximo passo (objetivo)
----------------------------

Assim que você me passar isso, eu:

1.  Crio o **PRD comparativo**
    
2.  Extraio a **inteligência do DarkFlow**
    
3.  Adapto para **o SEU produto**
    
4.  Entrego:
    
    *   PRD pronto
        
    *   Prompt de engenharia
        
    *   Sugestões de melhoria (sem inflar escopo)
        

* * *

👉 **Resumo final**  
Você está fazendo o movimento certo:  
não copiar produto — **copiar inteligência**.

Me manda essas 3 infos acima que a gente já começa no nível certo.

---

## You asked:

Vou te mandar o systemap que pedi para o claude opus 4.5 como o antigrevity (ide) criaram # 🗺️ Video Factory OS — System Map > \*\*Documento de Referência Completa para Compartilhamento com IAs\*\* > \*\*Versão:\*\* 1.0 | \*\*Data:\*\* 2026-01-06 | \*\*SHA:\*\* `51e2ef9` --- ## 📚 Índice 1. \[Visão Geral\](#1-visão-geral) 2. \[Arquitetura\](#2-arquitetura) 3. \[Modelo de Dados\](#3-modelo-de-dados) 4. \[Rotas e Páginas\](#4-rotas-e-páginas) 5. \[Componentes\](#5-componentes) 6. \[Engine de Execução\](#6-engine-de-execução) 7. \[Fluxos Principais\](#7-fluxos-principais) 8. \[Configurações Config-First\](#8-configurações-config-first) --- ## 1. Visão Geral ### O que é? \*\*Video Factory OS\*\* é um sistema local-first para produção de vídeos, substituindo o n8n. Produz vídeos narrativos de longa duração para YouTube de forma automatizada. ### Princípios Fundamentais - \*\*Config-First\*\*: Nada hardcoded. Prompts, vozes, presets, tudo vem do banco. - \*\*Manifest-First\*\*: Todo job gera um manifest JSON como fonte da verdade. - \*\*Checkpoint Idempotente\*\*: Cada step pode ser retomado sem reprocessar anteriores. - \*\*Local Render\*\*: FFmpeg com VideoToolbox (Mac GPU) para render rápido. ### 5 Módulos do Produto | Módulo | Descrição | Status | |--------|-----------|--------| | \*\*Project Manager\*\* | Projetos, episódios, presets, biblioteca | ✅ Parcial | | \*\*Script Studio\*\* | Editor de roteiro, timestamps | ⏳ Parcial | | \*\*Voice Lab\*\* | Editor SSML, preview, TTS | ⏳ Não implementado | | \*\*Video Factory\*\* | Pipeline de jobs, render FFmpeg | ✅ Implementado | | \*\*Dashboard\*\* | Lista de jobs, logs, re-run | ✅ Implementado | --- ## 2. Arquitetura

    ┌─────────────────────────────────────────────────────────────────┐
    │                        FRONTEND (Next.js 14)                    │
    ├─────────────────────────────────────────────────────────────────┤
    │  /admin/*          │  /wizard/*       │  /jobs/*               │
    │  (Config Pages)    │  (Wizard Flow)   │  (Job Management)      │
    ├─────────────────────────────────────────────────────────────────┤
    │                     COMPONENTS                                   │
    │  /layout/*  │  /ui/*  │  /vf/*                                  │
    │  (AppShell) │ (shadcn)│ (Video Factory Components)              │
    ├─────────────────────────────────────────────────────────────────┤
    │                       API ROUTES                                 │
    │  /api/jobs  │  /api/artifacts  │  /api/render  │  /api/health  │
    ├─────────────────────────────────────────────────────────────────┤
    │                         ENGINE                                   │
    │  runner.ts → executors/* → providers.ts → adapters/*            │
    ├─────────────────────────────────────────────────────────────────┤
    │                      DATA LAYER                                  │
    │  SQLite + Drizzle ORM │ File Artifacts in /jobs/*               │
    ├─────────────────────────────────────────────────────────────────┤
    │                    EXTERNAL SERVICES                             │
    │       Claude (LLM)    │    Azure (TTS)    │   ImageFX           │
    └─────────────────────────────────────────────────────────────────┘

\### Stack Técnico - \*\*Frontend\*\*: Next.js 14 App Router + React + Tailwind + shadcn/ui - \*\*Backend\*\*: Next.js API Routes + Server Actions - \*\*Database\*\*: SQLite + Drizzle ORM - \*\*LLM\*\*: Claude (Anthropic) - \*\*TTS\*\*: Azure Speech Services - \*\*Images\*\*: Google ImageFX (via adapter) - \*\*Render\*\*: FFmpeg local (VideoToolbox no Mac) --- ## 3. Modelo de Dados ### Tabelas Principais #### Config (Governança) | Tabela | Descrição | |--------|-----------| | `prompts` | Templates de prompt com variáveis, model config | | `providers` | Claude, Azure, ImageFX - configs de API | | `recipes` | Pipeline JSON por canal (ex: Graciela) | | `knowledge_base` | Docs de contexto por tier (tier1/tier2/tier3) | | `validators` | Regras de validação (regex, min\_words, etc) | | `execution_bindings` | Wiring: step → prompt → provider → preset | #### Presets | Tabela | Descrição | |--------|-----------| | `presets_voice` | Azure voice config: voice, rate, pitch, style | | `presets_video` | FFmpeg: encoder, scale, fps, bitrate | | `presets_effects` | Filtergraph FFmpeg | | `presets_ssml` | SSML templates + pause mapping | #### Execução | Tabela | Descrição | |--------|-----------| | `projects` | Projetos de vídeo (canal/persona) | | `jobs` | Execuções de vídeo | | `job_steps` | Estado de cada step (status, output\_refs, logs) | | `artifacts` | Arquivos gerados (audio, video, text) | --- ## 4. Rotas e Páginas ### Admin Pages (`/admin/*`) | Rota | Função | |------|--------| | `/admin/projects` | CRUD de projetos | | `/admin/recipes` | Gerenciar recipes/pipelines | | `/admin/prompts` | Gerenciar prompts | | `/admin/providers` | Gerenciar providers (Claude/Azure) | | `/admin/presets` | Voice & Video presets | | `/admin/presets/video` | Video presets específico | | `/admin/validators` | Regras de validação | | `/admin/knowledge-base` | Docs de contexto (tier1/2/3) | | `/admin/execution-map` | Wiring: step → configs | | `/admin/imagefx-config` | Config ImageFX | | `/admin/script-studio` | Editor de roteiro | | `/admin/timeline-test` | Testes de Timeline DSL | ### Wizard (`/wizard/*`) | Rota | Função | |------|--------| | `/wizard` | Lista de jobs em modo wizard | | `/wizard/[jobId]` | Execução passo-a-passo do job | ### Jobs (`/jobs/*`) | Rota | Função | |------|--------| | `/jobs` | Lista de jobs (dashboard) | | `/jobs/new` | Criar novo job | | `/jobs/[id]` | Detalhes do job | | `/jobs/[id]/script` | Versões do roteiro | ### API Routes (`/api/*`) | Rota | Função | |------|--------| | `/api/jobs/*` | CRUD de jobs | | `/api/jobs/[id]/artifacts/[step]` | Servir artefatos | | `/api/render/*` | API do render worker | | `/api/health` | Health check | | `/api/artifacts/*` | Servir arquivos | --- ## 5. Componentes ### Layout (`/components/layout/`) | Componente | Função | |------------|--------| | `AppShell` | Layout principal com sidebar | | `PageHeader` | Cabeçalho de páginas | | `Sidebar` | Menu lateral | | `SplitView` | Lista + Detalhe | | `FiltersBar` | Filtros e busca | | `SectionCards` | Cards de seções/tabs | ### VF Components (`/components/vf/`) | Componente | Função | |------------|--------| | \*\*Wizard\*\* | | | `WizardStepper` | Stepper hierárquico 2 níveis | | `StepExecutionProgress` | Feedback de execução com timer | | `GeneratedResultCard` | Card de resultado estruturado | | `IterateWithAI` | Campo de iteração com IA | | `WizardFooter` | Navegação footer | | `WizardApprovalActions` | Ações de aprovação | | `StepConfigurator` | Config de cenas (modo 7x1, etc) | | `PreviousStepsContext` | Contexto de steps anteriores | | \*\*Jobs\*\* | | | `JobCard` | Card resumido de job | | `PipelineView` | Visualização do pipeline | | `StepIndicator` | Indicador de status do step | | `StepPreview` | Preview de artefatos | | `LogsViewer` | Visualizador de logs | | `ManifestViewer` | Visualizador de manifest | | `JobArtifactsTab` | Tab de artefatos | | `JobConfigTab` | Tab de configuração | | \*\*Design System\*\* | | | `CharacterCard` | Cards de personagens narrativos | | `NarrativeStructure` | Estrutura narrativa com plot points | | `TimestampGenerator` | Gerador de timestamps YouTube | | `TagChips` | Tags editáveis | | `TierExplainer` | Explicação dos tiers KB | | `UsageIndicator` | Badge de uso | | `UsedBySection` | Seção "usado por" | | `ProcessNotification` | Toast de processos | | `ErrorDetail` | Detalhes de erro | | `StatusBadge` | Badge de status | | `ProgressRing` | Anel de progresso | | `MetricCard` | Card de métrica | | `QuickAction` | Ação rápida | --- ## 6. Engine de Execução ### Runner (`lib/engine/runner.ts`) Orquestra a execução de jobs: 1. Carrega job e recipe do DB 2. Para cada step do pipeline: - Carrega config (bindings → prompt + provider + kb + validators) - Executa executor apropriado - Salva artefatos e atualiza status 3. Gera manifest final ### Executores (`lib/engine/executors/`) | Executor | Função | |----------|--------| | `llm.ts` | Chama Claude com prompt + KB | | `tts.ts` | Gera áudio via Azure TTS | | `transform.ts` | Limpa/transforma texto | | `render.ts` | Renderiza vídeo com FFmpeg | | `scene-prompts.ts` | Gera prompts de imagem por cena | | `generate-images.ts` | Gera imagens via ImageFX | ### Providers (`lib/engine/providers.ts`) Abstração para APIs externas: - `executeLLM()` → Claude - `executeTTS()` → Azure Speech - `executeImageGeneration()` → ImageFX ### Adapters (`lib/adapters/`) | Adapter | Função | |---------|--------| | `imagefx.ts` | Integração com Google ImageFX | ### Timeline Engine (`lib/timeline/`) Sistema declarativo para composição de vídeo: - `schema.ts` — Types: Timeline, Scene, Element - `validator.ts` — Validação Zod - `render-plan.ts` — RenderPlan + presets - `compiler.ts` — Timeline → comandos FFmpeg --- ## 7. Fluxos Principais ### Fluxo 1: Criar Job via Wizard

    1. /wizard → Selecionar recipe
    2. /wizard/[jobId] → Executar steps:
       ├─ ideacao (LLM)
       ├─ titulo (LLM)
       ├─ brief (LLM)
       ├─ planejamento (LLM)
       ├─ roteiro (LLM + validators)
       ├─ prompts_cenas (LLM) → StepConfigurator (modo 7x1)
       ├─ gerar_imagens (ImageFX)
       ├─ tts (Azure)
       ├─ render (FFmpeg)
       └─ export
    3. Artefatos salvos em /jobs/{jobId}/*

\### Fluxo 2: Pipeline Automático

    1. /jobs/new → Input inicial + selecionar recipe
    2. POST /api/jobs → Cria job
    3. Runner executa todos steps automaticamente
    4. /jobs/[id] → Ver resultado, retry steps

\### Fluxo 3: Admin Config

    1. /admin/prompts → Criar/editar prompts
    2. /admin/providers → Configurar Claude/Azure
    3. /admin/presets → Voice/Video presets
    4. /admin/execution-map → Wiring: step → configs
    5. /admin/recipes → Definir pipeline

\--- ## 8. Configurações Config-First ### O que vive no DB (nunca hardcoded) | Tipo | Tabela | Exemplo | |------|--------|---------| | Prompts | `prompts` | "Roteiro Graciela v7" | | Vozes | `presets_voice` | "Ximena Multilingual" | | Encoders | `presets_video` | "1080p VideoToolbox" | | Pipelines | `recipes` | "Graciela YouTube Long" | | Contextos | `knowledge_base` | "DNA do Canal (tier1)" | | Validações | `validators` | "min\_6000\_words" | | Wiring | `execution_bindings` | step → prompt + provider | ### Regras de Ouro 1. \*\*Prompt-as-Data\*\*: `getPromptOrThrow()` — falha se não encontrar 2. \*\*Config-First\*\*: Nenhum prompt/voice/preset hardcoded 3. \*\*Manifest-First\*\*: Todo job gera `manifest.json` 4. \*\*Checkpoint\*\*: Re-run de step sem reprocessar anteriores --- ## 📊 Estatísticas do Sistema | Métrica | Valor | |---------|-------| | Tabelas no DB | 15+ | | Páginas Admin | 11 | | Componentes VF | 31 | | Arquivos Engine | 27 | | Executores | 6 | | Adapters | 1 | | Lines of Code (estimado) | ~15k | --- ## 🔗 Arquivos de Referência Importantes - \*\*PRD\*\*: `docs/04-produto/prd.md` - \*\*Architecture\*\*: `docs/04-produto/architecture.md` - \*\*Troubleshooting\*\*: `docs/00-regras/operacao/troubleshooting.md` - \*\*Creation Engine Blueprint\*\*: `docs/tm.md` - \*\*Workflow de Início\*\*: `docs/00-regras/workflow-inicio.md` --- \*\*Última atualização:\*\* 2026-01-06 \*\*Mantido por:\*\* Sistema de Governança Video Factory OS

---

## ChatGPT Replied:

Excelente. Agora ficou **claríssimo o nível do seu sistema** — e isso muda completamente **como** a gente deve usar a inteligência do DarkFlow a seu favor.

Vou ser direto, estratégico e honesto 👇  
**Você NÃO precisa de um PRD “do zero”**.  
Você precisa de um **PRD de Acoplamento de Inteligência** + **um Prompt de Engenharia Contextual**.

* * *

1️⃣ Diagnóstico rápido do seu sistema (Video Factory OS)
--------------------------------------------------------

Antes de propor qualquer coisa, aqui vai meu **diagnóstico técnico** lendo o seu _System Map_:

### 🔥 Pontos fortes do seu SaaS (claramente acima do DarkFlow)

Você já tem algo **mais sofisticado** que o DarkFlow em:

*   **Config-First real** (prompts, vozes, presets, wiring)
    
*   **Manifest-First + Checkpoint Idempotente**
    
*   **Engine declarativa (Timeline DSL + FFmpeg compiler)**
    
*   **Separação clara de responsabilidades (executors / adapters / providers)**
    
*   **Wizard + Admin profundo**
    
*   **Local render GPU (VideoToolbox)**
    

👉 Em termos de **engenharia**, o DarkFlow **não chega perto**.

* * *

### ⚠️ Onde o DarkFlow é melhor (e aqui está o ouro)

O DarkFlow vence **não por arquitetura**, mas por:

1.  **Modelo mental extremamente simples para o usuário**
    
2.  **Pipeline Kanban visual como “orquestrador cognitivo”**
    
3.  **Estados explícitos + feedback visual constante**
    
4.  **Automação perceptiva (Auto Video)**
    
5.  **Progressão física (card andando)**
    

👉 Ele **transforma um sistema complexo em algo “óbvio”**.

* * *

2️⃣ O que vale a pena importar do DarkFlow (e o que NÃO)
--------------------------------------------------------

### ✅ O que você DEVE importar

#### 1\. **Kanban como camada de ORQUESTRAÇÃO VISUAL**

Não como engine, mas como **UI state machine**.

*   Seu engine continua igual
    
*   O Kanban vira:
    
    *   uma _view_ do estado do job
        
    *   um _controlador de execução_
        

* * *

#### 2\. **Card como unidade cognitiva**

Hoje você tem:

*   Job
    
*   Step
    
*   Artifact
    
*   Manifest
    

O DarkFlow empacota tudo isso num **CARD**.

👉 Recomendo:

*   `JobCard = Manifest + CurrentStep + Progress + CTA`
    

* * *

#### 3\. **Estados explícitos e coloridos**

No seu sistema, o estado existe.  
No DarkFlow, o estado **grita**.

Exemplo de mapeamento perfeito para você:

| Seu sistema | DarkFlow-style UI |
| --- | --- |
| job\_steps.status | Barra + texto |
| executor running | “Gerando narração…” |
| render executor | “Renderizando vídeo…” (roxo) |
| completed | Card com Download |

* * *

#### 4\. **Auto Video = execução contínua**

Você já tem isso **tecnicamente**.

Falta:

*   Um **toggle global**
    
*   Uma **regra simples**:
    
    > “Se AutoVideo ON → runner executa tudo sem intervenção”
    

Isso conversa **perfeitamente** com seu `runner.ts`.

* * *

### ❌ O que você NÃO deve importar

*   UX simplificada demais
    
*   Falta de edição profunda
    
*   Limitação de pipelines
    
*   Ausência de validação forte
    
*   Falta de admin/config
    

👉 Seu sistema já é **DarkFlow Pro Max**.  
Só precisa ficar **mais legível**.

* * *

3️⃣ O PRD ideal para você (não tradicional)
-------------------------------------------

O PRD que você precisa é este:

> **PRD — Camada de Orquestração Visual & Automação**

Não descreve o produto inteiro.  
Descreve **uma camada nova sobre o que já existe**.

* * *

### 📄 Estrutura do PRD (recomendada)

#### 1\. Contexto

*   Video Factory OS (arquitetura existente)
    
*   Problema: complexidade percebida > valor percebido
    

* * *

#### 2\. Objetivo do PRD

Adicionar:

*   Orquestração visual
    
*   Progresso explícito
    
*   Automação perceptiva
    

Sem:

*   Quebrar engine
    
*   Duplicar lógica
    
*   Criar acoplamento ruim
    

* * *

#### 3\. Conceito Central

> “O usuário não executa steps.  
> Ele **acompanha um processo que se move sozinho**.”

* * *

#### 4\. Nova Camada: **Pipeline Visual**

*   View Kanban baseada em `job_steps`
    
*   Cada coluna = grupo lógico de steps
    
*   Card reflete:
    
    *   estado
        
    *   progresso
        
    *   CTA possível
        

* * *

#### 5\. Estados do Card (state machine)

*   idle
    
*   running(step)
    
*   waiting(user)
    
*   rendering
    
*   completed
    
*   error
    

* * *

#### 6\. Automação (Auto Video)

*   Toggle global
    
*   Runner respeita:
    
    *   `auto_run: true`
        
    *   `auto_run: false`
        

* * *

#### 7\. Feedback e UX

*   Toasts
    
*   Progress bars
    
*   Cores semânticas
    
*   Movimentação automática
    

* * *

#### 8\. Métricas de sucesso

*   Menos cliques
    
*   Menos abandono
    
*   Menos confusão
    
*   Mais jobs concluídos sem intervenção
    

* * *

4️⃣ Prompt IDE / IA (adaptado AO SEU SISTEMA)
---------------------------------------------

Esse prompt é **muito importante**, porque ele respeita tudo que você já construiu.

Copie e cole 👇

    Você é um arquiteto de software sênior.
    
    Tenho um sistema chamado Video Factory OS, já implementado, com:
    - Engine config-first
    - Runner com jobs e steps
    - Manifest-first
    - Execução idempotente
    - Render local com FFmpeg
    - Wizard e Admin avançados
    
    NÃO quero reescrever o sistema.
    
    Quero adicionar uma NOVA CAMADA chamada:
    "Orquestração Visual e Automação Perceptiva"
    
    Objetivo:
    - Criar uma UI estilo Kanban (inspirada no DarkFlow)
    - Cada job vira um CARD
    - O card reflete o estado real do job_steps
    - O runner continua sendo a fonte da verdade
    
    Requisitos:
    1. Nenhuma lógica de execução duplicada
    2. UI reage apenas a mudanças de estado
    3. Toggle global "Auto Video"
    4. Estados explícitos:
       - Gerando roteiro
       - Gerando narração
       - Gerando imagens
       - Renderizando vídeo
       - Concluído
    5. Feedback visual constante (progress, cores, toasts)
    
    Use:
    - Next.js App Router
    - Componentes existentes (JobCard, PipelineView, StepIndicator)
    - job_steps + manifest.json como source of truth
    
    Desenhe:
    - State machine do card
    - Mapeamento step → coluna
    - Componentes de UI necessários
    - Integração mínima com runner.ts
    

* * *

5️⃣ Resposta direta à sua pergunta
----------------------------------

> _“Talvez um PRD e um prompt sejam o ideal. O que acha?”_

👉 **Acho perfeito.**  
👉 Mas **não um PRD genérico**.  
👉 Um **PRD de acoplamento de inteligência**, exatamente como acima.

* * *

6️⃣ Próximo passo (sugestão)
----------------------------

Se quiser, no próximo turno eu posso:

1.  **Escrever esse PRD completo**, já no formato `docs/04-produto/prd-orquestracao-visual.md`
    
2.  **Desenhar o state machine visual**
    
3.  **Mapear seus executors → colunas Kanban**
    
4.  **Propor mudanças mínimas no runner.ts**
    
5.  **Desenhar os componentes React exatos**
    

👉 Me diga:  
**quer que eu já escreva o PRD agora ou prefere que eu faça primeiro um mapa visual (ASCII/diagrama) do pipeline?**

---

## You asked:

Reveja toda imagem, reveja a transcricao entenda tudo completamente para qiue a gent nao perca. enhumd etalhe e traga o mais detalhado possivel as inforacoes em prompt e/ou prd para enviarmos para a ide

---

## ChatGPT Replied:

Pensou por 6m 27s

Perfeito — dá pra aproveitar **muita** inteligência desse DarkFlow (UX + fluxo mental + controles “certos”) e plugar no seu **Video Factory OS** sem perder o que você já construiu (config-first / manifest-first / checkpoints).

Abaixo está a consolidação **mais completa possível** do que aparece **nos prints + na transcrição**, e em seguida eu te entrego:

1.  um **mini-PRD “DarkFlow UI Layer”** (pronto pra virar doc), e
    
2.  um **PROMPT mestre** pra você colar no Antigravity/IDE implementar com fidelidade.
    

* * *

1) O que o DarkFlow está fazendo (reconstrução fiel)
----------------------------------------------------

### 1.1 Home = Kanban por status (pipeline visual)

O sistema opera como um **quadro Kanban** com colunas (cada coluna é um estágio do pipeline):

*   **Vídeos a Fazer**
    
*   **Gerar Roteiro**
    
*   **Gerar Narração**
    
*   **Gerar Vídeo**
    
*   **Concluído**
    

No topo do quadro:

*   navegação: **Início / Meus Vídeos / Tutoriais / Thumbs / Feedback**
    
*   controles: **Usuários**, **Chunks**, dropdown **“Meus Cards (Padrão)”**, botão **“Meus Prompts”**
    
*   toggle global **“Auto Vídeo”**
    
*   CTA primário: **“+ Novo Vídeo”** (botão vermelho)
    

### 1.2 Card (o “job”) — estrutura e metadata mínima

Cada card mostra:

*   **Título** (muitas vezes truncado)
    
*   tags/pills:
    
    *   **Idioma** (ex: Português)
        
    *   **Voz** (ex: Valentino)
        
    *   **Tipo** (ex: História Geral)
        
*   menu **(⋮)** no card
    
*   status/tempo: “há X minutos”
    
*   em “Concluído” existe botão **Download**
    

### 1.3 Criação de vídeo (modal “Novo Vídeo”)

Ao clicar **Novo Vídeo**, abre um modal com 5 caminhos:

1.  **Modelar Vídeo** (colocar URL de vídeo existente e “modelar”)
    
2.  **Usar Modelo Salvo**
    
3.  **Criar Vídeo Sem Modelo**
    
4.  **Roteiro Personalizado**
    
5.  **Gerar Apenas Vídeo** (subir áudio/imagens e gerar só o vídeo)
    

Na transcrição, o fluxo escolhido foi **“Criar um vídeo sem modelo”**

\[Portuguese (auto-generated)\] C…

.

### 1.4 Detalhes do Vídeo (um “drawer/página” com tabs)

Ao abrir um card, você entra em **Detalhes do Vídeo** com:

*   header: título “Detalhes do Vídeo”
    
*   um **ID curto** (ex: `c4aae883-5…`) com ícone de copiar
    
*   botão **Modelos**
    
*   status (ex: **Concluído**)
    

Tabs visíveis:

*   **Informações**
    
*   **Outline**
    
*   **Imagens** (com contador, ex: 6)
    
*   **Roteiro**
    
*   **Áudios** (com contador, ex: 1)
    
*   **Logs**
    

### 1.5 “Informações” = metadados + voz

Dentro de “Informações” aparecem:

**Detalhes do Conteúdo**

*   **Título do vídeo**
    
*   **Idioma**
    
*   **Duração** (ex: “Curto (~12 min)”)
    
*   **Tipo de História** (ex: “História Geral”)
    

**Produção e Voz**

*   “Provider de Voz”: no print aparece **CapCut Voices**
    
*   lista de vozes com:
    
    *   botão **play** (preview)
        
    *   ícone de **favorito** (estrela)
        
    *   seleção com borda/estado de ativo
        
*   exemplo: escolher “Valentino” na transcrição
    
    \[Portuguese (auto-generated)\] C…
    

Também existe uma seção recolhível “**Configurações Avançadas**”.

### 1.6 “Mídia e Visual” = 3 modos de narrativa visual

No detalhe há um bloco **Mídia e Visual** → **Narrativa Visual**, com 2 grandes escolhas:

*   **Manual**
    
    *   **Upload de Imagens**
        
    *   **Gerar Imagens com IA**
        
*   **Automático**
    
    *   “Gerar imagens automaticamente de acordo com o roteiro”
        

Na transcrição ele explica exatamente:

*   Manual: “plugar minhas imagens” ou gerar com prompts personalizados
    
    \[Portuguese (auto-generated)\] C…
    
*   Dentro de “Gerar com IA” existem dois submodos:
    
    *   **Única**: gera **uma imagem por vez**
        
        \[Portuguese (auto-generated)\] C…
        
    *   **Em lote**: cola vários prompts separados por **linha em branco** e o sistema conta/gera automático
        
        \[Portuguese (auto-generated)\] C…
        

No **Automático**, você escolhe:

*   **Quantas imagens gerar (máx. 10)** (no exemplo ele coloca **6**)
    
    \[Portuguese (auto-generated)\] C…
    
*   toggle **“Repetir imagens (Loop)”**
    
    *   se marcado: ao chegar na última, repete até o final
        
        \[Portuguese (auto-generated)\] C…
        
    *   se desmarcado: distribui proporcionalmente no tempo do vídeo (ex: 12 min / 6 imgs ≈ 2 min cada)
        
        \[Portuguese (auto-generated)\] C…
        

No print também existe ajuste de **tamanho/qualidade** (ex: “1K (Padrão)”) no modo gerar com IA.

### 1.7 Música, legenda e zoom = “acabamento” simples (e certeiro)

Ainda no detalhe:

*   **Música de Fundo**: upload de mp3
    
    \[Portuguese (auto-generated)\] C…
    
*   **Legendas Automáticas** (toggle)
    
    \[Portuguese (auto-generated)\] C…
    
*   **Efeito de Zoom** (toggle)
    
    \[Portuguese (auto-generated)\] C…
    

### 1.8 Execução: drag & drop + Auto Vídeo

O jeito de rodar é **arrastar o card**:

*   Ele “clica em concluído” (salva config) e **arrasta para “Gerar Roteiro”**
    
    \[Portuguese (auto-generated)\] C…
    
*   Ao arrastar, o processo começa automático
    
    \[Portuguese (auto-generated)\] C…
    
*   O toggle **Auto Vídeo** controla o comportamento:
    
    *   **ligado**: quando chega no estágio “Gerar Vídeo”, gera automaticamente, vai pra “Concluído” e é só baixar
        
        \[Portuguese (auto-generated)\] C…
        
    *   **desligado**: o card **para em “Gerar Vídeo”** e você precisa apertar **“Gerar Vídeo”** manualmente
        
        \[Portuguese (auto-generated)\] C…
        

Ele relata a sequência rápida: roteiro → narração → gerar vídeo → renderização → concluído

\[Portuguese (auto-generated)\] C…

.

* * *

2) PRD — “DarkFlow UI Layer” para o Video Factory OS (plugar no seu System Map)
===============================================================================

2.1 Objetivo
------------

Adicionar uma camada de produto/UX inspirada no DarkFlow para:

*   reduzir fricção de “criar → configurar → rodar → baixar”
    
*   transformar pipeline em **Kanban operável** (drag & drop)
    
*   padronizar “Detalhes do Job” com tabs e controles de acabamento.
    

2.2 Escopo
----------

### Inclui

1.  **Kanban Jobs Board** (colunas do pipeline, contadores, cards)
    
2.  **Auto Vídeo toggle global** (comportamento do runner)
    
3.  **Modal “Novo Vídeo”** com 5 caminhos
    
4.  **Página/Drawer de Detalhes do Job** com tabs:
    
    *   Informações
        
    *   Outline
        
    *   Imagens
        
    *   Roteiro
        
    *   Áudios
        
    *   Logs
        
5.  **Mídia e Visual** (Manual / Automático + gerar com IA única/em lote)
    
6.  **Acabamento**: música de fundo, legendas automáticas, zoom
    

### Não inclui (por enquanto)

*   “Modelar Vídeo” (clonar estilo via URL) implementado completo (fica stub)
    
*   “Thumbs” e “Feedback” (apenas navegação/placeholder)
    
*   marketplace de “chunks” avançado (apenas botão/rota)
    

2.3 Usuários e Jobs-to-be-Done
------------------------------

*   Operador quer: criar vídeo em < 2 minutos, rodar pipeline sem abrir mil telas, baixar MP4 final.
    
*   Creator quer: controlar voz, quantidade de imagens, loop vs proporcional, e acabamento.
    

2.4 Fluxos principais
---------------------

### Fluxo A — Criar vídeo sem modelo (o “padrão DarkFlow”)

1.  Home → **Novo Vídeo** → “Criar Vídeo Sem Modelo”
    
2.  Preenche: título, idioma, duração, tipo
    
3.  Escolhe voz
    
4.  Mídia e Visual:
    
    *   Automático: n imagens (<=10) + loop on/off
        
    *   (ou) Manual: upload
        
    *   (ou) Gerar com IA: única / lote
        
5.  Acabamento: música mp3, legenda, zoom
    
6.  Salvar/Concluir
    
7.  **Arrastar card** para “Gerar Roteiro”
    
8.  Runner executa:
    
    *   roteiro → narração → (auto vídeo?) render
        
9.  Concluído → Download
    

### Fluxo B — Auto Vídeo OFF

Igual ao A, mas:

*   após narração, card para em “Gerar Vídeo”
    
*   usuário precisa clicar “Gerar Vídeo” no card.
    

2.5 Requisitos de UI (fidelidade aos prints)
--------------------------------------------

Home / Board
------------

*   Top nav: Início / Meus Vídeos / Tutoriais / Thumbs / Feedback
    
*   Controls bar:
    
    *   Usuários (botão)
        
    *   Chunks (botão)
        
    *   dropdown “Meus Cards (Padrão)”
        
    *   botão “Meus Prompts”
        
    *   toggle “Auto Vídeo”
        
    *   CTA “+ Novo Vídeo”
        
*   Colunas com contador
    
*   Cards com:
    
    *   título truncado
        
    *   pills: idioma, voz, tipo
        
    *   menu (⋮)
        
    *   estado (progress bar quando em execução)
        
    *   em concluído: botão Download
        

Modal “Novo Vídeo”
------------------

*   5 opções exatamente (com textos equivalentes):
    
    1.  Modelar Vídeo (URL)
        
    2.  Usar Modelo Salvo
        
    3.  Criar Vídeo Sem Modelo
        
    4.  Roteiro Personalizado
        
    5.  Gerar Apenas Vídeo
        

Detalhes do Job
---------------

*   Header com:
    
    *   “Detalhes do Vídeo”
        
    *   Job ID curto + copy
        
    *   botão “Modelos”
        
    *   status “Concluído” (ou outros)
        
*   Tabs:
    
    *   Informações | Outline | Imagens (#) | Roteiro | Áudios (#) | Logs
        

### Tab: Informações

**Detalhes do Conteúdo**

*   Título
    
*   Idioma
    
*   Duração (presets: Curto ~12min + outros)
    
*   Tipo de História
    

**Produção e Voz**

*   Provider (no seu caso: Azure TTS, mas UI idêntica)
    
*   Lista de vozes (presets\_voice):
    
    *   play preview
        
    *   favorite
        
    *   selecionável
        

### Bloco: Mídia e Visual

**Narrativa Visual**

*   Manual
    
    *   Upload (contador “0/40”)
        
    *   Gerar com IA:
        
        *   tamanho/qualidade (ex: 1K)
            
        *   modo: Única / Em lote
            
        *   textarea prompt
            
        *   botão “Gerar Imagem com IA”
            
*   Automático
    
    *   input “Quantas imagens gerar (máx. 10)”
        
    *   toggle “Repetir imagens (Loop)”
        
    *   comportamento:
        
        *   loop ON: repete última até fim
            
        *   loop OFF: distribui proporcionalmente na duração
            

### Acabamento

*   Música de fundo: upload mp3 (mostrar limite)
    
*   Toggle Legendas automáticas
    
*   Toggle Efeito de zoom (zoom suave)
    

2.6 Requisitos de Engine (mapeamento no seu runner)
---------------------------------------------------

*   Board status = mapeamento para `jobs.status` e/ou agregação de `job_steps`
    
*   Arrastar card:
    
    *   muda status
        
    *   dispara execução do step correspondente
        
*   Auto Vídeo:
    
    *   se ON: runner segue até render automaticamente
        
    *   se OFF: runner para antes do render (aguarda ação manual “Gerar Vídeo”)
        

2.7 Modelo de dados (mínimo necessário)
---------------------------------------

Adicionar/confirmar campos no `jobs` (ou `job_config`):

*   `title`
    
*   `language`
    
*   `duration_preset` (ex: curto ~12)
    
*   `story_type` (historia\_geral etc)
    
*   `voice_preset_id`
    
*   `visual_mode` = manual\_upload | manual\_ai | automatic
    
*   `images_count_requested` (<=10 quando automático)
    
*   `images_loop` (bool)
    
*   `images_quality_preset` (ex: 1k)
    
*   `bg_music_artifact_id` (mp3)
    
*   `captions_enabled` (bool)
    
*   `zoom_effect_enabled` (bool)
    
*   `auto_video_enabled` (bool global setting + snapshot por job opcional)
    

E em `artifacts`:

*   imagens por índice (#1..#N), com flag de origem (auto / manual / ai)
    
*   áudio narração
    
*   música
    
*   vídeo final
    

2.8 Critérios de aceite (checklist)
-----------------------------------

*    Board com colunas e contadores
    
*    Cards com pills idioma/voz/tipo e menu ⋮
    
*    Drag card para “Gerar Roteiro” inicia pipeline
    
    \[Portuguese (auto-generated)\] C…
    
*    Auto Vídeo ON roda até Concluído sem intervenção
    
    \[Portuguese (auto-generated)\] C…
    
*    Auto Vídeo OFF para em “Gerar Vídeo” e exige clique
    
    \[Portuguese (auto-generated)\] C…
    
*    Visual automático: número de imagens + loop ON/OFF com comportamento proporcional
    
    \[Portuguese (auto-generated)\] C…
    
*    Manual AI: Única vs Em lote (linha em branco separa prompts)
    
    \[Portuguese (auto-generated)\] C…
    
*    Música mp3 + legenda + zoom toggles
    
    \[Portuguese (auto-generated)\] C…
    
*    Em concluído: Download disponível
    

* * *

3) PROMPT MESTRE para colar no Antigravity/IDE (implementação)
==============================================================

**Objetivo do prompt:** implementar no seu **Video Factory OS** uma camada UX “DarkFlow style” (Board + Detalhes) com fidelidade funcional.

* * *

Prompt
------

Você é um engenheiro full-stack trabalhando no monorepo **Video Factory OS** (Next.js 14 App Router + Tailwind + shadcn/ui, SQLite + Drizzle, engine runner com executors e artifacts).  
Implemente uma camada de produto inspirada no **DarkFlow** com foco em **Kanban operável + Detalhes do Job**, preservando os princípios:

*   **Config-First**: nada hardcoded (prompts/vozes/presets no DB)
    
*   **Manifest-First**: `manifest.json` é fonte da verdade do job
    
*   **Checkpoint idempotente**: steps retomáveis sem refazer anteriores
    
*   Render local com FFmpeg permanece como está
    

1) Criar “Jobs Board” (Kanban)
------------------------------

Crie uma rota/página “Início” (ou /jobs-board) com:

### 1.1 Topbar (layout)

*   Tabs: Início / Meus Vídeos / Tutoriais / Thumbs / Feedback
    
*   Controls: botões “Usuários”, “Chunks”, dropdown “Meus Cards (Padrão)”, botão “Meus Prompts”
    
*   Toggle global “Auto Vídeo”
    
*   CTA vermelho “+ Novo Vídeo”
    

### 1.2 Colunas e status

Renderize colunas (com contador):

*   Vídeos a Fazer
    
*   Gerar Roteiro
    
*   Gerar Narração
    
*   Gerar Vídeo
    
*   Concluído
    

Cada coluna lista cards (jobs). Card deve exibir:

*   título (truncado)
    
*   pills: idioma, voz, tipo
    
*   menu ⋮
    
*   status/progresso quando rodando
    
*   em Concluído: botão Download
    

### 1.3 Drag & Drop

Implemente drag & drop de cards entre colunas.  
Regras:

*   Arrastar para “Gerar Roteiro” dispara execução do pipeline (step roteiro) e atualiza UI conforme status.
    
*   Quando concluir um step, mova automaticamente o card para a próxima coluna (roteiro→narração→gerar vídeo).
    
*   Se Auto Vídeo estiver ON, ao chegar em “Gerar Vídeo” dispare render automaticamente e mova para “Concluído”.
    
*   Se Auto Vídeo estiver OFF, o card para em “Gerar Vídeo” e exibe botão “Gerar Vídeo” para execução manual.
    

2) Modal “Novo Vídeo”
---------------------

Ao clicar “+ Novo Vídeo”, abrir modal com 5 opções:

1.  Modelar Vídeo (URL)
    
2.  Usar Modelo Salvo
    
3.  Criar Vídeo Sem Modelo
    
4.  Roteiro Personalizado
    
5.  Gerar Apenas Vídeo
    

Neste ciclo, implemente completo apenas “Criar Vídeo Sem Modelo”; as demais podem criar job em estado “draft” com UI stub.

3) Detalhes do Job (DarkFlow-style)
-----------------------------------

Ao clicar no card, abrir página/drawer “Detalhes do Vídeo” com:

*   header: “Detalhes do Vídeo”, id curto com copy, botão “Modelos”, badge de status
    
*   tabs: Informações | Outline | Imagens (contador) | Roteiro | Áudios (contador) | Logs
    

### 3.1 Tab Informações

*   Detalhes do Conteúdo:
    
    *   Título
        
    *   Idioma
        
    *   Duração (preset ex: Curto ~12min)
        
    *   Tipo de História
        
*   Produção e Voz:
    
    *   provider (Azure TTS)
        
    *   lista de vozes (presets\_voice) com play preview e favorito
        
*   Seção colapsável “Configurações Avançadas”
    

### 3.2 Mídia e Visual (Narrativa Visual)

Implementar os 3 modos:

**Manual**

*   Upload: contador “0/40” + botão “Escolher Imagens”
    
*   Gerar com IA:
    
    *   qualidade/tamanho (ex: 1K padrão)
        
    *   modo “Única” (uma por vez) e “Em lote” (prompts separados por linha em branco)
        
    *   textarea + botão “Gerar Imagem com IA”
        
    *   salvar imagens como artifacts numerados (#1..#N)
        

**Automático**

*   input “Quantas imagens gerar (máx. 10)”
    
*   toggle “Repetir imagens (Loop)”
    
*   se loop OFF: distribuir imagens proporcionalmente no timeline pela duração do vídeo
    
*   se loop ON: repetir última imagem até fim
    

### 3.3 Acabamento

*   Música de Fundo: upload mp3 (artefato)
    
*   Toggle: Legendas Automáticas
    
*   Toggle: Efeito de Zoom (zoom suave)
    

4) Dados e persistência
-----------------------

*   Adicionar campos necessários no schema (jobs/job\_config) para suportar:
    
    *   language, duration\_preset, story\_type, voice\_preset\_id
        
    *   visual\_mode, images\_count\_requested (<=10), images\_loop, images\_quality
        
    *   bg\_music\_artifact\_id, captions\_enabled, zoom\_effect\_enabled
        
    *   auto\_video\_enabled (global setting + opcional snapshot por job)
        
*   Atualizar manifest.json para refletir essas escolhas
    

5) API e engine
---------------

*   Criar endpoints server actions/API para:
    
    *   criar job (sem modelo)
        
    *   atualizar job config
        
    *   iniciar step (roteiro/narração/render)
        
    *   obter artifacts e status
        
*   Integrar com runner existente:
    
    *   execução por step
        
    *   respeitar checkpoints
        
    *   respeitar Auto Vídeo (stop before render quando OFF)
        

6) UX de feedback
-----------------

*   Toasters para: “Roteiro gerado”, “Transição para narração…”, “Enviando para geração”, “Renderizando…”, “Vídeo gerado!”
    
*   Logs tab mostra logs por step
    

7) Entregáveis
--------------

*   Implementação funcional end-to-end do fluxo:  
    Criar Vídeo Sem Modelo → configurar → arrastar para Gerar Roteiro → pipeline → Concluído → Download
    
*   Código seguindo padrões do projeto e shadcn/ui, sem hardcode de presets/prompts.
    

* * *

Se você quiser, no próximo passo eu posso transformar isso em um **PRD no formato exato do seu repositório** (com numeração/ADR/date-id e seção “governança”), já pronto pra você colar em `docs/04-produto/prd.md` e/ou virar ADRs.

---

