# 🌐 Archipelago — Multiworld-Randomizer-Server

**Arch:** ✅ läuft nativ auf Apple Silicon (Python/arm64, kein Rosetta nötig)
**Port:** `38281/tcp` (WebSocket — Clients verbinden sich hierauf)
**RAM:** ~0,5–1 GB (Server ist leichtgewichtig)
**Projekt:** <https://archipelago.gg> · Repo: <https://github.com/ArchipelagoMW/Archipelago> · Doku: <https://docs.archipelago.gg>

**Was ist das?** Archipelago vernetzt **verschiedene Spiele in einer „Multiworld"**: Items, die du
in Spiel A findest, können in Spiel B einem anderen Spieler helfen. Jeder Spieler hat eine eigene
„World" (sein Spiel), alle hängen am selben Room-Server. Perfekt für eine 4-Spieler-LAN:
z.B. 2× Factorio + 1× Satisfactory + 1× Overcooked 2 im selben Room.

## Docker-Image (eigenes, im Repo)

Das Archipelago-Projekt veröffentlicht **kein offizielles Docker-Image** — das `Dockerfile` im
Projekt-Repo startet nur den WebHost (Port 80). Deshalb bauen wir ein eigenes, reduziertes Image
(`server-stack/archipelago/`): `python:3.12-slim` + gepinnter Release-Tag (**0.6.7**, Stand 04/2026),
Entrypoint = reiner `MultiServer.py` (headless, ohne WebHost).
Die Architektur folgt dem offiziellen Dockerfile (<https://github.com/ArchipelagoMW/Archipelago/blob/main/Dockerfile>);
die Cython-Speedups lassen wir weg — `NetUtils.py` hat einen pure-Python-Fallback
(im Repo verifiziert), für einen LAN-Server irrelevant.

```bash
docker compose -f docker-compose.archipelago.yml up -d     # baut beim ersten Mal das Image
```

## Ablauf für die Party (4 Schritte)

### 1. YAML pro Spieler erstellen (VOR der Party, Internet nötig)

Jeder Spieler braucht eine eigene YAML (Spielername + Spiel + Optionen):

1. <https://archipelago.gg/games> → Spiel wählen (z.B. Factorio) → **Player Options**
2. Optionen setzen, ganz unten „Export Settings" → `.yaml` herunterladen
3. Alle YAMLs in `server-stack/data/archipelago/yamls/` legen (Namen sprechend, z.B. `momo.yaml`)
4. YAMLs testen: <https://archipelago.gg/check> (Validator)

### 2. Multiworld generieren (VOR der Party!)

**Wegen LTE-Daten-Cap: zuhause generieren, nicht bei der Party!** Zwei Wege:

- **WebHost (einfach, empfohlen):** <https://archipelago.gg/start> → alle YAMLs hochladen
  (optional `players.yaml`/Meta) → „Generate Game" → `.zip` herunterladen
  (heißt `AP_<seed>_…zip`). Room-Passwort später am Server setzen.
- **Lokal im Container (ohne WebHost):**
  ```bash
  cd server-stack
  docker compose -f docker-compose.archipelago.yml run --rm --entrypoint python archipelago \
    Generate.py --player_files_path /app/data/yamls --outputpath /app/data
  ```
  (erzeugt die Multidata + optional Spoiler-Log direkt in `data/archipelago/`)

**Danach:** die erzeugte `.zip` nach `data/archipelago/multiworld.zip` kopieren
(`cp data/archipelago/AP_*.zip data/archipelago/multiworld.zip`).

### 3. Room-Server starten

```bash
cd server-stack
cp .env.example .env        # AP_PASSWORD setzen (Room-Passwort für die Clients!)
docker compose -f docker-compose.archipelago.yml up -d
```

- Fehlt `multiworld.zip`, beendet sich der Container mit einer klaren Fehlermeldung
  (im Control-Dashboard unter „Logs" sichtbar) — nach dem Ablegen einfach neu starten.
- **Passwort:** `AP_PASSWORD` in `.env` = Room-Passwort, das jeder Client beim Verbinden angibt
  (Flag `--password`; leer = offen). `AP_SERVER_PASSWORD` = Admin-Passwort für die
  Server-Konsole (`/server_password`).
- **Port:** `AP_PORT` (Default 38281).

### 4. Clients pro Spiel installieren & verbinden

Verbindungsdaten für alle: `Server: <mac-ip>` · `Port: 38281` · `Passwort: <AP_PASSWORD>`

| Spiel | AP-Support | Client-Installation | Verbinden |
|---|---|---|---|
| 🏭 **Factorio** | ✅ | **Mod** „Archipelago" (die generierte `AP_*.zip`-Mod pro Seed) in den `mods`-Ordner (Server **und** Client) + **Archipelago-Client** (Middleware, Teil der AP-Installation) + standalone Factorio-Server (kostenloser Download auf factorio.com, `host.yaml` → `factorio_options.executable`). **Space Age im `mods-list.json` des Servers deaktivieren!** | Im AP-Client `/connect <mac-ip>:38281`; im Spiel „Connect to address" → `localhost` (der Client proxied) |
| 🏗️ **Satisfactory** | ✅ | **Satisfactory Mod Manager** (<https://smm.ficsit.app>) + Mod **„Archipelago Randomizer"** (<https://ficsit.app/mod/Archipelago>). **Kein separater AP-Client nötig!** Alle Spieler brauchen dieselben Mods (Mod-Manager-Profil). | Host gibt die AP-Server-Daten im Mod-Menü an; andere joinen die Host-Session |
| 🍳 **Overcooked 2** | ✅ | **OC2-Modding Client** (<https://github.com/toasterparty/oc2-modding/releases>) — BepInEx/Harmony-Injection, **nur Windows** | In-Game-Login beim Titel: Server-Adresse + Benutzername + Room-Passwort |
| ⛏️ Minecraft | ❌ **Support entfernt** | — | — |
| 🧟 L4D2 | ❌ **Support entfernt** (0 Treffer im Repo) | — | — |

**Pool-Abgleich (GAMES.md):** Von allen Pool-Spielen haben nur **Factorio, Satisfactory und
Overcooked 2** aktuell AP-Support. **Kein** AP-Support (Stand 09/2026): Minecraft (aus AP
entfernt), L4D2 (entfernt), CS2, Deep Rock Galactic, Warcraft III, Rocket League, alle anderen.
Quelle: `worlds/`-Verzeichnis des Archipelago-Repos (definitive Liste):
<https://github.com/ArchipelagoMW/Archipelago/tree/main/worlds>

## Save-Export & Fortsetzen

- Der Server speichert **automatisch** (periodisch + bei Stop) als
  `data/archipelago/multiworld.apsave` (wird neben die Multidata geschrieben,
  `MultiServer.py`-Logik: `init_save()` → `<multidata>.apsave`).
- **Export:** `multiworld.apsave` kopieren (= kompletter Room-Zustand).
- **Fortsetzen:** Server einfach wieder starten — er lädt das Savegame automatisch.
  (Erst das Savegame entfernen, wenn man einen NEUEN Lauf starten will!)

## Tipps für die LAN-Party

- **1 Room = 1 Multiworld.** Alle 4 Spieler in einen Room; jeder hat seine eigene World.
- Generierung **zuhause** machen (WebHost braucht Internet; LTE-Cap!).
- Bots/Ersatzspieler: YAMLs können auch ohne echten Spieler generiert werden — nicht nötig bei 4 Leuten.
- Hint-System: im Client `!hint <item>` — ideal für die Party (gemeinsames Raten!).
- WebHost lokal (optional): `python WebHost.py` im AP-Container/auf dem Mac — für die Party
  nicht nötig, da Generierung vorher passiert.

## Quellen

- Archipelago-Projekt: <https://github.com/ArchipelagoMW/Archipelago> · Releases: <https://github.com/ArchipelagoMW/Archipelago/releases> (0.6.7, 04/2026)
- Offizielles Dockerfile (Referenz): <https://github.com/ArchipelagoMW/Archipelago/blob/main/Dockerfile>
- Setup-Guides im Repo (verifiziert): `worlds/factorio/docs/setup_en.md`, `worlds/satisfactory/docs/setup_en.md`, `worlds/overcooked2/docs/setup_en.md`
- Factorio-AP: Mod aus der Room-Generierung (`AP_<seed>…zip`), Space-Age-Off-Hinweis, `/connect`-Flow — siehe Factorio-Setup-Guide (oben)
- Satisfactory-AP: Mod-Manager <https://smm.ficsit.app/> + Mod <https://ficsit.app/mod/Archipelago>
- Overcooked-2-AP: <https://github.com/toasterparty/oc2-modding>
- Supported-Games-Liste (worlds/): <https://github.com/ArchipelagoMW/Archipelago/tree/main/worlds>
