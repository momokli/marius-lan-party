# 🍎 Apple Silicon (M4 Pro) — Docker Desktop, Rosetta & Vorladen

Ziel-Host: MacBook Pro M4 Pro, 24 GB RAM, Docker Desktop. Alles hier ist auf diese
Umgebung abgestimmt.

## Architektur-Check (Stand 09/2026, verifiziert)

| Image | Architekturen (Docker-Hub-Manifest) | Folge |
|---|---|---|
| `factoriotools/factorio` | amd64 **+ arm64** | ✅ nativ, kein Rosetta |
| `itzg/minecraft-server` | amd64 + arm64 + riscv64 | ✅ nativ |
| `wolveix/satisfactory-server` | **nur amd64** | ⚠️ Rosetta nötig |
| `joedwards32/cs2` | **nur amd64** (Valve liefert keinen ARM-Build) | ⚠️ Rosetta nötig |
| `ghcr.io/jackzmc/srcds-l4d2` | **nur amd64**, srcds ist **32-bit** | ❌ Rosetta unmöglich |

Quellen: Docker-Hub-Tags (`hub.docker.com/v2/repositories/…/tags/`), joedwards32/CS2 Issues
[#117](https://github.com/joedwards32/CS2/issues/117) / [#163](https://github.com/joedwards32/CS2/issues/163)
(„CS2 components are compiled only for x86_64"), wolveix/satisfactory-server
[Issue #128](https://github.com/wolveix/satisfactory-server/issues/128).

## Rosetta in Docker Desktop aktivieren

1. Docker Desktop → **Settings → General** → **„Use Rosetta for x86_64/amd64 emulation on Apple Silicon"** aktivieren (Docker Desktop 4.16+, „Rosetta for Linux" GA seit 4.25).
   - Doku: <https://docs.docker.com/desktop/settings-and-maintenance/settings/> · Blog: <https://www.docker.com/blog/docker-desktop-4-25/>
2. x86_64-Images im Compose-File mit `platform: linux/amd64` markieren (in unseren Files bereits gesetzt).
   Ohne Rosetta würde Docker QEMU nutzen — deutlich langsamer und bei SteamCMD-Servern oft kaputt.
3. Rosetta 2 emuliert **nur x86_64** (kein 32-bit) → alle 32-bit-Server (L4D2-srcds) laufen auf dem Mac prinzipiell nicht.

## SteamCMD unter Rosetta — bekannte Stolpersteine

- SteamCMD meldet unter Emulation ggf. `Unable to determine CPU Frequency` — Workaround: `CPU_MHZ` setzen
  (Quelle: joedwards32/CS2 [Issue #63](https://github.com/joedwards32/CS2/issues/63)).
- Fehler wie `SteamClientService_25 … invalid name/address:port` beim Download wurden unter Rosetta beobachtet
  (gleiche Quelle) — Server-Image einmal neu starten hilft manchmal, sonst `STEAMAPPVALIDATE=1`.
- UE5-Server (Satisfactory, Palworld) laufen nach Community-Erfahrung unter Rosetta, wenn SteamCMD die
  Dateien erst einmal hat — Beleg für das Muster: jammsen/docker-palworld-dedicated-server dokumentiert
  `platform: linux/amd64` + Rosetta als unterstützten Weg auf Apple Silicon
  (<https://github.com/jammsen/docker-palworld-dedicated-server>).

## RAM-Budget (24 GB)

- macOS + Docker Desktop VM: ~4–6 GB Overhead. VM-RAM ggf. erhöhen: Settings → Resources → Memory (Standard 50 % = 12 GB).
- Empfohlene Parallel-Kombis:
  - **Standard:** Factorio (4G-Limit) + Minecraft Paper (5G) + Reign of Nether (7G) = ~16 GB → passt.
  - **+ CS2** (8G-Limit): ~24 GB → nur wenn sonst nichts läuft, VM-RAM hochsetzen.
  - **Satisfactory** (12G-Limit): nur solo, nichts anderes parallel.

## ⚠️ Vorladen zuhause (LTE-Daten-Cap bei Marius!)

CS2 (~40–60 GB) und Satisfactory (~15–25 GB) NIE bei der Party zum ersten Mal starten —
das würde den Daten-Cap sprengen und ewig dauern. Stattdessen:

1. Zuhause (Heimnetz): `cp .env.example .env`, dann
   `docker compose -f docker-compose.cs2.yml up -d` (bzw. satisfactory) einmal laufen lassen,
   bis SteamCMD fertig geladen hat (Logs beobachten: `docker compose -f … logs -f`).
2. Server wieder stoppen (`docker compose -f … stop`).
3. Den kompletten `server-stack/data/`-Ordner auf den Mac bei Marius mitnehmen
   (externe SSD / USB-Stick — CS2-Daten sind 40+ GB).
4. Dort `data/` an dieselbe Stelle legen (Standard: `server-stack/data/`) und Server starten.

**Achtung:** Minecraft/Paper und Factorio laden nur wenige hundert MB — die können auch direkt bei
der Party das erste Mal starten. Reign of Nether (CurseForge-Modpack, ~200–400 MB) ebenfalls harmlos.
