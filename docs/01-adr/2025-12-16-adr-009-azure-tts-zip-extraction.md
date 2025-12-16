# ADR-009: Azure TTS ZIP Extraction

**Data:** 2025-12-16  
**Status:** Aceito  
**Decisores:** Ricardo + AI Agent

---

## Contexto

Azure Speech Batch Synthesis API retorna um arquivo ZIP (`results.zip`) contendo:
- `0001.mp3` - Áudio concatenado
- `0001.debug.json` - Metadados de debug
- `summary.json` - Resumo da síntese

O código original salvava o ZIP diretamente como `.mp3`, causando falha no FFmpeg/FFprobe.

---

## Decisão

**Usar `adm-zip` para extrair o MP3 real do ZIP antes de salvar.**

### Implementação

```typescript
// providers.ts
const AdmZip = (await import("adm-zip")).default;

// Download ZIP to temp file
const tempZipPath = `${request.outputPath}.zip`;
await fs.writeFile(tempZipPath, zipBuffer);

// Extract MP3
const zip = new AdmZip(tempZipPath);
const mp3Entry = zip.getEntries().find(e => e.entryName.endsWith('.mp3'));
await fs.writeFile(request.outputPath, mp3Entry.getData());

// Cleanup
await fs.unlink(tempZipPath);
```

---

## Consequências

### Positivas
- ✅ Áudio MP3 válido para FFprobe/FFmpeg
- ✅ Compatível com qualquer OS (não depende de `unzip` CLI)
- ✅ Cleanup automático do ZIP temporário

### Negativas
- ⚠️ Dependência adicional (`adm-zip`)
- ⚠️ Uso de disco temporário duplicado durante extração

---

## Alternativas Consideradas

1. **Usar `unzip` CLI** - Rejeitado: não cross-platform
2. **Mudar para TTS REST (síncrono)** - Rejeitado: limite de 10 minutos
3. **Salvar ZIP e extrair on-demand** - Rejeitado: complica render step
