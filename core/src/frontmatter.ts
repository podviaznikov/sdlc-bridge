import { readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import type { DocFrontmatter } from "./types.js";

export async function writeFrontmatter(filePath: string, frontmatter: DocFrontmatter): Promise<void> {
  const raw = await readFile(filePath, "utf-8");
  const { content } = matter(raw);
  const updated = matter.stringify(content, frontmatter);
  await writeFile(filePath, updated);
}
