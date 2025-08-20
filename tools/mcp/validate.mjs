#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';

const ART = '.artifacts';
fs.mkdirSync(ART, { recursive: true });

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const pin = read('tools/mcp/version.json').pinned;

let latest = pin,
  drift = false;
try {
  const r = await fetch('https://model-context-protocol.io/CHANGELOG.json');
  if (r.ok) {
    const d = await r.json();
    if (Array.isArray(d) && d[0]?.date) {
      latest = d[0].date;
      drift = latest > pin;
    }
  }
} catch {}

const ajv = new Ajv({ strict: false, allErrors: true });
const schema = read('tools/mcp/schema/minimal.schema.json');
const validate = ajv.compile(schema);

const files = fs
  .readdirSync('tools/mcp/examples')
  .filter(f => f.endsWith('.mcp.json'));
const results = files.map(f => {
  const doc = read(`tools/mcp/examples/${f}`);
  const ok = validate(doc);
  return { file: f, valid: !!ok, errors: validate.errors ?? [] };
});

fs.writeFileSync(
  `${ART}/mcp-validate.json`,
  JSON.stringify(
    {
      pinned: pin,
      latestChecked: latest,
      versionDrift: drift,
      filesValidated: files.length,
      results,
    },
    null,
    2
  )
);

if (results.some(r => !r.valid)) {
  console.error('❌ MCP schema errors');
  process.exit(1);
}

if (drift) console.warn(`⚠️ MCP drift: pinned=${pin} latest=${latest}`);
console.log('✅ MCP validate OK');
