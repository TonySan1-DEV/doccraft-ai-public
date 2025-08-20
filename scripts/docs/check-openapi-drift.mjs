#!/usr/bin/env node
/**
 * API Contract Drift Checker
 * 
 * Compares Express routes from /server/** with OpenAPI spec to detect mismatches.
 * Generates deterministic reports and supports allowlisting for intentional drift.
 */
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as utils from './_utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const SERVER_DIR = path.resolve(ROOT, 'server');
const REFS_DIR = path.resolve(ROOT, 'docs/dev/refs');
const OPENAPI_JSON = path.resolve(REFS_DIR, 'openapi.json');
const DRIFT_JSON = path.resolve(REFS_DIR, 'api-drift.json');
const ALLOWLIST_JSON = path.resolve(REFS_DIR, 'api-drift-allow.json');
const API_PAGE = path.resolve(ROOT, 'docs/dev/05-api.md');

const POSIX = p => p.split(path.sep).join('/'); // stable for git paths, Windows-safe

// Reuse route collection logic from generate-openapi-from-express.mjs
const routeRegexes = [
  // router.METHOD("path"
  /(?:router|app)\.(get|post|put|delete|patch|options|head)\s*\(\s*([`'"])(.*?)\2/gi,
  // router[method]("path"
  /(?:router|app)\s*\[\s*([`'"])(get|post|put|delete|patch|options|head)\1\s*\]\s*\(\s*([`'"])(.*?)\3/gi,
];

function normalizePath(p) {
  // Ensure OpenAPI-style path params: :id -> {id}
  return p.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

async function collectServerFiles() {
  try {
    await fsp.access(SERVER_DIR, fs.constants.F_OK);
    utils.logStep(`server dir exists: ${SERVER_DIR}`);
  } catch {
    utils.logStep(`server dir not found: ${SERVER_DIR}`);
    return [];
  }
  
  const files = [];
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        // skip build artifacts by name
        if (['dist', 'build', 'node_modules', 'coverage'].includes(e.name))
          continue;
        await walk(full);
      } else if (/\.(ts|js|mjs|cjs)$/.test(e.name)) {
        files.push(full);
      }
    }
  }
  await walk(SERVER_DIR);
  utils.logStep(`total server files found: ${files.length}`);
  return files;
}

async function extractRoutesFromCode(files) {
  const codeRoutes = new Map(); // path -> Set of methods
  
  for (const abs of files) {
    const content = await fsp.readFile(abs, 'utf8');
    
    // Split content into lines to check for comments
    const lines = content.split('\n');
    
    for (const rx of routeRegexes) {
      rx.lastIndex = 0;
      let m;
      while ((m = rx.exec(content))) {
        // Find the line number where this match occurred
        const matchLine = content.substring(0, m.index).split('\n').length - 1;
        const lineContent = lines[matchLine] || '';
        
        // Skip if the line starts with // or contains only whitespace and //
        if (lineContent.trim().startsWith('//')) {
          continue;
        }
        
        let method, rawPath;
        if (m.length === 4) {
          // router.get("path"
          method = m[1].toLowerCase();
          rawPath = m[3];
        } else if (m.length === 5) {
          // router['get']("path"
          method = m[2].toLowerCase();
          rawPath = m[4];
        } else {
          continue;
        }
        
        if (!rawPath || !/^[./]/.test(rawPath)) {
          // ignore variables/concats for deterministic output
          continue;
        }
        
        const pth = normalizePath(rawPath);
        if (!codeRoutes.has(pth)) {
          codeRoutes.set(pth, new Set());
        }
        codeRoutes.get(pth).add(method);
      }
    }
  }
  
  return codeRoutes;
}

async function loadOpenAPISpec() {
  try {
    const content = await fsp.readFile(OPENAPI_JSON, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    utils.logStep(`OpenAPI spec not found: ${OPENAPI_JSON}`);
    return null;
  }
}

async function loadAllowlist() {
  try {
    const content = await fsp.readFile(ALLOWLIST_JSON, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Allowlist is optional
    return {
      missingInOpenAPI: [],
      missingInCode: [],
      methodDrift: []
    };
  }
}

function compareRoutes(codeRoutes, openapiSpec, allowlist) {
  const specPaths = openapiSpec?.paths || {};
  
  // Convert code routes to comparable format
  const codeRoutesArray = Array.from(codeRoutes.entries()).map(([path, methods]) => [
    path,
    Array.from(methods).sort()
  ]);
  
  // Convert spec paths to comparable format
  const specRoutesArray = Object.entries(specPaths).map(([path, methods]) => [
    path,
    Object.keys(methods).sort()
  ]);
  
  // Sort both arrays deterministically
  codeRoutesArray.sort((a, b) => a[0].localeCompare(b[0]));
  specRoutesArray.sort((a, b) => a[0].localeCompare(b[0]));
  
  // Find missing routes
  const missingInOpenAPI = [];
  const missingInCode = [];
  const methodDrift = [];
  const paramShapeNotes = [];
  
  // Check for routes in code but missing in OpenAPI
  for (const [path, methods] of codeRoutesArray) {
    if (!specPaths[path]) {
      missingInOpenAPI.push([methods[0], path]); // Use first method for display
    } else {
      // Check for method drift
      const specMethods = Object.keys(specPaths[path]).sort();
      if (JSON.stringify(methods) !== JSON.stringify(specMethods)) {
        methodDrift.push([path, methods, specMethods]);
      }
    }
  }
  
  // Check for routes in OpenAPI but missing in code
  for (const [path, methods] of specRoutesArray) {
    if (!codeRoutes.has(path)) {
      missingInCode.push([methods[0], path]); // Use first method for display
    }
  }
  
  // Check for param shape mismatches (best effort)
  for (const [path, methods] of codeRoutesArray) {
    if (specPaths[path]) {
      // Look for suspicious regex patterns or param mismatches
      const hasComplexParams = /[{}].*[{}]/.test(path) || /\/[^/]*\{[^}]*\}[^/]*\//.test(path);
      if (hasComplexParams) {
        paramShapeNotes.push([path, 'complex parameter structure detected']);
      }
    }
  }
  
  // Apply allowlist filtering
  const filterAllowlist = (items, allowlistKey) => {
    const allowed = new Set(allowlist[allowlistKey].map(item => JSON.stringify(item)));
    return items.filter(item => {
      // Try exact match first
      if (allowed.has(JSON.stringify(item))) return false;
      
      // Try case-insensitive match for method
      const normalizedItem = [item[0].toLowerCase(), item[1]];
      const normalizedAllowed = allowlist[allowlistKey].map(a => [a[0].toLowerCase(), a[1]]);
      const normalizedAllowedSet = new Set(normalizedAllowed.map(a => JSON.stringify(a)));
      
      return !normalizedAllowedSet.has(JSON.stringify(normalizedItem));
    });
  };
  
  const filteredMissingInOpenAPI = filterAllowlist(missingInOpenAPI, 'missingInOpenAPI');
  const filteredMissingInCode = filterAllowlist(missingInCode, 'missingInCode');
  const filteredMethodDrift = filterAllowlist(methodDrift, 'methodDrift');
  
  return {
    missingInOpenAPI: filteredMissingInOpenAPI,
    missingInCode: filteredMissingInCode,
    methodDrift: filteredMethodDrift,
    paramShapeNotes
  };
}

async function generateDriftReport(codeRoutes, driftResults) {
  const summary = {
    codeRoutes: codeRoutes.size,
    specRoutes: 0,
    missingInOpenAPI: driftResults.missingInOpenAPI.length,
    missingInCode: driftResults.missingInCode.length,
    methodDrift: driftResults.methodDrift.length,
    paramShapeNotes: driftResults.paramShapeNotes.length
  };
  
  // Count spec routes
  try {
    const openapiContent = await fsp.readFile(OPENAPI_JSON, 'utf8');
    const openapi = JSON.parse(openapiContent);
    summary.specRoutes = Object.keys(openapi.paths || {}).length;
  } catch (error) {
    summary.specRoutes = 0;
  }
  
  const report = {
    summary,
    details: {
      missingInOpenAPI: driftResults.missingInOpenAPI.sort((a, b) => {
        const methodCompare = a[0].localeCompare(b[0]);
        return methodCompare !== 0 ? methodCompare : a[1].localeCompare(b[1]);
      }),
      missingInCode: driftResults.missingInCode.sort((a, b) => {
        const methodCompare = a[0].localeCompare(b[0]);
        return methodCompare !== 0 ? methodCompare : a[1].localeCompare(b[1]);
      }),
      methodDrift: driftResults.methodDrift.sort((a, b) => a[0].localeCompare(b[0])),
      paramShapeNotes: driftResults.paramShapeNotes.sort((a, b) => a[0].localeCompare(b[0]))
    },
    sources: {
      serverGlobs: ['server/**/*.ts', 'server/**/*.js'],
      openapi: 'docs/dev/refs/openapi.json'
    }
  };
  
  return report;
}

async function updateAPIPage(report) {
  try {
    const content = await fsp.readFile(API_PAGE, 'utf8');
    
    const driftBlockStart = '<!-- AUTO-GEN:API-DRIFT-START -->';
    const driftBlockEnd = '<!-- AUTO-GEN:API-DRIFT-END -->';
    
    const startIdx = content.indexOf(driftBlockStart);
    const endIdx = content.indexOf(driftBlockEnd);
    
    if (startIdx === -1 || endIdx === -1) {
      utils.logStep('API drift block markers not found in 05-api.md');
      return;
    }
    
    const driftContent = `<!-- AUTO-GEN:API-DRIFT-START -->

### API Contract Drift (auto-generated)

- Code routes: **${report.summary.codeRoutes}**
- Spec routes: **${report.summary.specRoutes}**
- Missing in OpenAPI: **${report.summary.missingInOpenAPI}**
- Missing in Code: **${report.summary.missingInCode}**
- Method drift: **${report.summary.methodDrift}**

**Samples (up to 10 each):**
- Missing in OpenAPI:
${report.details.missingInOpenAPI.slice(0, 10).map(([method, path]) => `  - \`${method.toUpperCase()} ${path}\``).join('\n') || '  - None'}
- Missing in Code:
${report.details.missingInCode.slice(0, 10).map(([method, path]) => `  - \`${method.toUpperCase()} ${path}\``).join('\n') || '  - None'}
- Method drift:
${report.details.methodDrift.slice(0, 10).map(([path, codeMethods, specMethods]) => `  - \`${path}\` code=[${codeMethods.join(',')}] spec=[${specMethods.join(',')}]`).join('\n') || '  - None'}

<!-- AUTO-GEN:API-DRIFT-END -->`;
    
    const newContent = content.slice(0, startIdx) + driftContent + content.slice(endIdx + driftBlockEnd.length);
    
    const { changed } = await utils.writeFileIfChanged(API_PAGE, newContent);
    if (changed) {
      utils.logStep('Updated 05-api.md with drift information');
    }
  } catch (error) {
    utils.logStep(`Failed to update API page: ${error.message}`);
  }
}

async function main() {
  utils.logStep('API drift check started');
  
  // Check if server directory exists
  if (!fs.existsSync(SERVER_DIR)) {
    utils.logStep('Server directory not found, skipping drift check');
    process.exit(0);
  }
  
  // Check if OpenAPI spec exists
  if (!fs.existsSync(OPENAPI_JSON)) {
    utils.logStep('OpenAPI spec not found, skipping drift check');
    process.exit(0);
  }
  
  try {
    // Collect routes from code
    const serverFiles = await collectServerFiles();
    if (serverFiles.length === 0) {
      utils.logStep('No server files found, skipping drift check');
      process.exit(0);
    }
    
    const codeRoutes = await extractRoutesFromCode(serverFiles);
    
    // Load OpenAPI spec and allowlist
    const openapiSpec = await loadOpenAPISpec();
    const allowlist = await loadAllowlist();
    
    if (!openapiSpec) {
      utils.logStep('Could not load OpenAPI spec, skipping drift check');
      process.exit(0);
    }
    
    // Compare and generate report
    const driftResults = compareRoutes(codeRoutes, openapiSpec, allowlist);
    const report = await generateDriftReport(codeRoutes, driftResults);
    
    // Write drift report
    const driftJson = JSON.stringify(report, null, 2);
    const { changed } = await utils.writeFileIfChanged(DRIFT_JSON, driftJson);
    if (changed) {
      utils.logStep('Generated api-drift.json');
    }
    
    // Update API page
    await updateAPIPage(report);
    
    // Log summary
    utils.logStep(`Drift check complete:`);
    utils.logStep(`  Code routes: ${report.summary.codeRoutes}`);
    utils.logStep(`  Spec routes: ${report.summary.specRoutes}`);
    utils.logStep(`  Missing in OpenAPI: ${report.summary.missingInOpenAPI}`);
    utils.logStep(`  Missing in Code: ${report.summary.missingInCode}`);
    utils.logStep(`  Method drift: ${report.summary.methodDrift}`);
    
    if (report.summary.missingInOpenAPI > 0 || 
        report.summary.missingInCode > 0 || 
        report.summary.methodDrift > 0) {
      utils.logStep('⚠️  API drift detected - check api-drift.json for details');
    } else {
      utils.logStep('✅ No API drift detected');
    }
    
  } catch (error) {
    console.error('[api-drift] Error:', error.message);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('[api-drift] Fatal error:', e?.message || e);
  process.exit(1);
});
