#!/usr/bin/env node

/**
 * DocCraft-AI Prisma Database Documentation Generator
 * 
 * This script generates database schema documentation from Prisma schema files
 * and updates the database documentation accordingly.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOCS_DIR = join(__dirname, '../../docs/dev');
const REFS_DIR = join(DOCS_DIR, 'refs');
const DATABASE_DOC = join(DOCS_DIR, '06-database.md');

// Prisma schema locations
const PRISMA_PATHS = {
  postgres: 'prisma/schema.prisma',
  mongodb: 'prisma-mongodb/schema.prisma'
};

/**
 * Parse Prisma schema file and extract model information
 */
function parsePrismaSchema(schemaPath) {
  if (!existsSync(schemaPath)) {
    return null;
  }
  
  const content = readFileSync(schemaPath, 'utf8');
  const models = [];
  
  // Split content into sections
  const sections = content.split(/(?=^model\s+\w+)/m);
  
  for (const section of sections) {
    if (section.trim().startsWith('model ')) {
      const model = parseModelSection(section);
      if (model) {
        models.push(model);
      }
    }
  }
  
  return {
    models,
    rawContent: content,
    lastModified: new Date().toISOString()
  };
}

/**
 * Parse a single model section from Prisma schema
 */
function parseModelSection(section) {
  const lines = section.split('\n');
  const modelName = lines[0].match(/^model\s+(\w+)/)?.[1];
  
  if (!modelName) return null;
  
  const model = {
    name: modelName,
    fields: [],
    indexes: [],
    relations: [],
    comments: []
  };
  
  let inFieldBlock = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and model declaration
    if (!trimmed || trimmed.startsWith('model ')) continue;
    
    // Check for closing brace
    if (trimmed === '}') break;
    
    // Check for comments
    if (trimmed.startsWith('//')) {
      model.comments.push(trimmed.substring(2).trim());
      continue;
    }
    
    // Check for field definitions
    if (trimmed.includes(':')) {
      const field = parseFieldDefinition(trimmed);
      if (field) {
        model.fields.push(field);
      }
      continue;
    }
    
    // Check for indexes
    if (trimmed.includes('@@index')) {
      const index = parseIndexDefinition(trimmed);
      if (index) {
        model.indexes.push(index);
      }
      continue;
    }
    
    // Check for relations
    if (trimmed.includes('@@relation')) {
      const relation = parseRelationDefinition(trimmed);
      if (relation) {
        model.relations.push(relation);
      }
      continue;
    }
  }
  
  return model;
}

/**
 * Parse a field definition line
 */
function parseFieldDefinition(line) {
  // Remove comments
  const cleanLine = line.split('//')[0].trim();
  
  // Match field pattern: name type [modifiers]
  const match = cleanLine.match(/^(\w+)\s+(\w+(?:\[\])?)(?:\s+(\w+))?/);
  if (!match) return null;
  
  const [, name, type, modifier] = match;
  
  // Check for additional attributes
  const isRequired = !cleanLine.includes('?');
  const isUnique = cleanLine.includes('@unique');
  const isId = cleanLine.includes('@id');
  const hasDefault = cleanLine.includes('@default');
  
  return {
    name,
    type,
    modifier: modifier || null,
    isRequired,
    isUnique,
    isId,
    hasDefault,
    raw: cleanLine
  };
}

/**
 * Parse an index definition line
 */
function parseIndexDefinition(line) {
  const match = line.match(/@@index\(\[([^\]]+)\]/);
  if (!match) return null;
  
  const fields = match[1].split(',').map(f => f.trim());
  return {
    fields,
    raw: line.trim()
  };
}

/**
 * Parse a relation definition line
 */
function parseRelationDefinition(line) {
  const match = line.match(/@@relation\(([^)]+)\)/);
  if (!match) return null;
  
  return {
    definition: match[1],
    raw: line.trim()
  };
}

/**
 * Generate markdown documentation for a schema
 */
