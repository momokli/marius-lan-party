#!/bin/sh
# Archipelago MultiServer Entrypoint — Konfiguration über Umgebungsvariablen
# (werden im docker-compose.archipelago.yml gesetzt, Defaults aus .env).
#
# Wichtig: Ohne generierte Multiworld-Datei kann der Server keinen Room starten
# (headless: sonst tkinter-Dateidialog → Exit). Deshalb vorher prüfen.
set -e

MULTIDATA="${AP_MULTIDATA:-/app/data/multiworld.zip}"

if [ ! -f "$MULTIDATA" ]; then
  echo "================================================================"
  echo "❌ Keine Multiworld-Datei gefunden: $MULTIDATA"
  echo ""
  echo "   So geht's (siehe server-stack/docs/archipelago.md):"
  echo "   1. Pro Spieler eine YAML erstellen (Player-Options)"
  echo "   2. Generieren (zuhause!): WebHost https://archipelago.gg/start"
  echo "      oder lokal: docker compose -f docker-compose.archipelago.yml"
  echo "                  run --rm --entrypoint python archipelago"
  echo "                  Generate.py --player_files_path /app/data/yamls"
  echo "   3. Erzeugte .zip nach data/archipelago/multiworld.zip kopieren"
  echo "   4. Container neu starten (Control-UI oder docker compose up -d)"
  echo "================================================================"
  exit 1
fi

exec python MultiServer.py "$MULTIDATA" \
  --host "${AP_HOST:-0.0.0.0}" \
  --port "${AP_PORT:-38281}" \
  --password "${AP_PASSWORD:-}" \
  --server_password "${AP_SERVER_PASSWORD:-}" \
  --loglevel "${AP_LOGLEVEL:-info}" \
  --logtime \
  "$@"
