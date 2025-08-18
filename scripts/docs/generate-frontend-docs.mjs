#!/usr/bin/env node

/**
 * DocCraft-AI Frontend Documentation Generator
 * 
 * This script generates frontend documentation including route maps and component indexes
 * to keep the developer guide up-to-date.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOCS_DIR = join(__dirname, '../../docs/dev');
const REFS_DIR = join(__dirname, '../../docs/dev/refs');
const FRONTEND_DOC = join(DOCS_DIR, '04-frontend.md');

// Frontend directories to scan
const FRONTEND_DIRS = [
  'src',
  'components',
  'pages',
  'modules'
];

/**
 * Scan for React components in the codebase
 */
function scanReactComponents() {
  const components = [];
  
  for (const dir of FRONTEND_DIRS) {
    const fullPath = join(process.cwd(), dir);
    if (existsSync(fullPath)) {
      scanDirectory(fullPath, dir, components);
    }
  }
  
  return components;
}

/**
 * Recursively scan directory for React components
 */
function scanDirectory(dirPath, relativePath, components) {
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath, join(relativePath, item), components);
        }
      } else if (isReactFile(item)) {
        const component = analyzeReactFile(fullPath, relativePath, item);
        if (component) {
          components.push(component);
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not scan directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Check if file is a React component file
 */
function isReactFile(filename) {
  const ext = extname(filename);
  return ['.tsx', '.jsx', '.ts', '.js'].includes(ext);
}

/**
 * Analyze a React component file
 */
function analyzeReactFile(filePath, relativePath, filename) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Check if it's actually a React component
    if (!isReactComponent(content)) {
      return null;
    }
    
    const componentName = extractComponentName(content, filename);
    const props = extractComponentProps(content);
    const description = extractDescription(content);
    
    return {
      name: componentName,
      file: join(relativePath, filename),
      props,
      description,
      type: determineComponentType(content),
      exports: extractExports(content)
    };
  } catch (error) {
    console.log(`⚠️  Warning: Could not analyze file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Check if file contains a React component
 */
function isReactComponent(content) {
  const reactPatterns = [
    /import\s+React/,
    /from\s+['"]react['"]/,
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=\s*\(/,
    /class\s+\w+\s+extends\s+React\.Component/,
    /export\s+default\s+function/,
    /export\s+default\s+const/
  ];
  
  return reactPatterns.some(pattern => pattern.test(content));
}

/**
 * Extract component name from file
 */
function extractComponentName(content, filename) {
  // Try to find named export
  const namedExportMatch = content.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/);
  if (namedExportMatch) {
    return namedExportMatch[1];
  }
  
  // Try to find default export
  const defaultExportMatch = content.match(/export\s+default\s+(\w+)/);
  if (defaultExportMatch) {
    return defaultExportMatch[1];
  }
  
  // Fallback to filename
  return filename.replace(/\.(tsx|jsx|ts|js)$/, '');
}

/**
 * Extract component props from file
 */
function extractComponentProps(content) {
  const props = [];
  
  // Look for TypeScript interfaces
  const interfaceMatch = content.match(/interface\s+(\w+)Props\s*\{([^}]+)\}/);
  if (interfaceMatch) {
    const interfaceContent = interfaceMatch[2];
    const propMatches = interfaceContent.match(/(\w+)\s*:\s*([^;\n]+)/g);
    
    if (propMatches) {
      for (const match of propMatches) {
        const [, name, type] = match.match(/(\w+)\s*:\s*([^;\n]+)/);
        props.push({ name, type: type.trim() });
      }
    }
  }
  
  // Look for PropTypes
  const propTypesMatch = content.match(/static\s+propTypes\s*=\s*\{([^}]+)\}/);
  if (propTypesMatch) {
    const propTypesContent = propTypesMatch[1];
    const propMatches = propTypesContent.match(/(\w+)\s*:\s*([^,\n]+)/g);
    
    if (propMatches) {
      for (const match of propMatches) {
        const [, name, type] = match.match(/(\w+)\s*:\s*([^,\n]+)/);
        props.push({ name, type: type.trim() });
      }
    }
  }
  
  return props;
}

/**
 * Extract description from file
 */
function extractDescription(content) {
  // Look for JSDoc comments
  const jsdocPattern = /\/\*\*([\s\S]*?)\*\//;
  const match = content.match(jsdocPattern);
  if (match) {
    const lines = match[1].split('\n');
    for (const line of lines) {
      const descMatch = line.match(/^\s*\*\s*(.+)/);
      if (descMatch && !descMatch[1].startsWith('@')) {
        return descMatch[1].trim();
      }
    }
  }
  
  // Look for single-line comments
  const commentPattern = /\/\/\s*(.+)/;
  const commentMatch = content.match(commentPattern);
  if (commentMatch) {
    return commentMatch[1].trim();
  }
  
  return 'No description available';
}

/**
 * Determine component type
 */
function determineComponentType(content) {
  if (content.includes('class') && content.includes('extends')) {
    return 'Class Component';
  } else if (content.includes('function')) {
    return 'Function Component';
  } else if (content.includes('const') && content.includes('=>')) {
    return 'Arrow Function Component';
  }
  return 'Unknown';
}

/**
 * Extract exports from file
 */
function extractExports(content) {
  const exports = [];
  
  // Named exports
  const namedExports = content.match(/export\s+(?:const|function|class)\s+(\w+)/g);
  if (namedExports) {
    exports.push(...namedExports.map(exp => exp.replace(/export\s+(?:const|function|class)\s+/, '')));
  }
  
  // Default export
  if (content.includes('export default')) {
    exports.push('default');
  }
  
  return exports;
}

/**
 * Scan for routes in the codebase
 */
function scanRoutes() {
  const routes = [];
  
  // Scan pages directory
  const pagesDir = join(process.cwd(), 'src/pages');
  if (existsSync(pagesDir)) {
    scanPagesDirectory(pagesDir, routes);
  }
  
  // Scan for router configurations
  const routerFiles = findRouterFiles();
  for (const file of routerFiles) {
    const routesFromFile = extractRoutesFromFile(file);
    routes.push(...routesFromFile);
  }
  
  return routes;
}

/**
 * Scan pages directory for routes
 */
function scanPagesDirectory(pagesDir, routes) {
  try {
    const items = readdirSync(pagesDir);
    
    for (const item of items) {
      const fullPath = join(pagesDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // This is a route directory
        const routePath = `/${item}`;
        routes.push({
          path: routePath,
          component: `src/pages/${item}`,
          type: 'Page Route',
          description: `Page component for ${routePath}`
        });
      } else if (isReactFile(item)) {
        // This is a route file
        const routePath = `/${item.replace(/\.(tsx|jsx|ts|js)$/, '')}`;
        if (routePath === '/index') {
          routes.push({
            path: '/',
            component: `src/pages/${item}`,
            type: 'Page Route',
            description: 'Home page component'
          });
        } else {
          routes.push({
            path: routePath,
            component: `src/pages/${item}`,
            type: 'Page Route',
            description: `Page component for ${routePath}`
          });
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not scan pages directory: ${error.message}`);
  }
}

