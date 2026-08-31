# 🎮 LAN-Party Server-Stack

Docker-Compose-Setup für die Dedicated Game Server der LAN-Party + kleines
Control-Dashboard (Status / Start / Stop). Läuft auf **Momos MacBook Pro M4 Pro
(24 GB, Docker Desktop)** — Details & Recherche: [`docs/`](docs/).

| Server | Compose-File | Auf Apple Silicon | Docs |
|---|---|---|---|
| 🏭 Factorio | `docker-compose.factorio.yml` | ✅ nativ (arm64) | [docs/factorio.md](docs/factorio.md) |
| ⛏️ Minecraft Paper | `docker-compose.minecraft.yml` | ✅ nativ (arm64) | [docs/minecraft.md](docs/minecraft.md) |
| ⚔️ Reign of Nether | `docker-compose.minecraft.yml` (Dienst `minecraft-reign`) | ✅ nativ | [docs/minecraft.md](docs/minecraft.md) |
| 🔫 Counter-Strike 2 | `docker-compose.cs2.yml` | ⚠️ nur via Rosetta | [docs/cs2.md](docs/cs2.md) |
| 🧟 Left 4 Dead 2 | `docker-compose.l4d2.yml` | ❌ nicht lauffähig (32-bit) | [docs/l4d2.md](docs/l4d2.md) |
| 🏗️ Satisfactory | `docker-compose.satisfactory.yml` | ⚠️ Rosetta, 12–16 GB RAM | [docs/satisfactory.md](docs/satisfactory.md) |

## 1. Vorbereitung

```bash
cd server-stack
cp .env.example .env        # Passwörter/Tokens eintragen — .env wird nie committet
```

**Vorladen (LTE-Daten-Cap!):** CS2 (~40–60 GB) und Satisfactory (~15–25 GB) **zuhause** einmal
starten und wieder stoppen, dann `data/` auf den Mac mitnehmen → [docs/apple-silicon.md](docs/apple-silicon.md).
Rosetta in Docker Desktop aktivieren (Settings → General), wenn CS2/Satisfactory laufen sollen.

## 2. Server starten/stoppen (Docker Compose)

```bash
# Einzelne Server (empfohlen):
docker compose -f docker-compose.factorio.yml up -d
docker compose -f docker-compose.minecraft.yml up -d        # Paper + Reign of Nether
docker compose -f docker-compose.minecraft.yml up -d minecraft   # nur Paper
docker compose -f docker-compose.cs2.yml up -d
docker compose -f docker-compose.satisfactory.yml up -d

# Stoppen / Logs:
docker compose -f docker-compose.factorio.yml stop
docker compose -f docker-compose.factorio.yml logs -f
```

## 3. Control-Dashboard (Status / Start / Stop)

Kleine Web-UI: Karten für alle Server, Live-Status (running/stopped), Start/Stop/Restart-Buttons,
Log-Viewer. **Zero-Dependency** — kein `npm install` nötig.

```bash
cd server-stack/control
node server.js        # → http://localhost:8080  (im LAN: http://<mac-ip>:8080)
```

Alternativ als Container (optional, braucht Docker-Socket; **immer aus `server-stack/` starten**):

```bash
cd server-stack
docker compose -f docker-compose.control.yml up -d --build   # → http://localhost:8080
```

API (für eigene Scripts): `GET /api/servers` · `POST /api/servers/<id>/start|stop|restart` ·
`GET /api/servers/<id>/logs`. Env: `HOST`, `PORT`, `COMPOSE_DIR`, `SERVERS_JSON`.

## Daten & Secrets

- Alle Spieldaten/Saves liegen in `server-stack/data/<spiel>/` (in `.gitignore`, wird nie committet).
- Secrets (GSLT-Token, Passwörter) nur in `.env` — Vorlage `.env.example`, nie committen.
- Backup vor der Party: `data/` kopieren (oder nur die Saves).

## Party-Checkliste (kurz)

1. [ ] `cp .env.example .env` + Werte (CS2_GSLT_TOKEN, RCON-Passwörter)
2. [ ] CS2/Satisfactory-Images **zuhause** vorladen (siehe oben)
3. [ ] Rosetta in Docker Desktop aktiviert
4. [ ] Server starten → Dashboard auf http://localhost:8080 checken
5. [ ] In den Spielen: LAN-Tab / `connect <mac-ip>:<port>` (Factorio: LAN-Spiele; MC: Mehrspieler → Server hinzufügen)
