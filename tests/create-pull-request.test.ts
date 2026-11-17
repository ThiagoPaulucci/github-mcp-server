 import { beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { registerCreatePullRequestTool } from "../src/tools/create-pull-request.js";
import { octokit } from "../src/github/client.js";

type CreatePullRequestHandler = (args: {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
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
      pulls: {
        create: vi.fn(),
      },
    },
  },
}));

describe("create_pull_request", () => {
  let handler!: CreatePullRequestHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    const server = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          callback: CreatePullRequestHandler
        ) => {
          handler = callback;
        }
      ),
    };

    registerCreatePullRequestTool(server as unknown as McpServer);
  });

  it("should create a pull request successfully", async () => {
    const response = {
      data: {
        number: 15,
        title: "Add authentication",
        body: "Authentication implementation",
        state: "open",
        user: { login: "ThiagoPaulucci" },
        html_url: "https://github.com/example/repo/pull/15",
        head: { ref: "feature/auth" },
        base: { ref: "master" },
        created_at: "2026-11-17T10:00:00Z",
      },
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.pulls.create>
    >;

    vi.mocked(octokit.rest.pulls.create).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Add authentication",
      head: "feature/auth",
      base: "master",
      body: "Authentication implementation",
    });

    const pullRequest = JSON.parse(result.content[0].text);

    expect(pullRequest.number).toBe(15);
    expect(pullRequest.title).toBe("Add authentication");
    expect(pullRequest.head_branch).toBe("feature/auth");
    expect(pullRequest.base_branch).toBe("master");
    expect(pullRequest.author).toBe("ThiagoPaulucci");

    expect(octokit.rest.pulls.create).toHaveBeenCalledWith({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Add authentication",
      head: "feature/auth",
      base: "master",
      body: "Authentication implementation",
    });
  });

  it("should handle GitHub API errors", async () => {
    vi.mocked(octokit.rest.pulls.create).mockRejectedValue(
      new Error("GitHub API unavailable")
    );

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Add authentication",
      head: "feature/auth",
      base: "master",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(
      "GitHub API unavailable"
    );
  });
});