function generateSchemaMarkdown(schema, dbType) {
  if (!schema || !schema.models) {
    return `# ${dbType} Database Schema\n\nNo schema found or unable to parse.\n`;
  }
  
  let markdown = `# ${dbType} Database Schema\n\n`;
  markdown += `**Last Updated**: ${schema.lastModified}\n\n`;
  
  if (dbType === 'MongoDB') {
    markdown += `⚠️ **Important**: MongoDB schemas are re-introspected and may overwrite custom edits. Always backup your schema before regeneration.\n\n`;
  }
  
  markdown += `## Models\n\n`;
  
  for (const model of schema.models) {
    markdown += generateModelMarkdown(model);
  }
  
  markdown += `\n## Schema Summary\n\n`;
  markdown += `- **Total Models**: ${schema.models.length}\n`;
  markdown += `- **Total Fields**: ${schema.models.reduce((sum, m) => sum + m.fields.length, 0)}\n`;
  markdown += `- **Total Indexes**: ${schema.models.reduce((sum, m) => sum + m.indexes.length, 0)}\n`;
  markdown += `- **Total Relations**: ${schema.models.reduce((sum, m) => sum + m.relations.length, 0)}\n\n`;
  
  return markdown;
}

/**
 * Generate markdown for a single model
 */
function generateModelMarkdown(model) {
  let markdown = `### ${model.name}\n\n`;
  
  // Add comments if available
  if (model.comments.length > 0) {
    markdown += `**Description**: ${model.comments.join(' ')}\n\n`;
  }
  
  // Fields table
  markdown += `#### Fields\n\n`;
  markdown += `| Name | Type | Required | Unique | ID | Default |\n`;
  markdown += `|------|------|----------|--------|----|--------|\n`;
  
  for (const field of model.fields) {
    const type = field.modifier ? `${field.type}(${field.modifier})` : field.type;
    markdown += `| \`${field.name}\` | \`${type}\` | ${field.isRequired ? '✅' : '❌'} | ${field.isUnique ? '✅' : '❌'} | ${field.isId ? '✅' : '❌'} | ${field.hasDefault ? '✅' : '❌'} |\n`;
  }
  
  markdown += '\n';
  
  // Indexes
  if (model.indexes.length > 0) {
    markdown += `#### Indexes\n\n`;
    for (const index of model.indexes) {
      markdown += `- **Fields**: [${index.fields.join(', ')}]\n`;
    }
    markdown += '\n';
  }
  
  // Relations
  if (model.relations.length > 0) {
    markdown += `#### Relations\n\n`;
    for (const relation of model.relations) {
      markdown += `- ${relation.definition}\n`;
    }
    markdown += '\n';
  }
  
  markdown += '---\n\n';
  
  return markdown;
}

/**
 * Update database documentation
 */
