# ✅ VALIDADOR DE ROTEIROS – SISTEMA V5

**Versão:** 0.1 (rascunho consolidado)

**Última atualização:** 21 de novembro de 2025  
**Status:** 🔨 EM CONSTRUÇÃO

---

## 🎯 PROPÓSITO

Este documento define **como validar** qualquer roteiro gerado pelo sistema.

- Garantir que **todos os requisitos técnicos e narrativos mínimos** foram cumpridos.
- Padronizar o **relatório de validação** que a IA deve devolver.
- Evitar que roteiros **fora do padrão validado** sejam entregues ao usuário.

**[FONTE PRINCIPAL: `fonte/pendentes/INSTRUCOES_SISTEMA.txt`]**

---

## 📚 FONTES DE VALIDAÇÃO

A validação deve sempre considerar, nesta ordem:

1. `DNA_CANAL.md` → métricas reais do canal e metas de performance.  
2. `SISTEMA_GERACAO_PARTE1.md` → regras de estrutura, elementos obrigatórios, anti‑padrões.  
3. `SISTEMA_GERACAO_PARTE2.md` → templates específicos por arquétipo (VIRAL / ENGAGEMENT / RETENTION MAX).  
4. `VALIDADOR.md` (este arquivo) → checklists e formato de relatório.  
5. Roteiros de referência em `referencias/`.  

> Os arquivos `04_CHECKLISTS_VALIDACAO*.md` foram totalmente consolidados neste `VALIDADOR.md` e agora funcionam apenas como **origem histórica** (para auditoria humana), não como fonte operacional para a IA.

**[FONTE: INSTRUCOES_SISTEMA.txt → "FILE REFERENCE HIERARCHY" + 04_CHECKLISTS_VALIDACAO*.md]**

---

## 🔁 FLUXO RÁPIDO DE VALIDAÇÃO

1. **Coletar métricas do roteiro gerado**  
   - Duração estimada (minutos).  
   - Contagem total de palavras.  
   - Palavras/minuto (WPM).  
   - Estimativa de % de diálogo.  
   - Quantidade de mini‑clímaxes e prenúncios.

2. **Aplicar Checklist Universal** (seção abaixo).  
3. **Aplicar Checklist por Arquétipo** (VIRAL / ENGAGEMENT / RETENTION MAX).  
4. **Checar Anti‑Padrões** (estrutura, personagens, diálogo, narração).  
5. **Gerar Relatório de Validação** no formato padrão (seção "Formato de Entrega").  
6. **Decidir:** `APPROVED` ou `REQUIRES REVISION`.

Se **qualquer requisito crítico falhar**, o roteiro **não deve ser entregue** antes de correção.

**[FONTE: INSTRUCOES_SISTEMA.txt → "STEP 5: VALIDATE BEFORE DELIVERY"]**

---

## ✅ CHECKLIST UNIVERSAL (TODOS OS ROTEIROS)

Use esta lista para qualquer arquétipo.

- [ ] **Atos:** entre **cinco e nove atos**, preferencialmente **sete**, claramente identificados e rotulados.  
- [ ] **Mini‑clímaxes**: quantidade ≈ `duração (min) ÷ 9` (desvio de no máximo ±1), garantindo **pelo menos quatro mini‑clímaxes bem distribuídos**.  
- [ ] **Contagem de palavras:** coerente com a duração planejada (40–108 minutos).  
- [ ] **Palavras por minuto (WPM):** entre **cento e vinte e cinco** e **cento e cinquenta** (calcular `palavras ÷ duração`).  
- [ ] **Porcentagem de diálogo:** entre **trinta e cinco e cinquenta por cento**, em formato **reportado** (não teatral).  
- [ ] **Divisão ação/redempção:** aproximadamente **oitenta e cinco por cento ação/mistério** e **quinze por cento redenção/legado**.  
- [ ] **Foreshadowing:** entre **oito e dez prenúncios** relevantes da revelação principal.  
- [ ] **Vilão:** é **rico/poderoso** (posição de autoridade, dinheiro ou status).  
- [ ] **Protagonista:** recebe **setenta a noventa por cento** das palavras totais do roteiro.

