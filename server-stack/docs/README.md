# 📚 Server-Stack Docs

Recherchierte Best-in-Slot-Settings für die LAN-Party (05.–07.09.2026, Eichwalde).
Ziel-Host: **MacBook Pro M4 Pro, 24 GB RAM, Docker Desktop** (arm64, Rosetta für x86_64-Images).

## Übersicht

| Server | Arch-Status auf Apple Silicon | RAM | Disk | Ports | Doc |
|---|---|---|---|---|---|
| 🏭 Factorio | ✅ **nativ** (arm64-Build) | 2–4 GB | klein | 34197/udp, 27015/tcp | [factorio.md](factorio.md) |
| ⛏️ Minecraft Paper | ✅ **nativ** (arm64-Build) | 4–5 GB | ~1–2 GB | 25565/tcp | [minecraft.md](minecraft.md) |
| ⚔️ Reign of Nether | ✅ **nativ** (Java/arm64) | 6–7 GB | ~1 GB | 25566/tcp | [minecraft.md](minecraft.md) |
| 🔫 CS2 | ⚠️ **nur via Rosetta** (x86_64-Emulation), nicht offiziell unterstützt | 4–8 GB | **40–60 GB** | 27015/tcp+udp | [cs2.md](cs2.md) |
| 🧟 L4D2 | ❌ **nicht lauffähig** (srcds ist 32-bit, Rosetta kann kein 32-bit) | 2–4 GB | ~13 GB | 27015/tcp+udp | [l4d2.md](l4d2.md) |
| 🏗️ Satisfactory | ⚠️ **nur via Rosetta**, 12–16 GB RAM → nur solo betreiben | 12–16 GB | **~15–25 GB** | 7777/tcp+udp, 8888/tcp | [satisfactory.md](satisfactory.md) |

## Wichtige Gesamt-Fakten

- **RAM-Budget (24 GB):** Factorio + Minecraft + Reign ≈ 12–14 GB, passt. CS2 zusätzlich ≈ 4–8 GB → knapp.
  Satisfactory (12–16 GB) **nicht parallel** zu anderen Servern betreiben. Docker-Desktop-VM-RAM ggf. erhöhen
  (Standard = 50 % des Host-RAMs): Docker Desktop → Settings → Resources → Memory.
- **Vorladen zuhause!** LTE-Daten-Cap bei Marius: CS2 (~40–60 GB) und Satisfactory (~15–25 GB) vor der
  Party im Heimnetz starten, damit SteamCMD die Files einmal zieht (→ `data/`-Ordner). Details: [apple-silicon.md](apple-silicon.md).
- **Secrets** gehören NUR in `server-stack/.env` (Vorlage: `.env.example`) — nie committen.
- **4 Spieler:** Alle Server auf 4–10 Slots konfiguriert; CS2-competitive hat fix 10 Slots (Bots zum Auffüllen).

## Quickstart

```bash
cd server-stack
cp .env.example .env          # Werte eintragen (Passwörter, Tokens)
# Server einzeln starten:
docker compose -f docker-compose.factorio.yml up -d
docker compose -f docker-compose.minecraft.yml up -d
# Dashboard + Control-API (kein npm install nötig):
node control/server.js        # → http://localhost:8080
```

Mehr: [server-stack/README.md](../README.md)
