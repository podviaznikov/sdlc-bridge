import type { DocFrontmatter } from "./types.js";

export function buildSourceHeader(frontmatter: DocFrontmatter, filePath: string, format: "markdown" | "plain"): string {
  const repoUrl = getRepoUrl();
  const lines: string[] = [];

  if (format === "markdown") {
    lines.push(`> **Source:** [${filePath}](${repoUrl}/blob/main/${filePath})`);
    lines.push(`> *This document is auto-published by sdlc-bridge. Edit the markdown source, not this document.*`);
  } else {
    lines.push(`Source: ${repoUrl}/blob/main/${filePath}`);
    lines.push(`This document is auto-published by sdlc-bridge. Edit the markdown source, not this document.`);
  }

  // Add discussion links
  const discussions = frontmatter.discussions;
  if (discussions) {
    const links: string[] = [];

    for (const url of discussions.slack || []) {
      links.push(format === "markdown" ? `[Slack](${url})` : `Slack: ${url}`);
    }
    for (const url of discussions.linear || []) {
      links.push(format === "markdown" ? `[Linear](${url})` : `Linear: ${url}`);
    }
    for (const url of discussions.google_docs || []) {
      links.push(format === "markdown" ? `[Google Docs](${url})` : `Google Docs: ${url}`);
    }

    if (links.length > 0) {
      if (format === "markdown") {
        lines.push(`> **Discussions:** ${links.join(" | ")}`);
      } else {
        lines.push(`Discussions: ${links.join(", ")}`);
      }
    }
  }

  lines.push("", format === "markdown" ? "---" : "", "");
  return lines.join("\n");
}

function getRepoUrl(): string {
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) return `https://github.com/${repo}`;
  return "https://github.com";
}
