/**
 * afo-mcp — AFO MCP Server
 * Exposes purpose-built tools for managing AFO infrastructure.
 * Protected by Cloudflare Access (Zero Trust) — no unauthenticated requests reach tool logic.
 *
 * Tools:
 *   - queryD1          : Run a read-only SELECT against afo-v1
 *   - applyMigration   : Execute DDL/DML SQL against afo-v1 (restricted ops)
 *   - getCustomerRows  : Fetch latest customers
 *   - getSnapshotRows  : Fetch latest visibility_snapshots
 *   - checkWorkerBind  : Verify D1 binding is reachable
 *   - pingEndpoint     : HTTP GET/POST probe for end-to-end testing
 *   - listTables       : List all tables in afo-v1
 */

// ---------------------------------------------------------------------------
// MCP Protocol Helpers
// ---------------------------------------------------------------------------

function mcpResponse(id, result) {
  return Response.json({
    jsonrpc: "2.0",
    id,
    result
  });
}

function mcpError(id, code, message) {
  return Response.json({
    jsonrpc: "2.0",
    id,
    error: { code, message }
  });
}

// ---------------------------------------------------------------------------
// Tool Definitions (returned on tools/list)
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "queryD1",
    description: "Run a read-only SELECT query against the afo-v1 D1 database. Returns rows as JSON array.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "A valid SELECT SQL statement. Must start with SELECT."
        },
        params: {
          type: "array",
          items: { type: "string" },
          description: "Optional positional parameters for prepared statement (? placeholders)"
        }
      },
      required: ["sql"]
    }
  },
  {
    name: "applyMigration",
    description: "Execute a SQL migration against afo-v1. Supports CREATE TABLE, CREATE INDEX, ALTER TABLE, INSERT, UPDATE. DROP and DELETE require explicit confirm flag.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "SQL statement(s) to execute. Separate multiple statements with semicolons."
        },
        confirm: {
          type: "boolean",
          description: "Required true for DROP or DELETE statements as a safety gate."
        }
      },
      required: ["sql"]
    }
  },
  {
    name: "getCustomerRows",
    description: "Fetch the most recent rows from the customers table in afo-v1.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of rows to return (default 10, max 50)"
        }
      },
      required: []
    }
  },
  {
    name: "getSnapshotRows",
    description: "Fetch the most recent rows from the visibility_snapshots table in afo-v1.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of rows to return (default 10, max 50)"
        },
        customerId: {
          type: "string",
          description: "Optional: filter snapshots by customer_id UUID"
        }
      },
      required: []
    }
  },
  {
    name: "listTables",
    description: "List all tables currently in the afo-v1 D1 database. Use this to verify migrations have been applied.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "checkWorkerBind",
    description: "Verify the D1 binding is reachable from this Worker. Returns binding status and a test query result.",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "pingEndpoint",
    description: "Send an HTTP GET or POST request to any URL. Use for end-to-end testing of AFO form endpoints.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The full URL to probe (e.g. https://agentfeedoptimization.com/start)"
        },
        method: {
          type: "string",
          enum: ["GET", "POST"],
          description: "HTTP method (default GET)"
        },
        body: {
          type: "string",
          description: "Optional JSON string body for POST requests"
        },
        headers: {
          type: "object",
          description: "Optional key/value headers to include"
        }
      },
      required: ["url"]
    }
  }
];

// ---------------------------------------------------------------------------
// Tool Handlers
// ---------------------------------------------------------------------------

async function handleQueryD1(args, env) {
  const { sql, params = [] } = args;
  if (!sql.trim().toUpperCase().startsWith("SELECT")) {
    throw new Error("queryD1 only accepts SELECT statements. Use applyMigration for writes.");
  }
  const stmt = env.DB.prepare(sql);
  const result = params.length > 0
    ? await stmt.bind(...params).all()
    : await stmt.all();
  return {
    rows: result.results,
    rowCount: result.results.length,
    meta: result.meta
  };
}

