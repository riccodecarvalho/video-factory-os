# 🔧 Troubleshooting & Setup

**Status:** Vivo (atualizar sempre que encontrar problemas)

## 🌐 Serviços & Portas

| Serviço | Porta Padrão | Alternativa |
|---------|--------------|-------------|
| **Next.js App** | `3000` | `3001` (se 3000 em uso) |
| **Studio DB** | (externo) | - |

> **Nota:** Se `http://localhost:3000` der erro, tente `http://localhost:3001`. O console do `npm run dev` avisa qual porta foi usada.

## 🔑 Chaves de API (Secrets)

As chaves **NÃO** ficam no repositório.

### 1. Azure Speech Key (`AZURE_SPEECH_KEY`)
- **Onde encontrar:**
  1. **n8n:** Settings → Credentials → Azure TTS.
  2. **Portal Azure:** Speech Services → Keys and Endpoint.
- **Configuração:** Adicionar no `.env.local` na raiz do projeto.

### 2. Anthropic API Key (`ANTHROPIC_API_KEY`)
- **Onde encontrar:** 1Password ou Painel da Anthropic.
- **Configuração:** `.env.local`.

## 🚨 Problemas Comuns

### Erro "fetch failed" no Step Script
- **Sintoma:** Job falha no step `script`.
- **Causa:** Timeout na API do Claude ou falta de internet.
- **Solução:** Verificar logs na aba "Logs" do Job Detail. Se for timeout, tentar novamente (Retry).

### Áudio não toca no browser
- **Sintoma:** Player carrega mas não sai som.
- **Causa:** Falta de suporte a `Range` requests no servidor.
- **Solução:** (Corrigido no Gate 1.5.2) Garantir que `app/api/artifacts` tenha headers `Accept-Ranges`.
