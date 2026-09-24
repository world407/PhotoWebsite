// Minimal CDP debugger: launch Edge headless, capture console + exceptions on localhost:5173
// Usage: node cdp-debug.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const TARGET_URL = 'http://localhost:5173/';
const PORT = 9229;

const userDataDir = mkdtempSync(join(tmpdir(), 'edge-cdp-'));
const edge = spawn(EDGE, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url);
  return res.json();
}

async function waitForDebugger() {
  for (let i = 0; i < 40; i++) {
    try {
      return await getJson(`http://127.0.0.1:${PORT}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error('CDP endpoint did not come up');
}

// Open a new tab
async function openTab() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
  return res.json();
}

let msgId = 0;
const pending = new Map();

function cdpSend(ws, method, params = {}) {
  const id = ++msgId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

async function main() {
  await waitForDebugger();
  const tab = await openTab();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  const events = [];
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const e = msg.params.exceptionDetails;
      const text = e.exception?.description || e.text || 'unknown';
      const line = e.lineNumber ?? -1;
      const url = e.url || '';
      events.push(`[EXCEPTION] ${text} (${url}:${line + 1})`);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params.type;
      const args = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
      events.push(`[CONSOLE.${type}] ${args}`);
    }
    if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      if (e.level === 'error' || e.level === 'warning') {
        events.push(`[LOG.${e.level}] ${e.text} ${e.url || ''}`);
      }
    }
    if (msg.method === 'Network.loadingFailed') {
      events.push(`[NETWORK FAILED] ${msg.params.errorText} ${msg.params.blockedReason || ''}`);
    }
  };

  await cdpSend(ws, 'Runtime.enable');
  await cdpSend(ws, 'Log.enable');
  await cdpSend(ws, 'Network.enable');
  await cdpSend(ws, 'Page.enable');

  await cdpSend(ws, 'Page.navigate', { url: TARGET_URL });
  await sleep(8000);

  // Optional screenshot: pass SCREENSHOT env var as target path
  if (process.env.SCREENSHOT) {
    const shot = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
    const { writeFileSync } = await import('node:fs');
    writeFileSync(process.env.SCREENSHOT, Buffer.from(shot.result.data, 'base64'));
    console.log(`[SCREENSHOT] saved to ${process.env.SCREENSHOT}`);
  }

  const result = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `JSON.stringify({
      rootHtml: document.getElementById('root') ? document.getElementById('root').innerHTML.slice(0, 300) : 'NO ROOT',
      bodyBg: getComputedStyle(document.body).backgroundColor,
      readyState: document.readyState,
      title: document.title,
      scripts: [...document.scripts].map(s => s.src).filter(Boolean)
    })`,
    returnByValue: true,
  });
  events.push(`[STATE] ${result.result?.result?.value ?? JSON.stringify(result)}`);

  console.log(events.join('\n'));
  edge.kill();
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  edge.kill();
  process.exit(1);
});
