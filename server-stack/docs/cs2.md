# 🔫 Counter-Strike 2 — Best-in-Slot-Settings

**Arch:** ⚠️ **nur x86_64** — Valve liefert keinen ARM-Build; auf Apple Silicon nur via
Rosetta-Emulation (`platform: linux/amd64`). Machbar, aber **nicht offiziell unterstützt**
(SteamCMD-Quirks möglich, siehe [apple-silicon.md](apple-silicon.md)).
**Image:** `joedwards32/cs2` (de-facto-Standard für CS2-Docker: <https://github.com/joedwards32/CS2>)
**Anforderungen (Image-README):** min. 2 CPUs, 2 GiB RAM, **60 GB Disk** (Task: ~40 GB; mit Updates eher 60 GB)
**Ports:** `27015/tcp` (Game + RCON) + `27015/udp` (Game); optional `27005/udp` (Client),
`27020/udp` (SourceTV), `27036/tcp` (Remote Play) — für LAN nur 27015 nötig
**RAM für 10–32 Spieler:** 4 vCPU / 8 GB (Quelle: <https://bakir.dev/blog/cs2-dedicated-server-2026>)
**Quellen:** <https://developer.valvesoftware.com/wiki/Counter-Strike_2/Dedicated_Servers>
(Valve-Wiki, ggf. Bot-Schutz) · <https://github.com/joedwards32/CS2> · <https://monitoringcs2.com/en/guides>

## GSLT-Token (Game Server Login Token)

1. Mit Steam-Account einloggen: **<https://steamcommunity.com/dev/managegameservers>**
2. App auswählen: **Counter-Strike 2 (730)** → Token erzeugen (z.B. „lan-party" als Memo).
3. Token in `server-stack/.env` als `CS2_GSLT_TOKEN=…` eintragen.
4. Das Image setzt ihn automatisch als `SRCDS_TOKEN` (→ `sv_setsteamaccount`).

**LAN-Hinweis:** Mit `CS2_LAN=1` (sv_lan 1) ist der Token **nicht zwingend nötig** — der Server
erscheint dann aber nur im LAN-Tab und ohne VAC-Schutz. Token trotzdem setzen = sauber + Update-Sicherheit.

## Best-in-Slot-Settings (Compose-Env)

| Env | Wert | Begründung |
|---|---|---|
| `CS2_LAN=1` | LAN-Modus | kein Public-Lister, keine Internet-Spieler |
| `CS2_GAMEALIAS=competitive` | game_type 0 / game_mode 1 | 5v5, Economy-Rounds — Party-Standard; Alternativen: `casual`, `deathmatch`, `wingman` |
| `CS2_MAXPLAYERS=10` | 10 | Competitive hat fix 10 Slots (4 Leute + Bots) |
| `CS2_STARTMAP=de_inferno` | — | Start-Map; Maps werden mit `CS2_MAPGROUP` gepoolt (`mg_active`) |
| `CS2_BOT_QUOTA=3` / `CS2_BOT_DIFFICULTY=1` | Bots | zum Warmspielen, bis alle da sind |
| `CS2_PW` | leer oder Party-PW | leer = offen (LAN) |
| `CS2_RCONPW` | setzen! | RCON-Passwort für Admins |
| `CS2_PORT=27015` | — | Standard |

**Tickrate:** CS2 nutzt **Sub-Tick** — der Server läuft fix auf 64 Tick; `-tickrate 128` (CS:GO-Legende)
tut **nichts** und wird ignoriert. Kein Setting nötig.
(Quelle: <https://monitoringcs2.com/en/guides> — „attempts to set tickrate 128 … do nothing")

## Eigene Config (server.cfg)

Das Image unterstützt `CS2_CFG_URL` (Tar/GZ/Zip mit Configs, z.B. `server.cfg`, `autoexec.cfg`)
oder den Mount `./data/cs2/game/csgo/cfg/` für Handarbeit
(Details: <https://github.com/joedwards32/CS2> → „Configuration").

## Betrieb

- **Erster Start = 40–60 GB Download** → zuhause vorladen (siehe [apple-silicon.md](apple-silicon.md))!
- Updates automatisch bei Container-Neustart (Image lädt bei jedem Start neu).
- Fehler unter Rosetta: `Unable to determine CPU Frequency` → `CPU_MHZ`-Env setzen
  (Quelle: <https://github.com/joedwards32/CS2/issues/63>).
- **Fallback bei der Party:** Wenn der Mac-Server zickt → CS2 von einem Spieler-PC hosten
  (Workshop-Karte oder normaler Host, GAMES.md: „Community-Server oder Host").