> Estes parâmetros vêm de `INSTRUCOES_SISTEMA.txt` e serão ajustados/correlacionados com os dados reais consolidados em `DNA_CANAL.md` e `SISTEMA_GERACAO_PARTE1.md` em fase posterior.

**[FONTE: INSTRUCOES_SISTEMA.txt → "Universal checklist (all scripts)"]**

---

## 📋 CHECKLIST POR ARQUÉTIPO

Cada arquétipo possui verificações adicionais ao checklist universal.  
Os itens abaixo resumem o que **deve ser checado** para cada modelo.

### 🔹 Arquétipo VIRAL – Foco em CTR

**Objetivo principal:** Maximizar CTR (cliques) aceitando retenção média.

**Verificar, além do checklist universal:**

- [ ] **Estrutura Futuro→Passado** aplicada corretamente:  
      - Abertura (0–3 min) com protagonista já em poder + objeto do passado visível.  
      - Corpo em passado (≈3–70 min).  
      - Retorno ao presente/legado no final.
- [ ] **Momento visual de humilhação** físico, fotografável, entre **min 15–20**, com:  
      - Ação física (líquido, empurrão, objeto, rasgo).  
      - Contraste forte de cores (ex.: vermelho no azul).  
      - Ambiente público com testemunhas.
- [ ] **Transformação visual dramática** claramente descritível em 2 frames (ANTES/DEPOIS).  
- [ ] **Vilão nomeado** (nome completo, idade, descrição física + poder) **antes do min 5**.  
- [ ] **Setup total (Atos 1–3)** em **15–18 minutos**, levando até o momento visual.  
- [ ] **Número de subtramas** em torno de **5** (não 7+).  
- [ ] **Sem cronômetro explícito** no hook (apenas promessa forte).  
- [ ] **Sem estrutura Boneca Russa 9 camadas** (história deve ser majoritariamente linear).

> Se 2+ destes itens falharem, dificilmente é um roteiro VIRAL – considerar outro arquétipo.

### 🔹 Arquétipo ENGAGEMENT – Equilíbrio CTR/Retenção

**Objetivo principal:** Equilibrar CTR e retenção, com foco maior em **retenção alta**.

**Verificar, além do checklist universal:**

- [ ] **Timer específico no hook** (ex.: "em cinquenta e dois minutos...") com:  
      - Tempo exato declarado nos primeiros ~60s.  
      - 2–3 promessas concretas associadas.  
      - Cumprimento do evento **no minuto prometido**.  
- [ ] **Setup longo de 20–22 minutos** antes do grande desafio/revelação.  
- [ ] Presença de **segredo/competência oculta** do protagonista, revelada gradualmente.  
- [ ] **8+ foreshadowings** claros desse segredo distribuídos ao longo da história.  
- [ ] **Densidade de mini‑clímaxes** maior que VIRAL (≈ `duração ÷ 8`, não ÷9).  
- [ ] **6–7 subtramas** relevantes ligadas ao arco emocional.  
- [ ] **Arco de redenção** coerente do antagonista (quando existir), sem mudança mágica instantânea.  
- [ ] Legado/epílogo mais longo (≈18–20% da duração).

> Se o roteiro não explora vulnerabilidades, segredo e arco de redenção, provavelmente não é ENGAGEMENT.

### 🔹 Arquétipo RETENTION MAX – Foco em Retenção

**Objetivo principal:** Maximizar retenção, aceitando CTR bem mais baixo.

**Verificar, além do checklist universal:**

