
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  "ping",
  {
    description: "Check if the GitHub MCP Server is running",
    inputSchema: z.object({}),
  },
  async () => ({
    content: [
      {
        type: "text",
        text: "GitHub MCP Server is running successfully!",
      },
    ],
  })
);

serveStdio(() => server);
