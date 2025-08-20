#!/usr/bin/env node
import assert from 'node:assert/strict';

// Required env: RAILWAY_BASE_URL (e.g., https://your-app.up.railway.app)
const BASE = process.env.RAILWAY_BASE_URL;
if (!BASE) {
  console.error(
    '❌ Set RAILWAY_BASE_URL (e.g., https://your-app.up.railway.app)'
  );
  process.exit(2);
}

async function req(path, init = {}) {
  const url = `${BASE}${path}`;
  const r = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  const txt = await r.text();
  let json;
  try {
    json = JSON.parse(txt);
  } catch {
    json = { raw: txt };
  }
  return { status: r.status, json, url };
}

const ok = m => console.log('✅ ' + m);
const fail = (m, extra) => {
  console.error('❌ ' + m);
  if (extra) console.error(extra);
  process.exit(1);
};

(async () => {
  // 1) /api/health
  const h = await req('/api/health');
  if (h.status !== 200) fail(`Health failed (${h.status}) @ ${h.url}`, h.json);
  ok('health 200');

  // 2) /api/version (expect a version field in JSON)
  const v = await req('/api/version');
  if (v.status !== 200 || !v.json?.version)
    fail(`Version failed (${v.status})`, v.json);
  ok(`version ${v.json.version}`);

  // 3) /api/ai/analyze minimal smoke
  const a = await req('/api/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'ping', mode: 'smoke' }),
  });
  if (a.status !== 200 || !(a.json.result || a.json.summary)) {
    fail(`AI analyze failed (${a.status})`, a.json);
  }
  ok('ai analyze ok');

  console.log('🎉 Railway smoke passed');
})();
