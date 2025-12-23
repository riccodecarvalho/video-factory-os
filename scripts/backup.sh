#!/bin/bash
# =============================================================================
# Video Factory OS - Sistema de Backup Robusto
# =============================================================================
#
# Este script implementa um sistema de backup completo e seguro:
# - Checkpoint WAL antes do backup
# - Verificação de integridade
# - Rotação automática (mantém últimos 20 backups)
# - Logs estruturados
# - Suporte a backup em múltiplas localizações
#
# IMPORTANTE: Rodar ANTES de cada sessão de desenvolvimento!
# =============================================================================

set -e  # Parar em caso de erro

# Configurações
DB_FILE="video-factory.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/video-factory_${TIMESTAMP}.db"
MAX_BACKUPS=20
LOG_FILE="${BACKUP_DIR}/backup.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de log
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1" >> "$LOG_FILE" 2>/dev/null || true; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARN: $1" >> "$LOG_FILE" 2>/dev/null || true; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE" 2>/dev/null || true; }

# Banner
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   🗄️  Video Factory OS - Sistema de Backup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se o banco existe
if [ ! -f "$DB_FILE" ]; then
    log_error "Banco de dados não encontrado: $DB_FILE"
    echo "Dica: Execute 'npm run db:seed' para criar um novo banco"
    exit 1
fi

log_info "Iniciando backup do banco: $DB_FILE"

# 1. Fazer checkpoint do WAL (garante dados consistentes)
log_info "Executando WAL checkpoint..."
sqlite3 "$DB_FILE" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null || log_warn "Aviso no WAL checkpoint"

# 2. Verificar integridade ANTES do backup
log_info "Verificando integridade do banco atual..."
INTEGRITY=$(sqlite3 "$DB_FILE" "PRAGMA integrity_check;" 2>&1)
if [ "$INTEGRITY" != "ok" ]; then
    log_error "⚠️ BANCO PODE ESTAR CORROMPIDO!"
    echo "Resultado: $INTEGRITY"
    
    # Fazer backup de emergência mesmo assim
    BACKUP_FILE="${BACKUP_DIR}/video-factory_${TIMESTAMP}_SUSPECT.db"
    log_warn "Criando backup de emergência: $BACKUP_FILE"
fi

# 3. Criar backup usando .backup (método mais seguro do SQLite)
log_info "Criando backup: $BACKUP_FILE"
sqlite3 "$DB_FILE" ".backup '${BACKUP_FILE}'" 2>&1
RESULT=$?

if [ $RESULT -ne 0 ]; then
    log_error "Falha ao criar backup"
    exit 1
fi

# 4. Verificar integridade do BACKUP
log_info "Verificando integridade do backup..."
BACKUP_INTEGRITY=$(sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" 2>&1)
if [ "$BACKUP_INTEGRITY" != "ok" ]; then
    log_error "Backup criado mas com problemas de integridade!"
    echo "Resultado: $BACKUP_INTEGRITY"
    exit 1
fi

log_info "✅ Integridade do backup: OK"

# 5. Mostrar estatísticas
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log_info "Tamanho: $SIZE"

echo ""
echo "📊 Estatísticas do banco:"
sqlite3 "$BACKUP_FILE" "
    SELECT '   📁 Projetos: ' || COUNT(*) FROM projects;
    SELECT '   📋 Jobs: ' || COUNT(*) FROM jobs;
    SELECT '   📝 Recipes: ' || COUNT(*) FROM recipes;
    SELECT '   🔧 Providers: ' || COUNT(*) FROM providers;
    SELECT '   💬 Prompts: ' || COUNT(*) FROM prompts;
"

# 6. Limpar backups antigos (manter apenas MAX_BACKUPS)
BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/video-factory_*.db 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    TO_DELETE=$((BACKUP_COUNT - MAX_BACKUPS))
    log_info "Removendo $TO_DELETE backup(s) antigo(s)..."
    ls -1t ${BACKUP_DIR}/video-factory_*.db | tail -n $TO_DELETE | xargs rm -f
fi

# 7. Resumo final
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   ✅ BACKUP CONCLUÍDO COM SUCESSO"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   📦 Arquivo: $BACKUP_FILE"
echo "   📏 Tamanho: $SIZE"
echo "   🔒 Integridade: OK"
echo ""
echo "   📁 Backups disponíveis ($BACKUP_COUNT de $MAX_BACKUPS max):"
ls -1t ${BACKUP_DIR}/video-factory_*.db 2>/dev/null | head -5 | while read f; do
    SIZE=$(du -h "$f" | cut -f1)
    echo "      $(basename $f) ($SIZE)"
done
echo ""
