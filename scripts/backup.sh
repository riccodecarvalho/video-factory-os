#!/bin/bash
# Video Factory OS - Backup Automático
# Este script cria backups do banco de dados SQLite
# Deve ser executado antes de cada sessão de desenvolvimento ou periodicamente via cron

DB_FILE="video-factory.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/video-factory_${TIMESTAMP}.db"
MAX_BACKUPS=10

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se o banco existe
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Banco de dados não encontrado: $DB_FILE"
    exit 1
fi

# Verificar integridade antes do backup
INTEGRITY=$(sqlite3 "$DB_FILE" "PRAGMA integrity_check;" 2>&1)
if [ "$INTEGRITY" != "ok" ]; then
    echo "⚠️ ATENÇÃO: Banco pode estar corrompido!"
    echo "Resultado do integrity_check: $INTEGRITY"
    echo "Fazendo backup de emergência mesmo assim..."
    BACKUP_FILE="${BACKUP_DIR}/video-factory_${TIMESTAMP}_POSSIBLY_CORRUPT.db"
fi

# Fazer checkpoint do WAL para garantir dados consistentes
sqlite3 "$DB_FILE" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null

# Criar backup usando .backup para garantir consistência
sqlite3 "$DB_FILE" ".backup '${BACKUP_FILE}'" 2>&1
RESULT=$?

if [ $RESULT -eq 0 ]; then
    # Verificar integridade do backup
    BACKUP_INTEGRITY=$(sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" 2>&1)
    if [ "$BACKUP_INTEGRITY" = "ok" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "✅ Backup criado com sucesso: $BACKUP_FILE ($SIZE)"
    else
        echo "⚠️ Backup criado mas pode ter problemas de integridade"
    fi
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

# Limpar backups antigos (manter apenas os últimos MAX_BACKUPS)
BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/video-factory_*.db 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
    echo "🗑️ Removendo $TO_DELETE backup(s) antigo(s)..."
    ls -1t ${BACKUP_DIR}/video-factory_*.db | tail -n $TO_DELETE | xargs rm -f
fi

# Mostrar estatísticas
echo ""
echo "📊 Estatísticas do backup:"
sqlite3 "$BACKUP_FILE" "SELECT 'Jobs: ' || COUNT(*) FROM jobs; SELECT 'Steps: ' || COUNT(*) FROM job_steps; SELECT 'Projects: ' || COUNT(*) FROM projects;"

echo ""
echo "📁 Backups disponíveis:"
ls -lh ${BACKUP_DIR}/video-factory_*.db 2>/dev/null | tail -5