function updateDatabaseDocs(schemas) {
  let content = '';
  
  if (existsSync(DATABASE_DOC)) {
    content = readFileSync(DATABASE_DOC, 'utf8');
  } else {
    content = `# Database Schemas and Migrations

## Overview

This document describes the database schemas, models, and migration strategies used in DocCraft-AI.

## Database Architecture

DocCraft-AI uses a hybrid database approach:
- **PostgreSQL**: Primary database for user data, authentication, and core application data
- **MongoDB**: Specialized database for document-specific data and analytics

## Schema Documentation

<!-- AUTO-GEN:BEGIN section=schema-docs -->
<!-- AUTO-GEN:END section=schema-docs -->

## Migration Strategy

### PostgreSQL Migrations
- Managed through Supabase migrations
- Version-controlled schema changes
- Automatic rollback capabilities

### MongoDB Schema Management
⚠️ **Important**: MongoDB schemas are re-introspected and may overwrite custom edits. Always backup your schema before regeneration.

## Database Connections

### PostgreSQL (Supabase)
- Connection managed through Supabase client
- Real-time subscriptions enabled
- Row-level security policies

### MongoDB
- Direct connection for specialized operations
- Used for document versioning and analytics
- Separate connection pool management

---

**Changelog**
- \`initial\` - 2024-12-01 - Created initial database documentation
`;
  }
  
  // Generate schema documentation summary
  const schemaSummary = generateSchemaSummary(schemas);
  
  // Update the auto-generated section
  const autoGenPattern = /<!-- AUTO-GEN:BEGIN section=schema-docs -->[\s\S]*?<!-- AUTO-GEN:END section=schema-docs -->/;
  const replacement = `<!-- AUTO-GEN:BEGIN section=schema-docs -->
${schemaSummary}
<!-- AUTO-GEN:END section=schema-docs -->`;
  
  if (autoGenPattern.test(content)) {
    content = content.replace(autoGenPattern, replacement);
  } else {
    content += `\n\n## Schema Documentation\n\n${schemaSummary}`;
  }
  
  // Add changelog entry
  const changelogEntry = `- \`${getCurrentCommitHash()}\` - ${new Date().toISOString().split('T')[0]} - Updated database schema documentation`;
  content = content.replace(/^---\s*\n\n\*\*Changelog\*\*/, `---\n\n**Changelog**\n${changelogEntry}`);
  
  writeFileSync(DATABASE_DOC, content);
}

/**
 * Generate schema documentation summary
 */
function generateSchemaSummary(schemas) {
  let summary = '';
  
  for (const [dbType, schema] of Object.entries(schemas)) {
    if (schema) {
      summary += `### ${dbType}\n\n`;
      summary += `- **Models**: ${schema.models.length}\n`;
      summary += `- **Last Updated**: ${schema.lastModified}\n`;
      summary += `- **Schema File**: \`${PRISMA_PATHS[dbType.toLowerCase()]}\`\n\n`;
      
      if (dbType === 'MongoDB') {
        summary += `⚠️ **Note**: MongoDB schema is re-introspected and may overwrite custom edits.\n\n`;
      }
    }
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
  console.log('🔄 Generating Prisma database documentation...');
  
  try {
    // Ensure directories exist
    if (!existsSync(REFS_DIR)) {
      execSync(`mkdir -p "${REFS_DIR}"`, { stdio: 'inherit' });
    }
    
    const schemas = {};
    
    // Parse PostgreSQL schema
    console.log('📊 Parsing PostgreSQL schema...');
    const postgresSchema = parsePrismaSchema(PRISMA_PATHS.postgres);
    if (postgresSchema) {
      schemas.postgres = postgresSchema;
      console.log(`✅ Found ${postgresSchema.models.length} PostgreSQL models`);
      
      // Generate markdown
      const postgresMarkdown = generateSchemaMarkdown(postgresSchema, 'PostgreSQL');
      const postgresPath = join(REFS_DIR, 'prisma-pg.schema.md');
      writeFileSync(postgresPath, postgresMarkdown);
      console.log(`✅ PostgreSQL schema written to ${postgresPath}`);
    } else {
      console.log('⚠️  PostgreSQL schema not found');
    }
    
    // Parse MongoDB schema
    console.log('📊 Parsing MongoDB schema...');
    const mongoSchema = parsePrismaSchema(PRISMA_PATHS.mongodb);
    if (mongoSchema) {
      schemas.mongodb = mongoSchema;
      console.log(`✅ Found ${mongoSchema.models.length} MongoDB models`);
      
      // Generate markdown
      const mongoMarkdown = generateSchemaMarkdown(mongoSchema, 'MongoDB');
      const mongoPath = join(REFS_DIR, 'prisma-mongo.schema.md');
      writeFileSync(mongoPath, mongoMarkdown);
      console.log(`✅ MongoDB schema written to ${mongoPath}`);
    } else {
      console.log('⚠️  MongoDB schema not found');
    }
    
    // Update database documentation
    updateDatabaseDocs(schemas);
    console.log(`✅ Database documentation updated`);
    
    console.log('\n🎉 Prisma database documentation generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating Prisma documentation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
