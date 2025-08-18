#!/usr/bin/env node

/**
 * DocCraft-AI Dependency Graph Generator
 *
 * This script generates a dependency graph visualization for the project.
 */

import { writeFileIfChanged, logStep } from "./_utils.mjs";
import madge from "madge";
import path from "path";

const OUT = "docs/dev/refs/dependency-graph.md";

// Ignore noisy / generated directories (keeps the graph stable)
const EXCLUDE = [
  /^dist\//,
  /^build\//,
  /^coverage\//,
  /^\.next\//,
  /^out\//,
  /^storybook-static\//,
  /^\.turbo\//,
  /^\.cache\//,
  /^\.vercel\//,
  /^node_modules\//
];

(async () => {
  try {
    logStep("Generating dependency graph (madge → mermaid, excluding build artifacts)...");
    const res = await madge(path.resolve("."), {
      fileExtensions: ["js","jsx","ts","tsx","mjs","cjs"],
      includeNpm: false,
      tsConfig: "tsconfig.json",
      detectiveOptions: { es6: { mixedImports: true } },
      excludeRegExp: EXCLUDE
    });

    const tree = await res.obj();

    const lines = ["```mermaid", "graph LR"];
    const limit = 200; // guardrail for huge repos
    let count = 0;

    for (const [from, tos] of Object.entries(tree)) {
      for (const to of tos) {
        lines.push(`  "${from}" --> "${to}"`);
        count++;
        if (count > limit) { lines.push("  %% truncated..."); break; }
      }
      if (count > limit) break;
    }
    lines.push("```", "");

    const content = lines.join("\n");
    const resWrite = await writeFileIfChanged(OUT, content);
    logStep(resWrite.changed ? `Updated ${OUT}` : `No changes to ${OUT}`);
    process.exit(0);
  } catch (err) {
    console.error(`[docs:ERROR] ${err?.stack || String(err)}`);
    process.exit(1);
  }
})();
