# ⛏️ Minecraft — Paper (Vanilla) + Reign of Nether (Forge 1.20.1)

**Arch:** arm64 ✅ nativ (Image `itzg/minecraft-server` ist multi-arch: amd64 + arm64 + riscv64)
**Image:** `itzg/minecraft-server:latest` (De-facto-Standard für MC-Docker)
**Quellen:** <https://github.com/itzg/docker-minecraft-server> · Doku: <https://docker-minecraft-server.readthedocs.io/>

Zwei Dienste in einer Compose-Datei:

| Dienst | Port | Typ | Zweck |
|---|---|---|---|
| `minecraft` | 25565/tcp | **PAPER** | Vanilla-Survival, schnell & stabil |
| `minecraft-reign` | 25566/tcp | **AUTO_CURSEFORGE** | Reign of Nether RTS (Modpack) |

## Best-in-Slot: Paper-Server (`minecraft`)

| Env / Setting | Empfehlung | Begründung |
|---|---|---|
| `TYPE=PAPER` | Paper statt Vanilla | Performance + Bugfixes, volle Vanilla-Kompatibilität |
| `VERSION` | `latest` oder pinnen (z.B. `1.21.4`) | Pinnen = keine Überraschungs-Updates bei der Party |
| `MEMORY=4G` | 4 GB | reicht locker für 4 Spieler; `mem_limit: 5g` als Puffer |
| `USE_AIKAR_FLAGS=true` | ✅ | Aikars G1GC-Flags = beste GC-Tuning-Praxis; Quellen: <https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/> und <https://docs.papermc.io/paper/aikars-flags> |
| `MAX_PLAYERS=8` | 8 | 4 Spieler + Luft |
| `VIEW_DISTANCE=12` | 12 | guter Kompromiss (Standard ist 10, 12+ schöner, kostet RAM/CPU) |
| `ONLINE_MODE=TRUE` | TRUE | nur echte Mojang-Accounts; **FALSE** nur wenn jemand keinen Account hat (dann Sicherheitsrisiko beachten) |
| `ENABLE_WHITELIST` + `WHITELIST` | TRUE + 4 Namen | empfohlen: nur wir vier |
| `ENABLE_QUERY=true` | ✅ | Server-Browser in Minecraft zeigt den Server an |

Tipp: Welt-Settings in `data/minecraft/server.properties` (`difficulty`, `pvp`, `gamemode` …) —
wird beim ersten Start generiert, danach editieren und neu starten.

## Reign of Nether (RTS-Mod) — AUTO_CURSEFORGE (`minecraft-reign`)

Der Mod **Reign of Nether RTS** läuft auf **Forge + Minecraft 1.20.1** (verifiziert über die
Modrinth-API: `reignofnether-1.4.2`, Loader `forge`, Game `1.20.1`, ~39 MB JAR;
<https://modrinth.com/mod/reign-of-nether-rts/versions>).

Der Dienst nutzt den **AUTO_CURSEFORGE**-Modus von itzg, der das CurseForge-**Modpack**
automatisch installiert (inkl. passendem Forge-Loader, Upgrades, Aufräumen alter Versionen):

| Env | Wert | Erklärung |
|---|---|---|
| `TYPE=AUTO_CURSEFORGE` | — | Modpack-Verwaltung übernehmen |
| `CF_PAGE_URL` | `https://www.curseforge.com/minecraft/modpacks/reign-of-nether-rts` | das offizielle Modpack (aus `.env`: `REIGN_CF_PAGE_URL`) |
| `CF_API_KEY` | optional | eigener Key aus <https://console.curseforge.com/>; das Image bringt ab Java 17 einen eingebauten Key mit — nur setzen, falls der nicht reicht (dann `CF_API_KEY=${CF_API_KEY}` im Compose-Service ergänzen, `.env`: `CF_API_KEY`) |
| `MEMORY=6G` | 6 GB | Modpack-Pflicht: „set `MEMORY` to at least 4G" (itzg-Doku) |
| `USE_AIKAR_FLAGS=true` | ✅ | siehe oben |

**Manueller Fallback** (falls CurseForge-API zickt): `TYPE=FORGE`, `VERSION=1.20.1`,
Mod-JAR nach `data/minecraft-reign/mods/` legen
(Download z.B. von <https://www.curseforge.com/minecraft/mc-mods/reign-of-nether-rts-in-minecraft/files>).
Alle 4 Clients brauchen dieselbe Mod-Version.

**Achtung Reign of Nether:** Der Mod ist für PvP-RTS-Kämpfe ausgelegt — beide Teams brauchen
eigene Basen weit auseinander (große Map, `level-type` / Welt-Settings ggf. anpassen).

## Daten

- Welten & Config: `data/minecraft/` bzw. `data/minecraft-reign/` (jeweils `/data` im Container)
- Backup vor der Party: `data/minecraft/world/` kopieren reicht.

## Quellen

- itzg/docker-minecraft-server: <https://github.com/itzg/docker-minecraft-server>
- Auto-CurseForge-Doku: <https://docker-minecraft-server.readthedocs.io/en/latest/types-and-platforms/mod-platforms/auto-curseforge/>
- Aikar's Flags: <https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/> · <https://docs.papermc.io/paper/aikars-flags>
- Reign of Nether auf Modrinth: <https://modrinth.com/mod/reign-of-nether-rts/versions>
- Reign of Nether auf CurseForge: <https://www.curseforge.com/minecraft/mc-mods/reign-of-nether-rts-in-minecraft>
