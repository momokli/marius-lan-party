# 🖥️ LAN-Server / Dedicated Server

> Stand: Server-Stack als Code in `server-stack/` (Docker Compose für Momos MacBook M4 Pro).
> Alte Server im Lab (Factorio, Minecraft „mellon") existieren weiter, sind aber nur als Referenz
> in `/lab/games/` (read-only) — für die Party läuft alles über den neuen Stack.

## Neuer Stack (empfohlen)

Alles in `server-stack/`: **Docker-Compose-Files je Spiel + Control-Dashboard + Docs**.

| Spiel | Status auf M4-Mac | Port(s) |
|---|---|---|
| 🏭 Factorio | ✅ nativ (arm64) | 34197/udp |
| ⛏️ Minecraft Paper | ✅ nativ (arm64) | 25565/tcp |
| ⚔️ Reign of Nether (Forge 1.20.1) | ✅ nativ | 25566/tcp |
| 🔫 CS2 | ⚠️ nur via Rosetta (x86_64), nicht offiziell — Fallback: von PC hosten | 27015/tcp+udp |
| 🧟 L4D2 | ❌ srcds ist 32-bit → **nicht** auf Apple Silicon → Listen-Server („Host") | — |
| 🏗️ Satisfactory | ⚠️ Rosetta + 12–16 GB RAM → nur solo | 7777/tcp+udp, 8888/tcp |

→ **Start-Anleitung:** [`server-stack/README.md`](server-stack/README.md)
→ **Recherchierte Best-in-Slot-Settings (mit Quellen):** [`server-stack/docs/`](server-stack/docs/)

## Steam-Cache / Downloads ⚠️ LTE-Daten-Cap

- [ ] **CS2 (~40–60 GB) und Satisfactory (~15–25 GB) zuhause vorladen!** Einmal starten,
      warten bis SteamCMD fertig ist, stoppen, `server-stack/data/` auf den Mac mitnehmen
      (Details: [`server-stack/docs/apple-silicon.md`](server-stack/docs/apple-silicon.md))
- [ ] Steam-Librarys der Clients vorher updaten (kein 5GB-Download bei der Party!)

## Check-Liste vor der Party

- [ ] `server-stack/.env` anlegen (`cp .env.example .env`) — GSLT-Token + Passwörter eintragen
- [ ] Docker Desktop: Rosetta aktivieren (Settings → General), VM-RAM prüfen (24-GB-Mac → 16–20 GB)
- [ ] Server einmal komplett durchstarten (Dashboard: http://localhost:8080)
- [ ] Minecraft: Whitelist/ONLINE_MODE klären (haben alle 4 Mojang-Accounts?)
- [ ] LanHub: Games eintragen, Musicbot testen

## Altes Lab-Setup (nur Referenz)

- Factorio-Configs in `/lab/games/` (factorio_gridtorio.nomad.hcl, factorio_qol_august_2024.nomad.hcl)
- Minecraft „mellon" in `/lab/games/` (mellon.nomad.hcl, mellon_bleeding.nomad.hcl)
- CS 1.6 — alte Configs in `/lab/games/`
