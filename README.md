
# GitHub MCP Server

A GitHub integration built with TypeScript and Node.js using the Model Context Protocol (MCP).

This project exposes GitHub API capabilities as MCP tools, allowing AI assistants to interact with repositories, issues, and pull requests through a standardized interface.

## Features

### Repository Management
- List public repositories from a GitHub user.
- Retrieve detailed repository information.
- Access repository metadata, languages, stars, forks, topics, and license information.

### Issue Management
- List repository issues.
- Filter issues by state (open, closed, or all).
- Create new issues.
- Handle optional issue descriptions.

### Pull Request Management
- List pull requests.
- Filter pull requests by state.
- Create pull requests between branches.
- Retrieve branch and author information.

### Server
- MCP server initialization.
- STDIO transport.
- Ping tool for connectivity validation.
- GitHub API integration using Octokit.
- Error handling for GitHub API operations.

## Tech Stack

- Node.js
- TypeScript
- Model Context Protocol (MCP)
- Octokit REST API
- Zod
- Vitest
- dotenv

## Project Structure

```text
github-mcp-server/
├── src/
│   ├── auth/
│   ├── config/
│   ├── github/
│   │   └── client.ts
│   ├── tools/
│   │   ├── repositories.ts
│   │   ├── repository-details.ts
│   │   ├── issues.ts
│   │   ├── create-issue.ts
│   │   ├── pull-requests.ts
│   │   └── create-pull-request.ts
│   └── index.ts
├── tests/
│   ├── repositories.test.ts
│   ├── repository-details.test.ts
│   ├── issues.test.ts
│   ├── create-issue.test.ts
│   ├── pull-requests.test.ts
│   └── create-pull-request.test.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── tsconfig.test.json
```

## Requirements

- Node.js
- npm
- GitHub Personal Access Token

## Installation

Clone the repository:

```bash
git clone https://github.com/ThiagoPaulucci/github-mcp-server.git
```

Enter the project directory:

```bash
cd github-mcp-server
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_token
GITHUB_API_URL=https://api.github.com
```

Never commit your `.env` file or expose your GitHub token.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Run the compiled server |
| `npm test` | Run automated tests |
| `npm run typecheck` | Check TypeScript types, including tests |
| `npm run test:watch` | Run tests in watch mode |

## Testing

The project uses Vitest for automated unit testing.

Current test coverage includes:

- Repository listing.
- Repository details retrieval.
- Issue listing and creation.
- Pull request listing and creation.
- Successful API responses.
- Empty API responses.
- API error handling.
- Optional fields.

Current validation results:

- 17 automated tests passing.
- TypeScript build successful.
- Type checking successful, including test files.

Run the tests:

```bash
npm test
```

Check types:

```bash
npm run typecheck
```

Build the project:

```bash
npm run build
```

## Running the Server

Build the project:

```bash
npm run build
```

Start the MCP server:

```bash
npm start
```

The server uses STDIO transport and can be integrated with compatible MCP clients.

## Roadmap

- Multi-user authentication.
- Improved pagination and API rate-limit handling.
- Expanded automated test coverage.
- Continuous integration with GitHub Actions.
- Additional GitHub API tools.

## License

MIT
