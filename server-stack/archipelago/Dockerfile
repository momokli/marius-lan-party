# Archipelago Multiworld Server (github.com/ArchipelagoMW/Archipelago)
#
# Eigenes Image, weil das Projekt KEIN offizielles Docker-Image veröffentlicht
# (das Dockerfile im Repo startet nur den WebHost auf Port 80). Wir bauen den
# reinen MultiServer (Default-Port 38281) auf python:3.12-slim, Version gepinnt
# auf ein Release-Tag (Reproduzierbarkeit; aktuell 0.6.7).
#
# Kein Cython-Speedups-Build: NetUtils.py hat einen pure-Python-Fallback
# (try: from _speedups import ... except ImportError: ...) — für einen LAN-Server
# völlig ausreichend und spart Build-Komplexität.
FROM python:3.12-slim-bookworm

# git: ModuleUpdate installiert u.a. kivymd via git+https (requirements.txt)
# gcc/g++/libc6-dev: einige Requirements (z.B. bsdiff4) haben keinen Wheel für
# 3.12 und brauchen einen Source-Build — das offizielle Dockerfile installiert
# dieselben Pakete und purged sie nach dem Build wieder.
# libtk8.6: tkinter-Fallback (Headless ungenutzt, aber wie im offiziellen Image)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git gcc g++ libc6-dev libtk8.6 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Release-Tag pinnen (auch per --build-arg AP_VERSION=<tag> überschreibbar)
ARG AP_VERSION=0.6.7
RUN git clone --depth 1 --branch ${AP_VERSION} https://github.com/ArchipelagoMW/Archipelago.git . \
 && python ModuleUpdate.py -y \
 && rm -rf .git

# Build-Werkzeuge nicht im finalen Image behalten
RUN apt-get purge -y gcc g++ libc6-dev && apt-get autoremove -y

# Kein Download-/Update-Verhalten zur Laufzeit
ENV SKIP_REQUIREMENTS_UPDATE=true
ENV PYTHONUNBUFFERED=1

# Multiworld-Daten + Savegame liegen im Volume /app/data
VOLUME /app/data

# Healthcheck: TCP-Connect auf den WebSocket-Port
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import socket,sys; s=socket.create_connection(('127.0.0.1',38281),3); s.close()"

EXPOSE 38281

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
