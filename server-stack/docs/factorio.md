# 🏭 Factorio — Best-in-Slot-Settings

**Arch:** arm64 ✅ nativ (Image `factoriotools/factorio` liefert amd64 + arm64)
**Image:** `factoriotools/factorio:stable` (Community-Standard, offizieller Docker-Weg laut Wiki)
**Ports:** `34197/udp` (Game) · `27015/tcp` (RCON)
**RAM:** 2 GB reichen für 4 Spieler + kleine Basis; `mem_limit: 4g` als Puffer
**Quellen:** <https://github.com/factoriotools/factorio-docker> · <https://wiki.factorio.com/Multiplayer>

## Setup

```bash
docker compose -f docker-compose.factorio.yml up -d
```

Beim ersten Start erzeugt das Image die Struktur unter `data/factorio/` und generiert eine
neue Map mit dem Namen aus `FACTORIO_SAVE_NAME` (Standard `lan-party`). **Achtung:** der Container
läuft als User **UID 845** — auf macOS kein Problem (Docker Desktop virtuallisiert Dateirechte),
auf Linux-Hosts ggf. `sudo chown -R 845:845 data/factorio` (Quelle: factorio-docker README).

## Best-in-Slot: `data/factorio/config/server-settings.json`

Nach dem ersten Start editieren (Server muss dafür gestoppt sein oder wird nach dem Edit neu gestartet):

| Setting | Empfehlung | Begründung |
|---|---|---|
| `name` | „LAN-Party Factorio" | sichtbar im LAN-Tab |
| `description` | kurzer Text | — |
| `max_players` | `4` | genau wir vier; offen lassen zieht Fremde an (wenn `visibility_public=false`, egal) |
| `game_password` | **leer** oder Party-Passwort | LAN, trusted group |
| `visibility` → `public` | `false` | **kein Public-Lister** — nur LAN |
| `visibility` → `lan` | `true` | im LAN-Tab sichtbar |
| `require_user_verification` | `false` | LAN: Steam-Verify unnötig, sonst können Leute ohne Steam nicht joinen |
| `autosave_interval` | `10` (Default) | alle 10 min — bei 4-Spieler-Basen guter Kompromiss |
| `autosave_slots` | `3` (Default) | 3 rotierende Slots |
| `max_upload_speed` | `0` (Default, unbegrenzt) | LAN: egal; nur bei schwachem WLAN drosseln |
| `admins` | Steam-IDs der 4 (optional) | wer im Spiel `/admin` darf |
| `only_admins_can_pause` | `true` | verhindert Fremd-Pause |
| `afk_autokick_interval` | `0` (aus) | LAN-Party: niemand soll geflogen werden |

## RCON

- Das Image konfiguriert RCON automatisch: Passwort in `data/factorio/config/rconpw`, Port `27015/tcp` (env `RCON_PORT`).
- Test: `docker exec lan-factorio rcon /players` (das Image bringt ein `rcon`-Helper-Script mit, siehe factorio-docker README).

## Map-Settings (optional)

- `data/factorio/config/map-gen-settings.json` — Ressourcen-Reichtum, Startgebiet, Wasser …
- `data/factorio/config/map-settings.json` — Evolution, Biter-Verhalten …
- Nur für **neue** Maps relevant (bestehende Save ignoriert sie).

## Mods

Mods einfach nach `data/factorio/mods/` legen (`*.zip`), `UPDATE_MODS_ON_START=true` ist gesetzt
(synct auch Mod-Portale). Alle Clients brauchen dieselben Mods — vor der Party klären!

## Quellen

- factoriotools/factorio-docker (README, Ports, UID 845, Saves): <https://github.com/factoriotools/factorio-docker>
- Factorio Wiki — Multiplayer/server-settings.json: <https://wiki.factorio.com/Multiplayer>
