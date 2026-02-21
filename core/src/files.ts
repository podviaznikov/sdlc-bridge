import { readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { minimatch } from "minimatch";

export async function findDocFiles(pattern: string): Promise<string[]> {
  const files = await walkDir(".");
  return files
    .filter((f) => {
      const rel = relative(".", f);
      if (rel.endsWith(".comments.md") || rel.endsWith(".comments.json")) return false;
      if (rel.endsWith(".tasks.md") || rel.endsWith(".tasks.json")) return false;
      return minimatch(rel, pattern);
    })
    .sort();
}

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results.push(...(await walkDir(fullPath)));
    } else if (entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}
