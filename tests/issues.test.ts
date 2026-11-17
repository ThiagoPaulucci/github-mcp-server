import { beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { registerIssueTools } from "../src/tools/issues.js";
import { octokit } from "../src/github/client.js";

type IssueHandler = (args: {
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
      issues: {
        listForRepo: vi.fn(),
      },
    },
  },
}));

describe("list_issues", () => {
  let handler!: IssueHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    const server = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          callback: IssueHandler
        ) => {
          handler = callback;
        }
      ),
    };

    registerIssueTools(server as unknown as McpServer);
  });

  it("should list issues successfully", async () => {
    const response = {
      data: [
        {
          number: 1,
          title: "Implement authentication",
          body: "Add authentication to the application",
          state: "open",
          user: { login: "ThiagoPaulucci" },
          html_url: "https://github.com/example/repo/issues/1",
          labels: [{ name: "enhancement" }],
          created_at: "2026-11-17T10:00:00Z",
          updated_at: "2026-11-17T11:00:00Z",
        },
      ],
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.issues.listForRepo>
    >;

    vi.mocked(octokit.rest.issues.listForRepo).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      state: "open",
    });

    const issues = JSON.parse(result.content[0].text);

    expect(issues).toHaveLength(1);
    expect(issues[0].number).toBe(1);
    expect(issues[0].title).toBe("Implement authentication");
    expect(issues[0].author).toBe("ThiagoPaulucci");
    expect(issues[0].labels).toContain("enhancement");
  });

  it("should return an empty list when no issues exist", async () => {
    const response = {
      data: [],
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.issues.listForRepo>
    >;

    vi.mocked(octokit.rest.issues.listForRepo).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      state: "all",
    });

    expect(JSON.parse(result.content[0].text)).toEqual([]);
  });

  it("should handle GitHub API errors", async () => {
    vi.mocked(octokit.rest.issues.listForRepo).mockRejectedValue(
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