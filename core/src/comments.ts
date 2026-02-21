import { writeFile } from "node:fs/promises";
import type { Comment, ParsedDoc, Config, OutputFormat } from "./types.js";

export async function renderComments(
  filePath: string,
  comments: Comment[],
  doc: ParsedDoc,
  config: Config
): Promise<void> {
  const formats = doc.frontmatter.formats?.comments ?? config.formats.comments;
  const basePath = filePath.replace(/\.md$/, "");

  // Order comments by position in source doc
  const ordered = orderByPosition(comments, doc.content);

  for (const format of formats) {
    if (format === "md") {
      await writeFile(`${basePath}.comments.md`, renderMarkdown(ordered, doc));
    }
    if (format === "json") {
      await writeFile(`${basePath}.comments.json`, JSON.stringify(ordered, null, 2));
    }
  }
}

function orderByPosition(comments: Comment[], content: string): Comment[] {
  return [...comments].sort((a, b) => {
    const posA = a.quoted_text ? content.indexOf(a.quoted_text) : -1;
    const posB = b.quoted_text ? content.indexOf(b.quoted_text) : -1;
    // Orphaned comments (not found) go to the end
    if (posA === -1 && posB === -1) return 0;
    if (posA === -1) return 1;
    if (posB === -1) return -1;
    return posA - posB;
  });
}

function renderMarkdown(comments: Comment[], doc: ParsedDoc): string {
  const now = new Date().toISOString();
  const lines: string[] = [
    `<!-- AUTO-GENERATED — do not edit -->`,
    `<!-- Last synced: ${now} -->`,
    `<!-- Source: ${doc.filePath} -->`,
    ``,
    `# Comments: ${doc.frontmatter.title}`,
    ``,
  ];

  const open = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);

  if (open.length > 0) {
    lines.push(`## Open`, ``);
    for (const comment of open) {
      lines.push(...renderCommentMd(comment, doc.content));
    }
  }

  if (resolved.length > 0) {
    lines.push(`## Resolved`, ``);
    for (const comment of resolved) {
      lines.push(...renderCommentMd(comment, doc.content));
    }
  }

  return lines.join("\n");
}

function renderCommentMd(comment: Comment, content: string): string[] {
  const lines: string[] = [];
  const date = new Date(comment.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const sourceLabel = comment.source === "google_docs" ? "Google Docs" : "Linear";

  lines.push(`### [@${comment.author}](${comment.url}) (${sourceLabel}, ${date})`);

  if (comment.quoted_text) {
    const orphaned = content.indexOf(comment.quoted_text) === -1;
    lines.push(`> "${comment.quoted_text}"${orphaned ? " ⚠️ *text no longer found in source*" : ""}`);
  }

  lines.push(``, comment.body);

  for (const reply of comment.replies) {
    const replyDate = new Date(reply.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const replyLink = reply.url ? `[@${reply.author}](${reply.url})` : `@${reply.author}`;
    lines.push(``, `  **↳ ${replyLink}** (${replyDate}): ${reply.body}`);
  }

  lines.push(``, `---`, ``);
  return lines;
}
