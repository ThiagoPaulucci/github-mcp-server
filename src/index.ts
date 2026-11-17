import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { registerRepositoryTools } from "./tools/repositories.js";
import { registerRepositoryDetailsTools } from "./tools/repository-details.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerCreateIssueTool } from "./tools/create-issue.js";
import { registerPullRequestTools } from "./tools/pull-requests.js";
import { registerCreatePullRequestTool } from "./tools/create-pull-request.js";

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

registerRepositoryTools(server);
registerRepositoryDetailsTools(server);
registerIssueTools(server);
registerCreateIssueTool(server);
registerPullRequestTools(server);
registerCreatePullRequestTool(server);

serveStdio(() => server);
