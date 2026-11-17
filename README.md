 GitHub MCP Server
A GitHub integration built with TypeScript and Node.js using the Model Context Protocol (MCP).

The project aims to expose GitHub capabilities as MCP tools, allowing AI assistants to interact with GitHub repositories through a standardized interface.
Current Status
In development.
Implemented
- MCP server initialization
- STDIO transport
- Ping tool for connectivity validation
Planned
- GitHub API integration using Octokit
- Repository listing
- Repository information retrieval
- Issue management
- Pull request management
- Multi-user authentication
Tech Stack
- Node.js
- TypeScript
- Model Context Protocol (MCP)
- Octokit
- Zod
- Vitest
Requirements
- Node.js
- npm
Installation
Clone the repository:

git clone https://github.com/ThiagoPaulucci/github-mcp-server.git

Enter the project folder:

cd github-mcp-server

Install dependencies:

npm install
Environment Variables
Create a .env file in the project root:

GITHUB_TOKEN=your_github_token

GITHUB_API_URL=https://api.github.com

Never commit your .env file or expose your GitHub token.
Available Scripts
- npm run dev — development mode
- npm run build — compile TypeScript
- npm start — run the compiled server
- npm test — run tests
Running the Server
npm run build

npm start
License
MIT