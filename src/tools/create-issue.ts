import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { octokit } from "../github/client.js";

export function registerCreateIssueTool(server: McpServer): void {
  server.registerTool(
    "create_issue",
    {
      description: "Create a new issue in a GitHub repository",
      inputSchema: {
        owner: z.string().min(1).describe("GitHub username or organization"),
        repo: z.string().min(1).describe("Repository name"),
        title: z.string().min(1).describe("Issue title"),
        body: z.string().optional().describe("Issue description"),
      },
    },
    async ({ owner, repo, title, body }) => {
      try {
        const response = await octokit.rest.issues.create({
          owner,
          repo,
          title,
          body,
        });

        const issue = {
          number: response.data.number,
          title: response.data.title,
          body: response.data.body,
          state: response.data.state,
          url: response.data.html_url,
          created_at: response.data.created_at,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown GitHub API error";

        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to create issue: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
