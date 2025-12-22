# 03-GOLDEN-PATHS (Fluxos Críticos)

Estes são os caminhos que **DEVEM** funcionar para que o sistema seja considerado saudável.

## GP-1: Criação e Execução de Job Completo (Happy Path)
**Objetivo:** Gerar um vídeo do zero a partir de uma ideia.
1. **Input:** Ideia simples ("Benefícios da meditação").
2. **Steps:** `ideacao` → ... → `renderizacao`.
3. **Validação:**
   - Job criado no DB (`jobs` table).
   - Todos steps com status `success`.
   - Artifact `video.mp4` gerado no step `renderizacao`.
   - Artifact `output.txt` (roteiro) gerado no step `roteiro`.

## GP-2: Idempotência e Retomada (Resumability)
**Objetivo:** Não refazer trabalho caro (TTS/Render) se reexecutar com mesmo input.
1. **Condição:** Job GP-1 concluído.
2. **Ação:** Re-submeter o mesmo job (ou clicar "Retry" no último passo).
3. **Validação:**
   - Steps anteriores devem ter status `skipped` ou `success` imediato (sem gastar tokens/GPU).
   - `input_hash` deve ser idêntico.

## GP-3: Validação de Governança (Prompt Missing)
**Objetivo:** Garantir que o sistema falha com segurança se faltar configuração.
1. **Ação:** Criar job apontando para uma `recipe` cujos bindings de prompt foram deletados.
2. **Validação:**
   - Job falha instantaneamente no step afetado.
   - Status `failed`.
   - Error code `PROMPT_NOT_FOUND` ou `NO_PROMPT`.
   - Não deve travar o processo (timeout) nem alucinar prompt default.

## GP-4: Script Normalization (Regra de Negócio)
**Objetivo:** Garantir que roteiros gerados passem pelo normalizador.
1. **Input:** Mock de roteiro com múltiplas vozes/formatos errados.
2. **Ação:** Executar passo `parse_ssml` (Transform).
3. **Validação:**
   - Output deve conter apenas texto limpo/single voice (se for a regra ativa).
   - Artifact gerado deve ser compatível com TTS.

## GP-5: Admin Configuration
**Objetivo:** Alterar um preset reflete na execução.
1. **Ação:** Mudar voiceId no `presets_voice` via código/Admin.
2. **Execução:** Rodar passo `tts`.
3. **Validação:**
   - Log mostra uso do novo voice name.
   - Hash do step muda (reexecuta).
