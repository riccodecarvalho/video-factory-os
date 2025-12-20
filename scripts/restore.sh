#!/bin/bash
# Video Factory OS - Restaurar Backup
# Restaura o banco de dados a partir de um backup

BACKUP_DIR="backups"
DB_FILE="video-factory.db"

# Listar backups disponíveis
echo "📁 Backups disponíveis:"
ls -lh ${BACKUP_DIR}/video-factory_*.db 2>/dev/null

if [ -z "$1" ]; then
    echo ""
    echo "Uso: ./scripts/restore.sh <arquivo_backup>"
    echo "Exemplo: ./scripts/restore.sh backups/video-factory_20231219_120000.db"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Verificar integridade do backup
INTEGRITY=$(sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" 2>&1)
if [ "$INTEGRITY" != "ok" ]; then
    echo "❌ Backup está corrompido!"
    echo "Resultado: $INTEGRITY"
    exit 1
fi

echo "✅ Backup verificado: $BACKUP_FILE"

# Criar backup do banco atual antes de restaurar
if [ -f "$DB_FILE" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    CURRENT_BACKUP="${BACKUP_DIR}/video-factory_${TIMESTAMP}_pre_restore.db"
    echo "📦 Fazendo backup do banco atual para: $CURRENT_BACKUP"
    cp "$DB_FILE" "$CURRENT_BACKUP"
fi

# Remover arquivos WAL e SHM
rm -f "${DB_FILE}-wal" "${DB_FILE}-shm"

# Restaurar
echo "🔄 Restaurando de: $BACKUP_FILE"
cp "$BACKUP_FILE" "$DB_FILE"

# Verificar restauração
VERIFY=$(sqlite3 "$DB_FILE" "PRAGMA integrity_check;" 2>&1)
if [ "$VERIFY" = "ok" ]; then
    sqlite3 "$DB_FILE" "SELECT 'Jobs: ' || COUNT(*) FROM jobs; SELECT 'Steps: ' || COUNT(*) FROM job_steps; SELECT 'Projects: ' || COUNT(*) FROM projects;"
    echo ""
    echo "✅ Restauração concluída com sucesso!"
else
    echo "❌ Erro na restauração!"
    exit 1
fi
