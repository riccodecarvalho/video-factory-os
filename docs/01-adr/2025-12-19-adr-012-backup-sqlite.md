# ADR-012: Sistema de Backup e Prevenção de Corrupção SQLite

**Data:** 2025-12-19
**Status:** Aceito
**Contexto:** Recuperação de incidente de corrupção de banco

## Contexto

Em 2025-12-19, o banco SQLite `video-factory.db` foi detectado como corrompido com erro `SQLITE_CORRUPT: database disk image is malformed`. O banco continha 15 jobs, 169 steps e dados de configuração.

### Análise de Causa Raiz

**Causas prováveis:**
1. **WAL não finalizado** - O SQLite usa Write-Ahead Logging (WAL) que pode deixar transações pendentes
2. **Servidor rodando por tempo prolongado** (>2h) sem checkpoints
3. **Múltiplas conexões** ao banco sem coordenação adequada
4. **Crash ou interrupção** durante escrita

**O que NÃO foi a causa:**
- Alterações manuais no código não causaram a corrupção
- O banco já estava corrompido quando a sessão iniciou

### Impacto

- Dados temporariamente inacessíveis
- Necessidade de recriar o banco para continuar desenvolvimento
- Dados antigos perdidos temporariamente até recuperação

### Recuperação Realizada

1. **Backup do banco corrompido** foi preservado
2. **Extração de dados** usando `sqlite3 .dump` nos dados legíveis
3. **Importação via ATTACH DATABASE** para novo banco limpo
4. **Resultado:** 16 jobs, 176 steps, 3 projetos recuperados

## Decisão

Implementar sistema de backup automático com:

### 1. Scripts de Backup (`scripts/backup.sh`)
- Verificação de integridade antes do backup (`PRAGMA integrity_check`)
- Checkpoint do WAL (`PRAGMA wal_checkpoint(TRUNCATE)`)
- Uso de `.backup` do SQLite para consistência
- Rotação automática (máximo 10 backups)

### 2. Scripts de Restore (`scripts/restore.sh`)
- Verificação de integridade do backup antes de restaurar
- Backup do estado atual antes de sobrescrever
- Limpeza de arquivos WAL/SHM

### 3. Comandos npm
```bash
npm run db:backup    # Criar backup
npm run db:restore   # Restaurar de backup
```

### 4. Diretório de Backups
- Localização: `./backups/`
- Formato: `video-factory_YYYYMMDD_HHMMSS.db`
- Ignorado pelo git (`.gitignore`)

## Prevenção Futura

### Recomendações Imediatas:
1. **Executar `npm run db:backup` antes de cada sessão de desenvolvimento**
2. **Após 2h+ de uso contínuo**, fazer checkpoint manual ou reiniciar servidor

### Melhorias para Implementar:
1. [ ] Backup automático no startup do `npm run dev`
2. [ ] Middleware de checkpoint periódico no servidor
3. [ ] Alerta quando WAL cresce muito
4. [ ] Migrar para PostgreSQL em ambiente de produção

## Consequências

### Positivas:
- Sistema de recuperação robusto
- Prevenção de perdas futuras
- Documentação da causa raiz

### Negativas:
- Overhead mínimo de espaço para backups
- Necessidade de executar backup manualmente (até automação)

## Referências

- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [SQLite Backup API](https://www.sqlite.org/backup.html)
- [PRAGMA integrity_check](https://www.sqlite.org/pragma.html#pragma_integrity_check)
