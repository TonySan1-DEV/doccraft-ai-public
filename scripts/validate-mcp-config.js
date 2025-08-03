import fs from "fs";
import path from "path";

const configPath = ".cursor/mcp.json";

try {
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    throw new Error(`MCP config file not found at ${configPath}`);
  }

  // Parse and validate JSON
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  // Validate version
  if (!config.version) {
    throw new Error("Missing version field in MCP config");
  }

  // Validate mcpServers object
  if (!config.mcpServers) {
    throw new Error("Missing mcpServers root object");
  }

  // Validate each server configuration
  for (const [key, server] of Object.entries(config.mcpServers)) {
    if (!server.command && !server.url) {
      throw new Error(`Server "${key}" must have either command or url`);
    }

    if (server.command && !server.cwd) {
      console.warn(
        `⚠️  Warning: Server "${key}" has command but no cwd specified`
      );
    }

    if (!server.name) {
      throw new Error(`Server "${key}" must have a name`);
    }

    if (!server.description) {
      console.warn(`⚠️  Warning: Server "${key}" has no description`);
    }
  }

  console.log("✅ MCP config is valid");
  console.log(
    `📋 Found ${Object.keys(config.mcpServers).length} MCP server(s)`
  );

  // List configured servers
  for (const [key, server] of Object.entries(config.mcpServers)) {
    console.log(`   - ${key}: ${server.name}`);
  }
} catch (err) {
  console.error("❌ MCP config validation failed:", err.message);
  process.exit(1);
}
