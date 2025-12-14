# 🤖 Manual de Modelos de IA

**Status:** Regra Operacional Ativa
**Origem:** Gate 0.75

## 🧠 Modelos Aprovados (Premium Only)

### 1. Claude 3.5 Sonnet / Opus (Implementação)
- **Uso:** Implementação de código, arquitetura, refatoração e documentação complexa.
- **Por quê:** Melhor raciocínio lógico e adesão a instruções complexas.

### 2. Gemini 1.5 Pro (Refinamento UI/UX)
- **Uso:** Refinamento visual, sugestões de design patterns, microcopy e densidade de informação.
- **Fluxo:** Trocar manualmente para Gemini Pro ao fazer ajustes finos de CSS/Tailwind, depois voltar para Claude.

## 🚫 Proibidos
- **GPT-4o / GPT-OSS:** Não usar para código crítico de produção neste projeto.
- **Modelos "Low" / "Flash":** Risco de alucinação em regras de negócio.

## 📝 Regras de Prompting
1. **Idioma:** Sempre **Português (Brasil)**.
2. **Contexto:** Sempre ler `docs/00-regras/workflow-inicio.md` antes de começar.
3. **Dados:** Nunca hardcodar valores; usar placebo ou buscar do DB.
