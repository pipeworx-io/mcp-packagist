# mcp-packagist

Packagist MCP — PHP / Composer package registry

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search Packagist by free text. Optionally filter by package type and tags. |
| `get_package` | Fetch full package metadata including all versions. |
| `list_versions` | List all versions of a package with release dates. |
| `package_stats` | Download counts (total, monthly, daily) + dependents count. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "packagist": {
      "url": "https://gateway.pipeworx.io/packagist/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Packagist data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
