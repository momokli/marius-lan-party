# 🏗️ Satisfactory — Best-in-Slot-Settings

**Arch:** ⚠️ **nur x86_64** — Coffee Stain baut keinen ARM-Server („no plans for an ARM CPU-compatible build",
<https://satisfactory.fandom.com/wiki/Dedicated_servers>). Auf Apple Silicon nur via Rosetta
(`platform: linux/amd64`). **Machbar, aber ressourcenhungrig** → nur solo betreiben.
**Image:** `wolveix/satisfactory-server` (<https://github.com/wolveix/satisfactory-server>)
**Offizielle Anforderungen** (<https://satisfactory.wiki.gg/wiki/Dedicated_servers> bzw. Fandom-Archiv):

| Ressource | Anforderung |
|---|---|
| CPU | moderner x86_64 (i5-3570 / Ryzen 5 3600 oder besser), **Single-Core-Performance zählt** |
| RAM | **12 GB min**, 16 GB empfohlen (größere Saves / >4 Spieler) |
| Disk | 25 GB (Server + Updates; Download ~15 GB) |

**Ports (seit 1.0/1.1):** `7777/udp` (Game) + `7777/tcp` (Server-API/HTTPS) + `8888/tcp`
(Reliable-Messaging, seit Update 1.1 **Pflicht** — sonst „Server online, Join hängt").
Die alten Ports 15000/15777 gibt es seit 1.0 **nicht mehr**.
(Quelle: <https://space-node.net/blog/satisfactory-dedicated-server-ports-setup-2026>)

## Setup

```bash
docker compose -f docker-compose.satisfactory.yml up -d
```

- Erster Start: SteamCMD lädt **~15 GB** → zuhause vorladen ([apple-silicon.md](apple-silicon.md))!
- Daten unter `data/satisfactory/` (Container `/config`): `backups/` (Auto-Backups),
  `gamefiles/`, `logs/`, `saved/` (Saves + ServerConfig).
- PUID/PGID: Defaults (1000) reichen auf macOS; nur bei Permission-Fehlern setzen (Image-README).

## Best-in-Slot-Settings

| Env / Datei | Empfehlung | Begründung |
|---|---|---|
| `MAXPLAYERS=4` | 4 | genau wir vier (`.env`: `SATISFACTORY_MAXPLAYERS`) |
| `STEAMBETA=false` | Stable | kein Experimental-Branch bei der Party |
| `mem_limit: 12g` | 12 GB | offizielles Minimum; Container crasht sonst bei großen Fabriken |
| RAM-Budget | **solo** | 12–16 GB von 24 GB → nichts parallel (auch CS2 nicht) |
| Auto-Backups | an (`backups/`) | Standard aktiv — Saves gehen nie verloren |
| Server-Config | `saved/ServerConfig/Game.ini` | Session-Name, Passwort, Slot-Anzahl (nach 1.0/1.1-Format; siehe wolveix-Wiki „Upgrading for 1.1") |

## Rosetta-Praktikabilität (M4 Pro 24 GB)

- **Pro:** UE5-Server unter Rosetta laufen nach Community-Erfahrung (Muster: Palworld-Docker
  dokumentiert `linux/amd64` + Rosetta als unterstützt, <https://github.com/jammsen/docker-palworld-dedicated-server>);
  ein Nutzer berichtet von funktionierendem Satisfactory-Dedi auf M1 (via Parallels,
  <https://www.reddit.com/r/SatisfactoryGame/comments/r05ygm/i_got_a_dedicated_server_to_work_on_an_m1_macbook/>).
- **Contra:** Frühe M1-Ära scheiterte unter QEMU-Emulation (wolveix
  [Issue #128](https://github.com/wolveix/satisfactory-server/issues/128): „Failed to install app …
  Requires 64bit operating system") — mit Docker-Desktop-Rosetta (statt QEMU) ist das Muster heute anders,
  aber **kein offizieller Support** von Coffee Stain/wolveix.
- **Fazit:** „Nicht empfohlen auf dem Mac" als Primärweg — aber als **Fallback-B** durchaus testbar.
  Wenn es bei der Party hakt: Satisfactory hat guten Listen-Host-Multiplayer
  (GAMES.md: „Dedicated Server möglich" — Host reicht bei 4 Leuten auch).

## Quellen

- wolveix/satisfactory-server (README, Env, Volumes): <https://github.com/wolveix/satisfactory-server>
- Offizielle Anforderungen (Fandom-Archiv des offiziellen Wikis): <https://satisfactory.fandom.com/wiki/Dedicated_servers>
- Ports 1.0/1.1: <https://space-node.net/blog/satisfactory-dedicated-server-ports-setup-2026>
- Apple-Silicon-Diskussion: <https://github.com/wolveix/satisfactory-server/issues/128>
