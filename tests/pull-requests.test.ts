 import { beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { registerPullRequestTools } from "../src/tools/pull-requests.js";
import { octokit } from "../src/github/client.js";

type PullRequestHandler = (args: {
  owner: string;
  repo: string;
  state: "open" | "closed" | "all";
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
        list: vi.fn(),
      },
    },
  },
}));

describe("list_pull_requests", () => {
  let handler!: PullRequestHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    const server = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          callback: PullRequestHandler
        ) => {
          handler = callback;
        }
      ),
    };

    registerPullRequestTools(server as unknown as McpServer);
  });

  it("should list pull requests successfully", async () => {
    const response = {
      data: [
        {
          number: 10,
          title: "Add authentication",
          body: "Authentication implementation",
          state: "open",
          user: { login: "ThiagoPaulucci" },
          html_url: "https://github.com/example/repo/pull/10",
          head: { ref: "feature/auth" },
          base: { ref: "master" },
          created_at: "2026-11-17T10:00:00Z",
          updated_at: "2026-11-17T11:00:00Z",
        },
      ],
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.pulls.list>
    >;

    vi.mocked(octokit.rest.pulls.list).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      state: "open",
    });

    const pullRequests = JSON.parse(result.content[0].text);

    expect(pullRequests).toHaveLength(1);
    expect(pullRequests[0].number).toBe(10);
    expect(pullRequests[0].title).toBe("Add authentication");
    expect(pullRequests[0].head_branch).toBe("feature/auth");
    expect(pullRequests[0].base_branch).toBe("master");
    expect(pullRequests[0].author).toBe("ThiagoPaulucci");
  });

  it("should return an empty list when no pull requests exist", async () => {
    const response = {
      data: [],
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.pulls.list>
    >;

    vi.mocked(octokit.rest.pulls.list).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      state: "all",
    });

    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("should handle GitHub API errors", async () => {
    vi.mocked(octokit.rest.pulls.list).mockRejectedValue(
      new Error("GitHub API unavailable")
    );

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      state: "open",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(
      "GitHub API unavailable"
    );
  });
});