- [ ] Existência de **Matryoshka pura com 9 camadas**: cada resposta gera nova pergunta **maior**.  
- [ ] **Mapa das 9 camadas** claro (perguntas, respostas, novas perguntas).  
- [ ] **Setup de 20–25 minutos** apresentando elenco amplo (6–7+ personagens) e múltiplas linhas do tempo.  
- [ ] **7 subtramas** interligadas, sem ficar confuso.  
- [ ] Mini‑clímaxes muito densos (≈ `duração ÷ 7`).  
- [ ] Uso de **cronômetro no hook** é permitido, inclusive com cumprimento mais ambíguo/metafórico.  
- [ ] Transformação final pode ser **conceitual**, mas deve ser clara (valores, propósito, relações).  
- [ ] Vilão verdadeiro pode ser revelado tardiamente (meio/final), se isso fizer parte do mistério.

> Se a história não tem muitas camadas de mistério e subtramas, provavelmente não é um bom caso de RETENTION MAX.

**[FONTE: INSTRUCOES_SISTEMA.txt → "Archetypes" + "Archetype-specific checklist"  
+ `fonte/pendentes/02_ARQUÉTIPOS_3_MODELOS.md` / `02_ARQUETIPOS_3_MODELOS.md`]**

---

## 🚫 VERIFICAÇÃO DE ELEMENTOS PROIBIDOS

Além dos checklists positivos, **sempre verifique elementos proibidos**.

1. **Abrir:** `resultado/SISTEMA_GERACAO_PARTE1.md` → seção **"🚫 ANTI-PADRÕES (0% dos Roteiros Campeões)"**.  
2. Confirmar que o roteiro **NÃO** contém nenhum dos anti‑padrões listados, em especial:
   - Duração muito curta ou muito longa em relação ao range validado.  
   - Protagonista passivo.  
   - Transformação apenas verbal, sem mudança visual clara.  
   - Diálogo em excesso ou em falta fora do range aceitável.  
   - Revelações sem prenúncio ("deus ex machina").
3. **Ainda em `SISTEMA_GERACAO_PARTE1.md`, consultar a seção "Padrões do roteiro campeão vs. roteiros fracos (Virando o Jogo)"** e usar a lista **"🚫 Top 7 erros que você deve evitar"** como checklist complementar de erros graves (abertura fraca, protagonista poderoso demais, falta de vilão forte, descrições técnicas em excesso, etc.).  
4. Se qualquer anti‑padrão crítico estiver presente, marcar como **REQUIRES REVISION**.

**[FONTE: INSTRUCOES_SISTEMA.txt → "Forbidden elements check" + SISTEMA_GERACAO_PARTE1 → Anti‑Padrões + Analise Virando o Jogo - 19_11_2025.md]**

---

## 🧾 FORMATO PADRÃO DO RELATÓRIO DE VALIDAÇÃO

Toda validação deve ser apresentada para o usuário no seguinte formato:

### 1. SCRIPT METADATA

- Arquétipo: `[VIRAL / ENGAGEMENT / RETENTION MAX]`  
- Duração alvo: `[XX]` minutos  
- Contagem de palavras: `[X.XXX]` palavras  
- Palavras por minuto: `[XXX]`  

### 2. PREDICTED PERFORMANCE

- Expected CTR: `[X,X]%` (com base no benchmark do arquétipo em `DNA_CANAL.md`).  
- Expected Retention: `[XX,X]%` (com base no benchmark do arquétipo).  
- Benchmark de referência: `[REF_VIRAL / REF_ENGAGEMENT / REF_RETENTION]`.

### 3. VALIDATION REPORT

- ✅ Universal elements: `[X/9]` confirmados.  
- ✅ Archetype elements: `[X/X]` confirmados.  
- ✅ Forbidden patterns: `[0]` detectados.  
- **Status final:** `APPROVED` / `REQUIRES REVISION`.

### 4. SCRIPT (OPCIONAL NESTE DOC)

- Texto completo com **atos claramente rotulados** conforme `SISTEMA_GERACAO_PARTE1/2`.

