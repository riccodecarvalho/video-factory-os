# 🚀 GUIA DE USO RÁPIDO – SISTEMA V5

**Propósito:** mostrar, em poucos minutos, **como operar** o sistema de roteiros V5 com IAs (Claude, ChatGPT, Gemini etc.), usando a documentação consolidada.

**Documentos principais usados aqui:**  
- `INSTRUCOES_USO_INSTRUCOES.txt`  
- `INSTRUCOES_USO_MEMORIA.txt`  
- `MEMORIA_PURPOSE_CONTEXT.txt` / `MEMORIA_CURRENT_STATE.txt`  
- `GUIA_PRATICO_IMPLEMENTACAO.md`  
- `resultado/CUSTOM_INSTRUCTIONS.md`  

> **[FONTE: `fonte/processados/INSTRUCOES_USO_INSTRUCOES.txt`, `INSTRUCOES_USO_MEMORIA.txt`, `MEMORIA_*`, `GUIA_PRATICO_IMPLEMENTACAO.md`, `resultado/CUSTOM_INSTRUCTIONS.md`]**

---

## 1️⃣ Setup (uma vez por ferramenta)

Esta seção é **só um lembrete** de onde estão os textos certos para configurar memória e instruções, caso a ferramenta suporte isso (ex.: Claude Projects). O conteúdo real continua nos arquivos de origem.

- **Memória do projeto (Purpose & Context / Current State)**  
  - Textos canônicos estão em:  
    - `fonte/processados/MEMORIA_PURPOSE_CONTEXT.txt`  
    - `fonte/processados/MEMORIA_CURRENT_STATE.txt`  
  - O passo a passo de como colar isso na interface da ferramenta está em:  
    - `fonte/processados/INSTRUCOES_USO_MEMORIA.txt`.

- **Instruções do agente / System Prompt**  
  - Texto canônico atual está em: `resultado/CUSTOM_INSTRUCTIONS.md`.  
  - O passo a passo de como configurar isso na ferramenta está em:  
    - `fonte/processados/INSTRUCOES_USO_INSTRUCOES.txt`.

> O próprio `GUIA_USO_RAPIDO.md` **não** é conteúdo de memória nem de system prompt; ele só aponta **de onde copiar** quando você quiser configurar a ferramenta.

---

## 2️⃣ Fluxo rápido para criar um roteiro novo

### Passo 1 – Definir objetivo e arquétipo

1. Ler rapidamente `DNA_CANAL.md` → metas e tipo de história que funciona.  
2. Escolher o **objetivo principal do vídeo**:
   - Foco em CTR → **VIRAL**.  
   - Equilíbrio CTR/Retenção → **ENGAGEMENT**.  
   - Foco em retenção máxima → **RETENTION MAX**.  
3. Confirmar o arquétipo com a IA (ela também tem isso em `SISTEMA_GERACAO_PARTE2.md`).

> Arquétipos detalhados: `SISTEMA_GERACAO_PARTE2.md` (briefing mínimo + templates por arquétipo).

---

### Passo 2 – Passar o briefing mínimo

Usar o “briefing mínimo por arquétipo” do `SISTEMA_GERACAO_PARTE2.md`:

- **VIRAL:** protagonista humilde, vilão rico bem descrito, humilhação visual fotografável, transformação antes/depois clara, local/época.  
- **ENGAGEMENT:** vulnerabilidades do protagonista, segredo/competência oculta, cronômetro explícito, stakes, 6 subtramas.  
- **RETENTION MAX:** 9 camadas de mistério, 7+ personagens, linhas de tempo, mapa de revelações.

Você pode simplesmente colar um prompt do tipo:

> "Use o arquétipo VIRAL. Aqui está o briefing preenchido conforme `SISTEMA_GERACAO_PARTE2.md`: ..."

---

### Passo 3 – Pedir o planejamento + estrutura

Antes do roteiro completo, peça para IA montar o **planejamento/estrutura** usando `SISTEMA_GERACAO_PARTE1.md` + `PARTE2.md`:

- Estrutura de 7 atos com minutos e palavras estimadas.  
- Lista de mini‑clímaxes planejados (Dur÷9).  
- Subtramas previstas.  
- Onde entra o momento visual, cronômetro, revelações, etc.

Exemplo de comando:

```markdown
Monte primeiro o PLANEJAMENTO ESTRATÉGICO e a ESTRUTURA DE ATOS
usando `SISTEMA_GERACAO_PARTE1.md` + `SISTEMA_GERACAO_PARTE2.md`
para o arquétipo [VIRAL/ENGAGEMENT/RETENTION_MAX].
Não escreva o roteiro ainda.
```

---

### Passo 4 – Gerar o roteiro completo

Após aprovar a estrutura, peça o roteiro:

- Em prosa narrada, 3ª pessoa, passado.  
- Números por extenso, títulos completos (Doutor, Senhor, etc.).  
- 7 atos com marcações `[]` apenas para metas técnicas.

Exemplo de comando:

```markdown
Agora gere o ROTEIRO COMPLETO seguindo exatamente a estrutura aprovada
+ as regras de `SISTEMA_GERACAO_PARTE1.md`.
Mantenha 127-130 palavras/minuto, 40-45% de diálogo reportado
(e NÃO em formato teatral), e aplique todos os elementos
obrigatórios de `DNA_CANAL.md`.
```

