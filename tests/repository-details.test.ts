import { beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { registerRepositoryDetailsTools } from "../src/tools/repository-details.js";
import { octokit } from "../src/github/client.js";

type RepositoryDetailsHandler = (args: {
  owner: string;
  repo: string;
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
        get: vi.fn(),
      },
    },
  },
}));

describe("get_repository", () => {
  let handler!: RepositoryDetailsHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    const server = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          callback: RepositoryDetailsHandler
        ) => {
          handler = callback;
        }
      ),
    };

    registerRepositoryDetailsTools(server as unknown as McpServer);
  });

  it("should return repository details successfully", async () => {
    const response = {
      data: {
        name: "github-mcp-server",
        full_name: "ThiagoPaulucci/github-mcp-server",
        description: "GitHub integration using MCP",
        html_url: "https://github.com/ThiagoPaulucci/github-mcp-server",
        homepage: "https://example.com",
        language: "TypeScript",
        stargazers_count: 5,
        forks_count: 2,
        open_issues_count: 3,
        default_branch: "master",
        visibility: "public",
        created_at: "2026-11-17T10:00:00Z",
        updated_at: "2026-11-17T11:00:00Z",
        license: { name: "MIT License" },
        topics: ["typescript", "mcp", "github"],
      },
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.repos.get>
    >;

    vi.mocked(octokit.rest.repos.get).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
    });

    const repository = JSON.parse(result.content[0].text);

    expect(repository.name).toBe("github-mcp-server");
    expect(repository.full_name).toBe(
      "ThiagoPaulucci/github-mcp-server"
    );
    expect(repository.language).toBe("TypeScript");
    expect(repository.stars).toBe(5);
    expect(repository.forks).toBe(2);
    expect(repository.default_branch).toBe("master");
    expect(repository.visibility).toBe("public");
    expect(repository.license).toBe("MIT License");
    expect(repository.topics).toContain("mcp");

    expect(octokit.rest.repos.get).toHaveBeenCalledWith({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
    });
  });

  it("should return null when repository has no license", async () => {
    const response = {
      data: {
        name: "github-mcp-server",
        full_name: "ThiagoPaulucci/github-mcp-server",
        description: null,
        html_url: "https://github.com/ThiagoPaulucci/github-mcp-server",
        homepage: null,
        language: "TypeScript",
        stargazers_count: 0,
        forks_count: 0,
        open_issues_count: 0,
        default_branch: "master",
        visibility: "public",
        created_at: "2026-11-17T10:00:00Z",
        updated_at: "2026-11-17T11:00:00Z",
        license: null,
        topics: [],
      },
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.repos.get>
    >;

    vi.mocked(octokit.rest.repos.get).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
    });

    const repository = JSON.parse(result.content[0].text);

    expect(repository.license).toBeNull();
    expect(repository.topics).toEqual([]);
  });

  it("should handle GitHub API errors", async () => {
    vi.mocked(octokit.rest.repos.get).mockRejectedValue(
      new Error("Repository not found")
    );

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "repository-that-does-not-exist",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(
      "Repository not found"
    );
  });
});