### 5. THUMBNAIL RECOMMENDATIONS (para VIRAL)

- Para arquétipo VIRAL, sugerir **duas a três cenas** visualmente fortes com minuto marcado (ex.: "minuto 18 – humilhação visual").

**[FONTE: INSTRUCOES_SISTEMA.txt → "DELIVERY FORMAT"]**

---

## 🔁 QUANDO O USUÁRIO PEDIR REVISÃO

Se o usuário solicitar mudanças em um roteiro já validado:

1. Identificar **quais elementos** precisam de modificação (estrutura, personagem, tempo, etc.).  
2. Verificar se as mudanças **mantêm a conformidade** com o arquétipo escolhido.  
3. Reaplicar o **Checklist Universal** e o **Checklist por Arquétipo**.  
4. Rechecar **Anti‑Padrões** após as mudanças.  
5. Recalcular métricas se a duração ou o volume de texto foram alterados.  
6. Entregar nova versão com **relatório de validação atualizado** (mesmo formato da seção anterior).

**[FONTE: INSTRUCOES_SISTEMA.txt → "WHEN USER REQUESTS REVISION"]**

---

## ❓ QUANDO O PEDIDO DO USUÁRIO FOR AMBÍGUO

Antes de gerar ou validar qualquer roteiro:

- Perguntar explicitamente **qual arquétipo** o usuário quer (VIRAL, ENGAGEMENT, RETENTION MAX).  
- Se o usuário trouxer apenas uma ideia de história, **pedir o objetivo primeiro** (crescimento rápido, equilíbrio, retenção máxima).  
- Não assumir detalhes críticos: pedir **elementos obrigatórios** por arquétipo (protagonista, vilão, humilhação visual, transformação, etc.).  
- Se o pedido do usuário **entrar em conflito** com o arquétipo (ex.: "viral sem momento visual"), explicar o trade‑off e sugerir alternativa.

**[FONTE: INSTRUCOES_SISTEMA.txt → "STEP 1" + "RESPONSE TO AMBIGUOUS REQUESTS"]**

---

## 🏛️ HIERARQUIA DE ARQUIVOS PARA VALIDAÇÃO

Quando houver conflito entre fontes ou dúvidas durante a validação, seguir esta hierarquia:

1. `SISTEMA_GERACAO_PARTE2.md` → **Templates de estrutura por arquétipo** (quando criado).  
2. `SISTEMA_GERACAO_PARTE1.md` → Regras técnicas, elementos obrigatórios, anti‑padrões.  
3. `VALIDADOR.md` → Este documento (checklists e formato de relatório).  
4. `DNA_CANAL.md` → Métricas de performance reais e metas de qualidade.  
5. Roteiros de referência (`referencias/criados/`, `referencias/benchmark/`).

> Ideia original inspirada na hierarquia de `TEMPLATES_PRONTOS.md`, `CHECKLISTS_VALIDAÇÃO.md` e `ANTI_PADRÕES_ERROS.md` descrita em `INSTRUCOES_SISTEMA.txt`, adaptada para a nova estrutura de documentos em `resultado/`.

---

## 🧮 Sistemas de pontuação legado V4.1 (uso opcional)

> **[FONTE: Framework Master V4.1.md → Partes 8.5 e 7.6]**

O `Framework Master V4.1.md` introduziu dois sistemas numéricos de avaliação (score de 0–100 pontos e checklist operacional de 56 itens). Hoje, este `VALIDADOR.md` funciona principalmente como **checklist textual**, mas é possível usar essas estruturas legado como **ferramenta complementar para revisão humana**.

### Visão geral do sistema 100 pontos (V4.1)

Categorias avaliadas:

