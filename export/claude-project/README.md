# 📘 Video Factory OS - Claude Project Export

## Como Usar

1. Crie um novo projeto no [Claude Projects](https://claude.ai/projects)
2. Adicione o arquivo do canal desejado como knowledge:
   - `GRACIELA-COMPLETO.md` para "Verdades de Graciela" (ES-MX)
   - `VJ-COMPLETO.md` para "Virando o Jogo" (PT-BR)
3. Use o `PIPELINE.md` como referência para o fluxo de geração

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `GRACIELA-COMPLETO.md` | DNA + KBs + Prompts do canal Graciela |
| `VJ-COMPLETO.md` | DNA + KBs + Prompts do canal VJ |
| `PIPELINE.md` | Fluxo de geração de vídeo |

## Pipeline de Geração

Para gerar um vídeo completo, siga estas etapas:

1. **Tema Central:** Dê uma ideia inicial (bagunçada mesmo)
2. **Ideação:** Use o prompt de ideação para refinar
3. **Título:** Gere opções de títulos virais
4. **Planejamento:** Estruture a história com revelações progressivas
5. **Roteiro:** Gere o roteiro completo em Stage Directions

## Formato de Output Esperado

### Stage Directions (Roteiro)

O roteiro deve seguir estas regras:
- NÃO usar SSML nem Markdown
- Começar com `(voz: NARRADORA)`
- Usar marcadores de voz: NARRADORA / ANTAGONISTA / OTRO
- Usar pausas: [PAUSA CORTA], [PAUSA], [PAUSA LARGA]
- Mínimo 6000 palavras

---

Exportado em: 2025-12-19