/**
 * Find router configuration files
 */
function findRouterFiles() {
  const routerFiles = [];
  const searchDirs = ['src', 'app', 'routes'];
  
  for (const dir of searchDirs) {
    const fullPath = join(process.cwd(), dir);
    if (existsSync(fullPath)) {
      findFilesRecursively(fullPath, routerFiles, ['router', 'routes', 'app']);
    }
  }
  
  return routerFiles;
}

/**
 * Find files recursively with specific patterns
 */
function findFilesRecursively(dirPath, files, patterns) {
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          findFilesRecursively(fullPath, files, patterns);
        }
      } else if (patterns.some(pattern => item.includes(pattern))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors for this function
  }
}

/**
 * Extract routes from router file
 */
function extractRoutesFromFile(filePath) {
  const routes = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Look for route definitions
    const routePatterns = [
      /path:\s*['"`]([^'"`]+)['"`]/g,
      /to:\s*['"`]([^'"`]+)['"`]/g,
      /href:\s*['"`]([^'"`]+)['"`]/g
    ];
    
    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        routes.push({
          path: match[1],
          component: filePath,
          type: 'Router Route',
          description: `Route defined in ${filePath}`
        });
      }
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not read router file ${filePath}: ${error.message}`);
  }
  
  return routes;
}

/**
 * Generate component map JSON
 */
function generateComponentMap(components) {
  return {
    generated: new Date().toISOString(),
    total: components.length,
    components: components.map(comp => ({
      name: comp.name,
      file: comp.file,
      type: comp.type,
      description: comp.description,
      props: comp.props,
      exports: comp.exports
    }))
  };
}

/**
 * Generate route map JSON
 */
function generateRouteMap(routes) {
  return {
    generated: new Date().toISOString(),
    total: routes.length,
    routes: routes.map(route => ({
      path: route.path,
      component: route.component,
      type: route.type,
      description: route.description
    }))
  };
}

/**
 * Update frontend documentation
 */
function updateFrontendDocs(components, routes) {
  let content = '';
  
  if (existsSync(FRONTEND_DOC)) {
    content = readFileSync(FRONTEND_DOC, 'utf8');
  } else {
    content = `# Frontend Architecture and Components

## Overview

This document describes the frontend architecture, components, and routing structure of DocCraft-AI.

## Component Architecture

DocCraft-AI uses a modular component architecture with React and TypeScript.

<!-- AUTO-GEN:BEGIN section=components -->
<!-- AUTO-GEN:END section=components -->

## Routing Structure

The application uses a combination of file-based routing and programmatic routing.

<!-- AUTO-GEN:BEGIN section=routes -->
<!-- AUTO-GEN:END section=routes -->

## Component Guidelines

### Component Types
- **Page Components**: Full page layouts and routing
- **Feature Components**: Business logic and feature-specific UI
- **UI Components**: Reusable, presentational components
- **Layout Components**: Page structure and navigation

### Props and Types
- All components should have TypeScript interfaces for props
- Use JSDoc comments for complex prop descriptions
- Prefer composition over inheritance

### State Management
- Use React Context for global state
- Local state with useState for component-specific data
- Custom hooks for reusable logic

---

**Changelog**
- \`initial\` - 2024-12-01 - Created initial frontend documentation
`;
  }
  
  // Generate components summary
  const componentsSummary = generateComponentsSummary(components);
  
  // Update the auto-generated components section
  const componentsPattern = /<!-- AUTO-GEN:BEGIN section=components -->[\s\S]*?<!-- AUTO-GEN:END section=components -->/;
  const componentsReplacement = `<!-- AUTO-GEN:BEGIN section=components -->
${componentsSummary}
<!-- AUTO-GEN:END section=components -->`;
  
  if (componentsPattern.test(content)) {
    content = content.replace(componentsPattern, componentsReplacement);
  }
  
  // Generate routes summary
  const routesSummary = generateRoutesSummary(routes);
  
  // Update the auto-generated routes section
  const routesPattern = /<!-- AUTO-GEN:BEGIN section=routes -->[\s\S]*?<!-- AUTO-GEN:END section=routes -->/;
  const routesReplacement = `<!-- AUTO-GEN:BEGIN section=routes -->
${routesSummary}
<!-- AUTO-GEN:END section=routes -->`;
  
  if (routesPattern.test(content)) {
    content = content.replace(routesPattern, routesReplacement);
  }
  
  // Add changelog entry
  const changelogEntry = `- \`${getCurrentCommitHash()}\` - ${new Date().toISOString().split('T')[0]} - Updated frontend component and route documentation`;
  content = content.replace(/^---\s*\n\n\*\*Changelog\*\*/, `---\n\n**Changelog**\n${changelogEntry}`);
  
  writeFileSync(FRONTEND_DOC, content);
}

/**
 * Generate components summary for documentation
 */
function generateComponentsSummary(components) {
  if (components.length === 0) {
    return 'No React components found in the current codebase.';
  }
  
  let summary = `Found ${components.length} React components:\n\n`;
  summary += '| Component | Type | File | Props |\n';
  summary += '|-----------|------|------|-------|\n';
  
  for (const comp of components) {
    const propsCount = comp.props.length;
    const propsText = propsCount > 0 ? `${propsCount} props` : 'No props';
    
    summary += `| \`${comp.name}\` | ${comp.type} | \`${comp.file}\` | ${propsText} |\n`;
  }
  
  return summary;
}

/**
 * Generate routes summary for documentation
 */
function generateRoutesSummary(routes) {
  if (routes.length === 0) {
    return 'No routes found in the current codebase.';
  }
  
  let summary = `Found ${routes.length} routes:\n\n`;
  summary += '| Path | Type | Component |\n';
  summary += '|------|------|-----------|\n';
  
  for (const route of routes) {
    summary += `| \`${route.path}\` | ${route.type} | \`${route.component}\` |\n`;
  }
  
  return summary;
}

/**
 * Get current commit hash
 */
function getCurrentCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('🔄 Generating frontend documentation...');
  
  try {
    // Ensure directories exist
    if (!existsSync(REFS_DIR)) {
      execSync(`mkdir -p "${REFS_DIR}"`, { stdio: 'inherit' });
    }
    
    // Scan for React components
    console.log('📊 Scanning for React components...');
    const components = scanReactComponents();
    console.log(`✅ Found ${components.length} React components`);
    
    // Generate component map
    const componentMap = generateComponentMap(components);
    const componentMapPath = join(REFS_DIR, 'component-map.json');
    writeFileSync(componentMapPath, JSON.stringify(componentMap, null, 2));
    console.log(`✅ Component map written to ${componentMapPath}`);
    
    // Scan for routes
    console.log('📊 Scanning for routes...');
    const routes = scanRoutes();
    console.log(`✅ Found ${routes.length} routes`);
    
    // Generate route map
    const routeMap = generateRouteMap(routes);
    const routeMapPath = join(REFS_DIR, 'route-map.json');
    writeFileSync(routeMapPath, JSON.stringify(routeMap, null, 2));
    console.log(`✅ Route map written to ${routeMapPath}`);
    
    // Update frontend documentation
    updateFrontendDocs(components, routes);
    console.log(`✅ Frontend documentation updated`);
    
    console.log('\n🎉 Frontend documentation generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating frontend documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
