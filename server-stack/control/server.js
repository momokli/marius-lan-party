#!/usr/bin/env node
/**
 * LAN-Party Server Control — Zero-Dependency Node.js API + Static Frontend
 *
 * Steuert die Docker-Compose-Game-Server im server-stack über das Docker-CLI.
 * Keine npm-Abhängigkeiten:  node server.js   (Node 18+)
 *
 * Env:
 *   HOST           (default 0.0.0.0)
 *   PORT           (default 8080)
 *   COMPOSE_DIR    (default: server-stack/ — Ordner mit den docker-compose.*.yml)
 *   SERVERS_JSON   (default: ./servers.json)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);
const COMPOSE_DIR = path.resolve(process.env.COMPOSE_DIR || path.join(__dirname, '..'));
const SERVERS_JSON = process.env.SERVERS_JSON || path.join(__dirname, 'servers.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

let registry;
try {
  registry = JSON.parse(fs.readFileSync(SERVERS_JSON, 'utf8')).servers;
} catch (e) {
  console.error(`servers.json nicht lesbar (${SERVERS_JSON}): ${e.message}`);
  registry = [];
}

// ── Docker-Compose-Helfer ────────────────────────────────────────────────
function runCompose(server, args, timeoutMs = 300000) {
  return new Promise((resolve) => {
    const composeFile = path.join(COMPOSE_DIR, server.composeFile);
    const fullArgs = ['compose', '-f', composeFile, ...args];
    // Service gezielt ansteuern, wenn die Compose-Datei mehrere Server enthält
    // (docker compose up -d <service> / ps --format json <service> / …)
    if (server.service) fullArgs.push(server.service);

    execFile('docker', fullArgs, { cwd: COMPOSE_DIR, timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => {
        const out = (stdout || '').trim();
        const errOut = (err && err.stderr ? err.stderr : stderr || '').trim();
        resolve({ ok: !err, code: err ? err.code : 0, stdout: out, stderr: errOut });
      });
  });
}

async function dockerAvailable() {
  return new Promise((resolve) => {
    execFile('docker', ['version', '--format', '{{.Server.Version}}'], { timeout: 10000 },
      (err, stdout) => resolve({ ok: !err, version: err ? null : stdout.trim() }));
  });
}

async function serverStatus(server) {
  const r = await runCompose(server, ['ps', '--format', 'json'], 30000);
  if (!r.ok) {
    if (r.code === 'ENOENT') return { status: 'error', error: 'Docker-CLI nicht gefunden' };
    return { status: 'error', error: r.stderr || r.stdout || 'unbekannter Fehler' };
  }
  let entries = [];
  try { entries = JSON.parse(r.stdout); } catch (e) { /* leere Ausgabe = nie gestartet */ }
  if (!Array.isArray(entries)) entries = entries ? [entries] : [];

  if (entries.length === 0) return { status: 'stopped' };
  const states = entries.map((e) => (e.State || '').toLowerCase());
  if (states.some((s) => s === 'running')) return { status: 'running' };
  if (states.some((s) => s === 'paused')) return { status: 'paused' };
  if (states.some((s) => s === 'restarting')) return { status: 'restarting' };
  return { status: 'stopped' };
}

async function collectServers() {
  const docker = await dockerAvailable();
  const servers = [];
  for (const s of registry) {
    const st = await serverStatus(s);
    servers.push({ ...s, status: st.status, error: st.error || null });
  }
  return { docker, servers };
}

// ── HTTP-Handler ─────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function sendText(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(text);
}

function serveStatic(res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== PUBLIC_DIR) {
    return sendText(res, 403, 'Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) return sendText(res, 404, 'Not found');
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

function findServer(id) {
  return registry.find((s) => s.id === id);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => resolve(body));
    req.on('error', () => resolve(''));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);

  try {
    // API
    if (parts[0] === 'api') {
      if (req.method === 'GET' && parts.length === 1) return sendJson(res, 200, { name: 'lan-party-server-control', endpoints: ['/api/servers', '/api/servers/:id/start|stop|restart|logs'] });

      if (req.method === 'GET' && parts[1] === 'servers' && parts.length === 2) {
        return sendJson(res, 200, await collectServers());
      }

      if (parts.length === 4 && parts[1] === 'servers') {
        const srv = findServer(parts[2]);
        if (!srv) return sendJson(res, 404, { error: 'unbekannter Server' });
        const action = parts[3];

        if (req.method === 'GET' && action === 'logs') {
          const lines = Math.min(parseInt(url.searchParams.get('lines') || '100', 10) || 100, 1000);
          const r = await runCompose(srv, ['logs', '--tail', String(lines), '--no-color', '--timestamps'], 30000);
          if (!r.ok) return sendJson(res, 500, { ok: false, error: r.stderr || r.stdout || 'logs fehlgeschlagen' });
          return sendJson(res, 200, { ok: true, logs: r.stdout || '(keine Logs)' });
        }

        if (req.method === 'POST' && ['start', 'stop', 'restart'].includes(action)) {
          const args = action === 'start' ? ['up', '-d'] : [action];
          const r = await runCompose(srv, args, 600000);
          return sendJson(res, r.ok ? 200 : 500, { ok: r.ok, action, error: r.ok ? null : (r.stderr || r.stdout || 'docker compose fehlgeschlagen') });
        }
        return sendJson(res, 405, { error: 'Methode nicht erlaubt' });
      }
      return sendJson(res, 404, { error: 'unbekannter API-Pfad' });
    }

    // Statisches Frontend
    if (req.method === 'GET') return serveStatic(res, url.pathname);
    return sendText(res, 405, 'Method Not Allowed');
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🎮 LAN-Party Server Control läuft auf http://${HOST}:${PORT}`);
  console.log(`   Compose-Dir: ${COMPOSE_DIR} | Registry: ${SERVERS_JSON}`);
});
