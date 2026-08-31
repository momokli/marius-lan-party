# Control-UI als Container (optional — nativ reicht: node server.js)
# Basiert auf Node + Docker-CLI + Compose-Plugin (Alpine-Pakete).
# Der Container steuert den Host-Docker-Daemon über /var/run/docker.sock.
FROM node:22-alpine
RUN apk add --no-cache docker-cli docker-cli-compose
WORKDIR /app
COPY server.js package.json servers.json ./
COPY public ./public
ENV COMPOSE_DIR=/compose
EXPOSE 8080
CMD ["node", "server.js"]
