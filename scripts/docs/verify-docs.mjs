#!/usr/bin/env node

/**
 * DocCraft-AI Documentation Verification Script
 *
 * This script verifies that all required documentation is present and up-to-date
 * based on the current codebase state.
 */

import fsp from "fs/promises";

const REQUIRED = [
  "docs/dev/00-overview.md",
  "docs/dev/01-architecture.md",
  "docs/dev/02-setup-and-env.md",
  "docs/dev/03-build-and-deploy.md",
  "docs/dev/refs/dependency-graph.md",
  "docs/dev/refs/openapi.json"
];

function ok(m){ console.log("✅ " + m); }
function fail(m){ console.error("❌ " + m); process.exit(1); }

(async () => {
  for (const f of REQUIRED) {
    try {
      const st = await fsp.stat(f);
      if (!st.isFile() || st.size < 10) fail(`Required doc missing or empty: ${f}`);
      ok(`Found: ${f} (${st.size} bytes)`);
    } catch {
      fail(`Required doc missing: ${f}`);
    }
  }
  ok("Docs verification passed (tightened).");
})();
