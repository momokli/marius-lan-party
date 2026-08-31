'use strict';

const REFRESH_MS = 5000;
let expandedLogs = null;

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

function statusClass(status) {
  return { running: 'ok', stopped: 'off', paused: 'warn', restarting: 'warn', error: 'err' }[status] || 'off';
}
function statusLabel(status) {
  return { running: '▶ läuft', stopped: '■ gestoppt', paused: '⏸ pausiert', restarting: '⟳ startet neu', error: '⚠ Fehler' }[status] || status;
}

async function api(path, opts) {
  const r = await fetch(path, opts);
  return r.json();
}

function card(srv) {
  const c = el('div', 'card');
  c.id = `card-${srv.id}`;

  const head = el('div', 'card-head');
  head.appendChild(el('span', 'emoji', srv.emoji));
  const title = el('div', 'title');
  title.appendChild(el('h2', '', srv.name));
  title.appendChild(el('p', 'desc', srv.description || ''));
  head.appendChild(title);

  const pill = el('span', `pill ${statusClass(srv.status)}`, statusLabel(srv.status));
  if (srv.error) pill.title = srv.error;
  head.appendChild(pill);
  c.appendChild(head);

  const meta = el('div', 'meta');
  if (srv.ports) meta.appendChild(el('span', 'tag', `🔌 ${srv.ports}`));
  if (srv.ram) meta.appendChild(el('span', 'tag', `🧠 ${srv.ram}`));
  if (srv.docs) meta.appendChild(el('a', 'tag link', `📄 ${srv.docs}`));
  c.appendChild(meta);

  const actions = el('div', 'actions');
  const btn = (label, cls, fn, disabled) => {
    const b = el('button', `btn ${cls}`, label);
    if (disabled) b.disabled = true;
    b.onclick = fn;
    actions.appendChild(b);
    return b;
  };
  const startBtn = btn('▶ Start', 'primary', () => doAction(srv, 'start', startBtn));
  const stopBtn = btn('■ Stop', 'danger', () => doAction(srv, 'stop', stopBtn));
  btn('⟳ Restart', 'ghost', () => doAction(srv, 'restart', startBtn));
  btn(srv.id === expandedLogs ? '▾ Logs aus' : '▸ Logs', 'ghost', () => toggleLogs(srv));
  c.appendChild(actions);

  const logBox = el('pre', 'logs');
  logBox.style.display = 'none';
  c.appendChild(logBox);
  return c;
}

async function doAction(srv, action, btn) {
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = '…';
  try {
    const r = await api(`/api/servers/${srv.id}/${action}`, { method: 'POST' });
    if (!r.ok && r.error) alert(`${srv.name}: ${r.error}`);
  } catch (e) {
    alert(`${srv.name}: ${e.message}`);
  } finally {
    btn.textContent = old;
    btn.disabled = false;
    refresh();
  }
}

async function toggleLogs(srv) {
  const logBox = document.querySelector(`#card-${srv.id} .logs`);
  if (expandedLogs === srv.id) {
    expandedLogs = null;
    logBox.style.display = 'none';
    refresh();
    return;
  }
  expandedLogs = srv.id;
  logBox.style.display = 'block';
  logBox.textContent = 'Lade Logs…';
  try {
    const r = await api(`/api/servers/${srv.id}/logs?lines=120`);
    logBox.textContent = r.logs || '(keine Logs)';
  } catch (e) {
    logBox.textContent = `Fehler: ${e.message}`;
  }
  refresh();
}

async function refresh() {
  try {
    const data = await api('/api/servers');
    const docker = $('#docker-status');
    if (data.docker && data.docker.ok) {
      docker.textContent = `🐳 Docker OK (Engine ${data.docker.version})`;
      docker.className = 'docker-status ok';
    } else {
      docker.textContent = '🐳 Docker nicht erreichbar — Server-Status unzuverlässig';
      docker.className = 'docker-status err';
    }

    const grid = $('#servers');
    grid.innerHTML = '';
    for (const srv of data.servers) {
      const c = card(srv);
      if (expandedLogs === srv.id) {
        const logBox = c.querySelector('.logs');
        logBox.style.display = 'block';
        const r = await api(`/api/servers/${srv.id}/logs?lines=120`);
        logBox.textContent = r.logs || '(keine Logs)';
      }
      grid.appendChild(c);
    }
    $('#last-update').textContent = `Stand: ${new Date().toLocaleTimeString('de-DE')}`;
  } catch (e) {
    $('#servers').innerHTML = '';
    $('#servers').appendChild(el('div', 'loading', `API-Fehler: ${e.message}`));
  }
}

$('#refresh').onclick = refresh;
refresh();
setInterval(refresh, REFRESH_MS);