- **Estrutura narrativa (20 pts):** duração 40–108 min, 7 atos, mini‑clímaxes via `duração ÷ 9`, clímax na faixa 65–75% da história, resolução com 10–15 min pós‑clímax.  
- **Personagens (20 pts):** protagonista humilde com competência escondida, vilão rico/poderoso com motivação clara, backstory emocional, desenvolvimento visível, decisão coerente sobre redenção do vilão.  
- **Técnicas narrativas (20 pts):** 8–10 prenúncios, descrições sensoriais, variação de ritmo (tensão/respiro), câmera lenta no clímax, diálogo balanceado.  
- **Subtramas e complexidade (15 pts):** 3–5 subtramas conectadas ao tema, todas resolvidas antes do final, uso de ciclo esperança‑traição quando aplicável, elementos específicos do arquétipo.  
- **Engajamento (10 pts):** gancho épico nos primeiros 30s, máximo 1 CTA, título em fórmula validada, satisfação narrativa das revelações.  
- **Qualidade técnica (15 pts):** contagem de palavras por ato coerente, transições suaves, consistência de tom/estilo, ausência de erros fatais, conformidade com o arquétipo escolhido.  

Interpretando o score:  
- 90–100 pts: excelente / pronto para publicação.  
- 80–89 pts: bom / pequenos ajustes.  
- 70–79 pts: aceitável / revisão recomendada.  
- 60–69 pts: fraco / revisão obrigatória.  
- <60 pts: inadequado / reescrita necessária.  

### Visão geral do checklist 56 checks (V4.1)

Resumo das famílias de checks:

- **Estrutura (10 checks):** range de duração, número de atos, mini‑clímaxes, clímax bem posicionado, subtramas, respiros de ritmo, arquétipo definido, duração compatível, uso (ou não) de ciclo esperança‑traição.  
- **Personagens (8 checks):** volume de palavras dedicado a protagonista/vilão, profissão humilde clara, competência específica, vilão rico/poderoso, decisão de redenção justificada.  
- **Elementos narrativos (8 checks):** elemento‑chave mencionado várias vezes, diálogo na faixa de % correta, uso de prenúncio, subtramas conectadas, transformação mensurável.  
- **Técnicas de escrita (6 checks):** parágrafos curtos, verbos fortes, números/datas específicas, ausência de jargão inútil, presente histórico em ações, uso de slow‑motion no clímax.  
- **Engajamento (5 checks):** hook épico, CTA final temático, título impactante usando fórmulas, thumbnail planejada.  
- **Contagem final (5 checks):** 6k–15k palavras, ~150 wpm no modelo teórico, distribuição equilibrada entre atos, conformidade geral.  
- **Anti‑padrões evitados (9 checks):** duração fora do range, vilão sem redenção em roteiros longos sem justificativa, gancho fraco, excesso de CTAs, protagonista passivo etc.  
- **Validação final (5 checks):** score mínimo de conformidade, revisão técnica, teste de engajamento, ajuste a arquétipo.  

> Recomenda‑se usar estes sistemas **apenas como apoio humano** quando quiser uma visão mais quantitativa de qualidade. Para a IA em produção, o fluxo principal continua sendo: métricas básicas + Checklist Universal + Checklist por Arquétipo + verificação de Anti‑Padrões definidos neste documento.

---

## 📌 STATUS E PRÓXIMOS PASSOS

- Este `VALIDADOR.md` foi criado consolidando **apenas** o conteúdo de `INSTRUCOES_SISTEMA.txt`.  
- Ainda falta integrar informações de outros docs fonte (ex.: `02_ARQUÉTIPOS_3_MODELOS.md`, `TEMPLATES_PRONTOS.md`, etc.).  
- Depois de consolidar todos os fontes relevantes, as **métricas numéricas** (CTR, retenção, duração, wordcount) serão revisadas e alinhadas com:
  - `DNA_CANAL.md` (dados reais do canal).  
  - `SISTEMA_GERACAO_PARTE1.md` (métricas técnicas já validadas).

> Até lá, use este documento como **padrão operacional** para validação, mas considere as métricas como **em refinamento**.
