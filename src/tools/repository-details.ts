import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { octokit } from "../github/client.js";

export function registerRepositoryDetailsTools(server: McpServer): void {
  server.registerTool(
    "get_repository",
    {
      description: "Get detailed information about a GitHub repository",
      inputSchema: {
        owner: z.string().min(1).describe("GitHub username or organization"),
        repo: z.string().min(1).describe("Repository name"),
      },
    },
    async ({ owner, repo }) => {
      try {
        const response = await octokit.rest.repos.get({
          owner,
          repo,
        });

        const repository = {
          name: response.data.name,
          full_name: response.data.full_name,
          description: response.data.description,
          url: response.data.html_url,
          homepage: response.data.homepage,
          language: response.data.language,
          stars: response.data.stargazers_count,
          forks: response.data.forks_count,
          open_issues: response.data.open_issues_count,
          default_branch: response.data.default_branch,
          visibility: response.data.visibility,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          license: response.data.license?.name ?? null,
          topics: response.data.topics,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(repository, null, 2),
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
              text: `Failed to get repository details: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
