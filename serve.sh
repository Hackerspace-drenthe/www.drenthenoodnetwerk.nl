#!/usr/bin/env bash
# serve.sh — Start een lokale webserver voor development en testing.
# Gebruik: ./serve.sh [poort]
# Standaard poort: 8000

set -euo pipefail

PORT="${1:-8000}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🌐 Meshcore Drenthe — lokale server"
echo "   http://localhost:${PORT}"
echo "   Druk Ctrl+C om te stoppen."
echo ""

cd "$DIR"
python3 -m http.server "$PORT" --bind 127.0.0.1
