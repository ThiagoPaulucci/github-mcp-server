import { beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { registerRepositoryTools } from "../src/tools/repositories.js";
import { octokit } from "../src/github/client.js";

type RepositoryHandler = (args: {
  owner: string;
}) => Promise<{
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}>;

vi.mock("../src/github/client.js", () => ({
  octokit: {
    rest: {
      repos: {
        listForUser: vi.fn(),
      },
    },
  },
}));

describe("list_repositories", () => {
  let handler!: RepositoryHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    const server = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          callback: RepositoryHandler
        ) => {
          handler = callback;
        }
      ),
    };

    registerRepositoryTools(server as unknown as McpServer);
  });

  it("should list repositories successfully", async () => {
    const response = {
      data: [
        {
          name: "github-mcp-server",
          full_name: "ThiagoPaulucci/github-mcp-server",
          description: "GitHub integration using MCP",
          html_url: "https://github.com/ThiagoPaulucci/github-mcp-server",
          language: "TypeScript",
          stargazers_count: 5,
          private: false,
        },
      ],
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.repos.listForUser>
    >;

    vi.mocked(octokit.rest.repos.listForUser).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
    });

    const repositories = JSON.parse(result.content[0].text);

    expect(repositories).toHaveLength(1);
    expect(repositories[0].name).toBe("github-mcp-server");
    expect(repositories[0].full_name).toBe(
      "ThiagoPaulucci/github-mcp-server"
    );
    expect(repositories[0].language).toBe("TypeScript");
    expect(repositories[0].stars).toBe(5);
    expect(repositories[0].private).toBe(false);

    expect(octokit.rest.repos.listForUser).toHaveBeenCalledWith({
      username: "ThiagoPaulucci",
      per_page: 30,
      sort: "updated",
    });
  });

  it("should return an empty list when no repositories exist", async () => {
    const response = {
      data: [],
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.repos.listForUser>
    >;

    vi.mocked(octokit.rest.repos.listForUser).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
    });

    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("should handle GitHub API errors", async () => {
    vi.mocked(octokit.rest.repos.listForUser).mockRejectedValue(
      new Error("GitHub API unavailable")
    );

    const result = await handler({
      owner: "ThiagoPaulucci",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(
      "GitHub API unavailable"
    );
  });
});