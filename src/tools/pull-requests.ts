
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { octokit } from "../github/client.js";

export function registerPullRequestTools(server: McpServer): void {
  server.registerTool(
    "list_pull_requests",
    {
      description: "List pull requests from a GitHub repository",
      inputSchema: {
        owner: z.string().min(1).describe("GitHub username or organization"),
        repo: z.string().min(1).describe("Repository name"),
        state: z
          .enum(["open", "closed", "all"])
          .default("open")
          .describe("Pull request state"),
      },
    },
    async ({ owner, repo, state }) => {
      try {
        const response = await octokit.rest.pulls.list({
          owner,
          repo,
          state,
          per_page: 30,
          sort: "updated",
          direction: "desc",
        });

        const pullRequests = response.data.map((pr) => ({
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          author: pr.user?.login ?? null,
          url: pr.html_url,
          head_branch: pr.head.ref,
          base_branch: pr.base.ref,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(pullRequests, null, 2),
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
              text: `Failed to list pull requests: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
