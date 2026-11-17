import "dotenv/config";
import { Octokit } from "@octokit/rest";

const token = process.env.GITHUB_TOKEN;

export const octokit: Octokit = new Octokit({
  auth: token || undefined,
  baseUrl: process.env.GITHUB_API_URL || "https://api.github.com",
});
