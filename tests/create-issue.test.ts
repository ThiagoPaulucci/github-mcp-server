import { beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { registerCreateIssueTool } from "../src/tools/create-issue.js";
import { octokit } from "../src/github/client.js";

type CreateIssueHandler = (args: {
  owner: string;
  repo: string;
  title: string;
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
      issues: {
        create: vi.fn(),
      },
    },
  },
}));

describe("create_issue", () => {
  let handler!: CreateIssueHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    const server = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          callback: CreateIssueHandler
        ) => {
          handler = callback;
        }
      ),
    };

    registerCreateIssueTool(server as unknown as McpServer);
  });

  it("should create an issue successfully", async () => {
    const response = {
      data: {
        number: 20,
        title: "Fix authentication bug",
        body: "The authentication flow needs correction",
        state: "open",
        html_url: "https://github.com/example/repo/issues/20",
        created_at: "2026-11-17T10:00:00Z",
      },
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.issues.create>
    >;

    vi.mocked(octokit.rest.issues.create).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Fix authentication bug",
      body: "The authentication flow needs correction",
    });

    const issue = JSON.parse(result.content[0].text);

    expect(issue.number).toBe(20);
    expect(issue.title).toBe("Fix authentication bug");
    expect(issue.state).toBe("open");
    expect(issue.url).toBe("https://github.com/example/repo/issues/20");

    expect(octokit.rest.issues.create).toHaveBeenCalledWith({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Fix authentication bug",
      body: "The authentication flow needs correction",
    });
  });

  it("should create an issue without an optional body", async () => {
    const response = {
      data: {
        number: 21,
        title: "Documentation improvement",
        body: null,
        state: "open",
        html_url: "https://github.com/example/repo/issues/21",
        created_at: "2026-11-17T11:00:00Z",
      },
    } as unknown as Awaited<
      ReturnType<typeof octokit.rest.issues.create>
    >;

    vi.mocked(octokit.rest.issues.create).mockResolvedValue(response);

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Documentation improvement",
    });

    const issue = JSON.parse(result.content[0].text);

    expect(issue.number).toBe(21);
    expect(issue.title).toBe("Documentation improvement");
    expect(issue.body).toBeNull();

    expect(octokit.rest.issues.create).toHaveBeenCalledWith({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Documentation improvement",
      body: undefined,
    });
  });

  it("should handle GitHub API errors", async () => {
    vi.mocked(octokit.rest.issues.create).mockRejectedValue(
      new Error("GitHub API unavailable")
    );

    const result = await handler({
      owner: "ThiagoPaulucci",
      repo: "github-mcp-server",
      title: "Test issue",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(
      "GitHub API unavailable"
    );
  });
});