import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import type { ParsedDoc, DocFrontmatter, TaskItem } from "./types.js";

export async function parseDoc(filePath: string): Promise<ParsedDoc> {
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as DocFrontmatter;
  const tasks = extractTasks(content);

  return { filePath, frontmatter, content, tasks };
}

function extractTasks(content: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^[\s]*-\s+\[([ xX])\]\s+(.+)$/);
    if (match) {
      tasks.push({
        checked: match[1] !== " ",
        title: match[2].trim(),
        line: i + 1,
      });
    }
  }

  return tasks;
}
