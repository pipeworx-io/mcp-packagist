interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Packagist MCP — PHP / Composer package registry
 *
 * API docs: https://packagist.org/apidoc
 * Auth: none.
 */


const BASE = 'https://packagist.org';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search Packagist by free text. Optionally filter by package type and tags.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text — package name / description' },
        type: { type: 'string', description: 'composer-plugin | library | symfony-bundle | wordpress-plugin | ...' },
        tags: { type: 'string', description: 'Comma-separated tags' },
        page: { type: 'number', description: '1-based page' },
        per_page: { type: 'number', description: '1-15 (default 15, API max)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_package',
    description: 'Fetch full package metadata including all versions.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Package name in "vendor/package" form' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_versions',
    description: 'List all versions of a package with release dates.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'vendor/package' } },
      required: ['name'],
    },
  },
  {
    name: 'package_stats',
    description: 'Download counts (total, monthly, daily) + dependents count.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'vendor/package' } },
      required: ['name'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search':
      return search(args);
    case 'get_package':
      return getPackage(reqStr(args, 'name', '"symfony/console"'));
    case 'list_versions':
      return listVersions(reqStr(args, 'name', '"symfony/console"'));
    case 'package_stats':
      return packageStats(reqStr(args, 'name', '"symfony/console"'));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function search(args: Record<string, unknown>) {
  const params = new URLSearchParams({
    q: String(args.query),
    page: String(Math.max(1, (args.page as number) ?? 1)),
    per_page: String(Math.min(15, Math.max(1, (args.per_page as number) ?? 15))),
  });
  if (args.type) params.set('type', String(args.type));
  if (args.tags) params.set('tags[]', String(args.tags));
  return packagistGet(`/search.json?${params}`);
}

async function getPackage(name: string) {
  validatePackageName(name);
  return packagistGet(`/packages/${name}.json`);
}

async function listVersions(name: string) {
  validatePackageName(name);
  const data = (await packagistGet(`/packages/${name}.json`)) as { package?: { versions?: Record<string, { version?: string; time?: string }> } };
  const versions = Object.values(data.package?.versions ?? {}).map((v) => ({ version: v.version, released: v.time }));
  return { package: name, count: versions.length, versions };
}

async function packageStats(name: string) {
  validatePackageName(name);
  return packagistGet(`/packages/${name}/stats.json`);
}

function validatePackageName(name: string) {
  if (!/^[a-z0-9][a-z0-9_.-]*\/[a-z0-9][a-z0-9_.-]*$/i.test(name)) {
    throw new Error(`Invalid package name "${name}". Expected "vendor/package" format.`);
  }
}

async function packagistGet(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (res.status === 404) throw new Error('Packagist: not found');
  if (res.status === 429) throw new Error('Packagist: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Packagist error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
