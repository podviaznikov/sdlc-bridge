import { describe, it, expect } from "vitest";
import { buildSourceHeader } from "../header.js";
import type { DocFrontmatter } from "../types.js";

describe("buildSourceHeader", () => {
  it("builds markdown header", () => {
    const fm: DocFrontmatter = { title: "Test" };
    const header = buildSourceHeader(fm, "docs/design/auth.md", "markdown");
    expect(header).toContain("**Source:**");
    expect(header).toContain("docs/design/auth.md");
    expect(header).toContain("sdlc-bridge");
  });

  it("builds plain header", () => {
    const fm: DocFrontmatter = { title: "Test" };
    const header = buildSourceHeader(fm, "docs/design/auth.md", "plain");
    expect(header).toContain("Source:");
    expect(header).toContain("docs/design/auth.md");
    expect(header).not.toContain("**");
  });

  it("includes discussion links in markdown", () => {
    const fm: DocFrontmatter = {
      title: "Test",
      discussions: {
        slack: ["https://slack.com/archives/C123"],
        linear: ["https://linear.app/team/issue/ENG-100"],
      },
    };
    const header = buildSourceHeader(fm, "docs/test.md", "markdown");
    expect(header).toContain("**Discussions:**");
    expect(header).toContain("[Slack](https://slack.com/archives/C123)");
    expect(header).toContain("[Linear](https://linear.app/team/issue/ENG-100)");
  });

  it("includes discussion links in plain", () => {
    const fm: DocFrontmatter = {
      title: "Test",
      discussions: {
        slack: ["https://slack.com/archives/C123"],
      },
    };
    const header = buildSourceHeader(fm, "docs/test.md", "plain");
    expect(header).toContain("Discussions:");
    expect(header).toContain("Slack: https://slack.com/archives/C123");
  });

  it("skips discussions when empty", () => {
    const fm: DocFrontmatter = { title: "Test", discussions: {} };
    const header = buildSourceHeader(fm, "docs/test.md", "markdown");
    expect(header).not.toContain("Discussions");
  });
});