### Passo 4.1 – Modo incremental ato a ato (opcional)

> **[FONTE: `PROMPT_PADRAO_V4.0_FINAL_OTIMIZADO.md` + `PROMPT_ROTEIRO_V4_FINAL_DEFINITIVO.md`]**

Se você quiser ter mais controle sobre a estrutura, pode pedir para a IA trabalhar **ato por ato**, pausando entre eles:

- **Primeiro:** aprove o planejamento/estrutura (Passo 3).  
- **Depois:** peça para escrever **apenas o Ato 1**, e **parar**.  
- Em seguida, use `continue` para liberar o Ato 2, e assim por diante até o Ato 7.  

Exemplo de comando:

```markdown
Agora escreva APENAS o Ato 1 seguindo a estrutura aprovada
e as regras de `SISTEMA_GERACAO_PARTE1.md` + `SISTEMA_GERACAO_PARTE2.md`.
Quando terminar o Ato 1, pare e aguarde eu escrever "continue"
para avançar para o próximo ato.
```

---

### Passo 5 – Validar antes de aceitar

Sempre exigir que a IA aplique o `VALIDADOR.md`:

```markdown
Antes de me entregar a versão final, aplique o checklist universal
+ o checklist do arquétipo em `VALIDADOR.md` e me mostre
um RELATÓRIO DE VALIDAÇÃO com:
- [X/9] itens universais
- [X/X] itens do arquétipo
- Lista clara do que passou/falhou
- Status final: APPROVED ou REQUIRES REVISION
```

Se o status vier como `REQUIRES REVISION`, peça **apenas os ajustes necessários** (diálogo, tempo, prenúncios, etc.) e exija **nova validação**.

---

## 3️⃣ Como lidar com revisões e pedidos ambíguos

Essas regras vêm principalmente de `VALIDADOR.md` + documentos de memória.

### 3.1. Quando o pedido do usuário (você) é ambíguo

Oriente a IA (e você mesmo) a:

- Perguntar **sempre** qual arquétipo é desejado.  
- Perguntar objetivo (crescimento rápido x engajamento x retenção).  
- Listar quais elementos obrigatórios ainda estão faltando no briefing.  
- Explicar trade-offs quando o usuário pede algo “contra o arquétipo”  
  (ex.: **VIRAL sem momento visual**).

### 3.2. Quando pedir revisão de um roteiro já pronto

Ao revisar um roteiro:

1. Apontar quais **métricas/elementos** precisa ajustar (ex.: diálogo >50%, visual tardio, etc.).  
2. Pedir para IA **reaplicar o VALIDADOR** após as mudanças.  
3. Exigir novo relatório com status e itens que foram corrigidos.

Exemplo de comando:

```markdown
Reescreva apenas o que for necessário para:
- Trazer o momento visual para antes do minuto 20
- Ajustar a proporção de diálogo para 40-45%
- Manter o restante da estrutura igual

Depois disso, aplique novamente o `VALIDADOR.md` e me traga
um novo RELATÓRIO DE VALIDAÇÃO.
```

---

## 4️⃣ Navegação rápida pelos documentos

- **`DNA_CANAL.md`**  
  - Quem é o público.  
  - O que funciona/fracassa.  
  - Metas de CTR/Retenção e benchmarks reais.  

- **`SISTEMA_GERACAO_PARTE1.md`**  
  - Estrutura 7 atos, elementos obrigatórios, anti‑padrões.  
  - Workflow de criação em 8 etapas.  
  - Regras de tom/estilo e formato de escrita.

- **`SISTEMA_GERACAO_PARTE2.md`**  
  - Arquétipos (VIRAL / ENGAGEMENT / RETENTION MAX).  
  - Briefing mínimo por arquétipo.  
  - Templates e parâmetros técnicos.

- **`VALIDADOR.md`**  
  - Checklist universal + por arquétipo.  
  - Como gerar relatório de validação.  
  - O que fazer em caso de revisão/ambiguidade.

- **`CUSTOM_INSTRUCTIONS.md`**  
  - Identidade e missão da IA.  
  - Ordem de consulta dos docs.  
  - Regras DRY para treinar agentes.

- **`GUIA_USO_RAPIDO.md` (este arquivo)**  
  - Atalho operacional para você, humano.  
  - Como conectar memória + instruções + docs finais + prompts.

---

## 5️⃣ Depois de configurar tudo

Com memória + instruções + docs finais prontos, o fluxo padrão passa a ser:

1. Abrir novo chat com a IA configurada.  
2. Informar **tema + objetivo + arquétipo**.  
3. Passar briefing usando o modelo de `SISTEMA_GERACAO_PARTE2.md`.  
4. Exigir planejamento → roteiro → validação, nessa ordem.  
5. Usar este `GUIA_USO_RAPIDO.md` apenas como lembrete operacional.

> A documentação detalhada permanecerá sempre em `docs/emergency/` e na pasta `resultado/`.  
> Este guia é só o “painel de controle” para o dia a dia.
