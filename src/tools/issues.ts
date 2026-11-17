import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { octokit } from "../github/client.js";

export function registerIssueTools(server: McpServer): void {
  server.registerTool(
    "list_issues",
    {
      description: "List issues from a GitHub repository",
      inputSchema: {
        owner: z.string().min(1).describe("GitHub username or organization"),
        repo: z.string().min(1).describe("Repository name"),
        state: z
          .enum(["open", "closed", "all"])
          .default("open")
          .describe("Issue state"),
      },
    },
    async ({ owner, repo, state }) => {
      try {
        const response = await octokit.rest.issues.listForRepo({
          owner,
          repo,
          state,
          per_page: 30,
          sort: "updated",
          direction: "desc",
        });

        const issues = response.data
          .filter((issue) => !issue.pull_request)
          .map((issue) => ({
            number: issue.number,
            title: issue.title,
            body: issue.body,
            state: issue.state,
            author: issue.user?.login ?? null,
            url: issue.html_url,
            labels: issue.labels.map((label) =>
              typeof label === "string" ? label : label.name
            ),
            created_at: issue.created_at,
            updated_at: issue.updated_at,
          }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(issues, null, 2),
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
              text: `Failed to list issues: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
