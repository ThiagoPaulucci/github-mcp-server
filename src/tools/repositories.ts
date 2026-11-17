import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { octokit } from "../github/client.js";

export function registerRepositoryTools(server: McpServer): void {
  server.registerTool(
    "list_repositories",
    {
      description: "List public repositories from a GitHub user",
      inputSchema: {
        owner: z.string().min(1).describe("GitHub username"),
      },
    },
    async ({ owner }) => {
      try {
        const response = await octokit.rest.repos.listForUser({
          username: owner,
          per_page: 30,
          sort: "updated",
        });

        const repositories = response.data.map((repo) => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          private: repo.private,
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(repositories, null, 2),
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
              text: `Failed to list repositories: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
