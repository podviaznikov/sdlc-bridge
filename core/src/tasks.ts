import { writeFile } from "node:fs/promises";
import type { ParsedDoc, Config, LinearIssueRef } from "./types.js";

export async function renderTasks(
  filePath: string,
  issues: LinearIssueRef[],
  doc: ParsedDoc,
  config: Config
): Promise<void> {
  const formats = doc.frontmatter.formats?.tasks ?? config.formats.tasks;
  const basePath = filePath.replace(/\.md$/, "");

  const taskData = doc.tasks.map((task) => {
    const issue = issues.find((i) => i.title === task.title);
    return {
      title: task.title,
      checked: task.checked,
      line: task.line,
      issue: issue ?? null,
    };
  });

  for (const format of formats) {
    if (format === "md") {
      await writeFile(`${basePath}.tasks.md`, renderTasksMarkdown(taskData, doc));
    }
    if (format === "json") {
      await writeFile(`${basePath}.tasks.json`, JSON.stringify(taskData, null, 2));
    }
  }
}

interface TaskWithIssue {
  title: string;
  checked: boolean;
  line: number;
  issue: LinearIssueRef | null;
}

function renderTasksMarkdown(tasks: TaskWithIssue[], doc: ParsedDoc): string {
  const now = new Date().toISOString();
  const lines: string[] = [
    `<!-- AUTO-GENERATED — do not edit -->`,
    `<!-- Last synced: ${now} -->`,
    `<!-- Source: ${doc.filePath} -->`,
    ``,
    `# Tasks: ${doc.frontmatter.title}`,
    ``,
  ];

  for (const task of tasks) {
    const check = task.checked ? "x" : " ";
    const issueLink = task.issue ? ` → [${task.issue.id}](${task.issue.url})` : "";
    lines.push(`- [${check}] ${task.title}${issueLink}`);
  }

  lines.push(``);
  return lines.join("\n");
}