async function handleApplyMigration(args, env) {
  const { sql, confirm = false } = args;
  const upperSql = sql.trim().toUpperCase();
  const isDangerous = upperSql.startsWith("DROP") || upperSql.startsWith("DELETE");
  if (isDangerous && !confirm) {
    throw new Error("DROP and DELETE require confirm: true as a safety gate. Set confirm to true to proceed.");
  }
  // Split on semicolons to handle multi-statement migrations
  const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);
  const results = [];
  for (const statement of statements) {
    const result = await env.DB.prepare(statement).run();
    results.push({
      statement: statement.substring(0, 80) + (statement.length > 80 ? "..." : ""),
      success: result.success,
      meta: result.meta
    });
  }
  return { applied: results.length, results };
}

async function handleGetCustomerRows(args, env) {
  const limit = Math.min(args.limit || 10, 50);
  const result = await env.DB.prepare(
    "SELECT * FROM customers ORDER BY created_at DESC LIMIT ?"
  ).bind(limit).all();
  return { rows: result.results, rowCount: result.results.length };
}

async function handleGetSnapshotRows(args, env) {
  const limit = Math.min(args.limit || 10, 50);
  let result;
  if (args.customerId) {
    result = await env.DB.prepare(
      "SELECT * FROM visibility_snapshots WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?"
    ).bind(args.customerId, limit).all();
  } else {
    result = await env.DB.prepare(
      "SELECT * FROM visibility_snapshots ORDER BY created_at DESC LIMIT ?"
    ).bind(limit).all();
  }
  return { rows: result.results, rowCount: result.results.length };
}

async function handleListTables(args, env) {
  const result = await env.DB.prepare(
    "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name"
  ).all();
  return { tables: result.results };
}

async function handleCheckWorkerBind(args, env) {
  try {
    const result = await env.DB.prepare("SELECT 1 AS ok").all();
    return { binding: "D1 — afo-v1", status: "reachable", testQuery: result.results };
  } catch (err) {
    return { binding: "D1 — afo-v1", status: "error", error: err.message };
  }
}

async function handlePingEndpoint(args) {
  const { url, method = "GET", body, headers = {} } = args;
  const fetchOptions = {
    method,
    headers: { "Content-Type": "application/json", ...headers }
  };
  if (method === "POST" && body) {
    fetchOptions.body = body;
  }
  const response = await fetch(url, fetchOptions);
  const responseText = await response.text();
  return {
    url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseText.substring(0, 2000)
  };
}

// ---------------------------------------------------------------------------
// MCP Request Router
// ---------------------------------------------------------------------------

async function handleMCPRequest(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return mcpError(null, -32700, "Parse error: invalid JSON");
  }

  const { id, method, params } = body;

  // MCP handshake
  if (method === "initialize") {
    return mcpResponse(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "afo-mcp", version: "1.0.0" }
    });
  }

  if (method === "notifications/initialized") {
    return new Response(null, { status: 204 });
  }

  // Tool list
  if (method === "tools/list") {
    return mcpResponse(id, { tools: TOOLS });
  }

  // Tool call
  if (method === "tools/call") {
    const { name, arguments: args = {} } = params || {};
    try {
      let result;
      switch (name) {
        case "queryD1":         result = await handleQueryD1(args, env); break;
        case "applyMigration":  result = await handleApplyMigration(args, env); break;
        case "getCustomerRows": result = await handleGetCustomerRows(args, env); break;
        case "getSnapshotRows": result = await handleGetSnapshotRows(args, env); break;
        case "listTables":      result = await handleListTables(args, env); break;
        case "checkWorkerBind": result = await handleCheckWorkerBind(args, env); break;
        case "pingEndpoint":    result = await handlePingEndpoint(args); break;
        default:
          return mcpError(id, -32601, `Unknown tool: ${name}`);
      }
      return mcpResponse(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      });
    } catch (err) {
      return mcpError(id, -32603, `Tool error: ${err.message}`);
    }
  }

  return mcpError(id, -32601, `Method not found: ${method}`);
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check (unauthenticated — Cloudflare Access allows this path)
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", worker: "afo-mcp", version: "1.0.0" });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, CF-Access-Jwt-Assertion"
        }
      });
    }

    // All MCP traffic hits /mcp
    if (url.pathname === "/mcp" && request.method === "POST") {
      const response = await handleMCPRequest(request, env);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    return new Response("afo-mcp: not found", { status: 404 });
  }
};
