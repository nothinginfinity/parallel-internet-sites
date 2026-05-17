# afo-mcp

AFO MCP Server — purpose-built tools for Alice and AI clients to manage AFO infrastructure directly.

## What It Does

Exposes a set of named MCP tools over HTTP so any MCP-compatible AI client (Perplexity, Claude, ChatGPT via bridge) can interact with AFO's Cloudflare infrastructure without manual dashboard work.

## Tools

| Tool | Description |
|------|-------------|
| `queryD1` | Read-only SELECT against afo-v1 |
| `applyMigration` | Run DDL/DML SQL — CREATE TABLE, ALTER, INSERT, UPDATE |
| `getCustomerRows` | Latest rows from customers table |
| `getSnapshotRows` | Latest rows from visibility_snapshots (filterable by customer_id) |
| `listTables` | List all tables in afo-v1 — verify migrations applied |
| `checkWorkerBind` | Verify D1 binding is reachable |
| `pingEndpoint` | HTTP probe for end-to-end form testing |

## Auth

Protected by **Cloudflare Access (Zero Trust)**. The Worker URL is placed behind an Access Application — only authenticated users/service tokens can reach `/mcp`.

The `/health` endpoint is unprotected for uptime checks.

## Deploy

```bash
cd workers/afo-mcp
npx wrangler deploy
```

## Cloudflare Access Setup (after deploy)

1. Go to **Zero Trust → Access → Applications → Add Application**
2. Type: **Self-hosted**
3. Domain: `afo-mcp.<your-subdomain>.workers.dev` (or custom domain)
4. Policy: Allow your email address
5. For AI clients: create a **Service Token** under Access → Service Auth → Service Tokens
6. Pass `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers when connecting

## Connect to Perplexity Space

1. Deploy the Worker
2. Set up Cloudflare Access as above
3. Create a Service Token for Perplexity
4. In Perplexity Space settings → MCP Servers → Add:
   - URL: `https://afo-mcp.<subdomain>.workers.dev/mcp`
   - Auth headers: `CF-Access-Client-Id` + `CF-Access-Client-Secret`

## Version

- v1.0.0 — Initial release with 7 tools, Zero Trust auth
- v2.0.0 (planned) — OAuth, Worker deploy trigger, env var management
