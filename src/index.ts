#!/usr/bin/env node

/**
 * СДАМ ГИА MCP Server
 * 
 * MCP server for interacting with the СДАМ ГИА educational platform.
 * Provides tools to search and retrieve exam problems, solutions, and answers.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SdamGiaClient } from "./services/sdamgia-client.js";
import { registerProblemTools } from "./tools/problem-tools.js";
import { registerCatalogTools } from "./tools/catalog-tools.js";

/**
 * Initialize and start the MCP server
 */
async function main() {
  // Initialize server
  const server = new McpServer({
    name: "sdamgia-mcp-server",
    version: "1.0.0"
  });

  // Initialize API client
  const client = new SdamGiaClient();

  // Register all tools
  registerProblemTools(server, client);
  registerCatalogTools(server, client);

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("СДАМ ГИА MCP Server running on stdio");
}

// Start server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
