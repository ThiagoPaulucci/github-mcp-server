
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { octokit } from "../github/client.js";

export function registerCreatePullRequestTool(server: McpServer): void {
  server.registerTool(
    "create_pull_request",
    {
      description: "Create a pull request in a GitHub repository",
      inputSchema: {
        owner: z.string().min(1).describe("GitHub username or organization"),
        repo: z.string().min(1).describe("Repository name"),
        title: z.string().min(1).describe("Pull request title"),
        head: z.string().min(1).describe("Source branch"),
        base: z.string().min(1).describe("Target branch"),
        body: z.string().optional().describe("Pull request description"),
      },
    },
    async ({ owner, repo, title, head, base, body }) => {
      try {
        const response = await octokit.rest.pulls.create({
          owner,
          repo,
          title,
          head,
          base,
          body,
        });

        const pullRequest = {
          number: response.data.number,
          title: response.data.title,
          body: response.data.body,
          state: response.data.state,
          author: response.data.user?.login ?? null,
          url: response.data.html_url,
          head_branch: response.data.head.ref,
          base_branch: response.data.base.ref,
          created_at: response.data.created_at,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(pullRequest, null, 2),
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
              text: `Failed to create pull request: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
