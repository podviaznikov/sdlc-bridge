import { describe, it, expect } from "vitest";
import { writeFile, readFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { renderComments } from "../comments.js";
import type { Comment, ParsedDoc, Config } from "../types.js";

const TMP_DIR = join(import.meta.dirname, "__tmp_comments__");

describe("renderComments", () => {
  const mockConfig: Config = {
    docsPath: "docs/**/*.md",
    configPath: ".sdlc-bridge.yml",
    syncComments: true,
    syncTasks: true,
    formats: { comments: ["md", "json"], tasks: ["md", "json"] },
  };

  const mockDoc: ParsedDoc = {
    filePath: "docs/design/auth.md",
    frontmatter: { title: "Auth System" },
    content: "We should use JWT for session tokens. Rate limiting at the edge.",
    tasks: [],
  };

  const mockComments: Comment[] = [
    {
      id: "c1",
      source: "google_docs",
      author: "sarah",
      body: "What hashing algorithm?",
      quoted_text: "Rate limiting at the edge",
      created_at: "2026-02-21T10:00:00Z",
      resolved: false,
      url: "https://docs.google.com/document/d/abc?disco=c1",
      replies: [],
    },
    {
      id: "c2",
      source: "linear",
      author: "david",
      body: "Should we consider opaque tokens?",
      quoted_text: "We should use JWT for session tokens",
      created_at: "2026-02-20T10:00:00Z",
      resolved: false,
      url: "https://linear.app/doc/abc#comment-c2",
      replies: [
        {
          author: "anton",
          body: "Good point, let's discuss.",
          created_at: "2026-02-20T11:00:00Z",
        },
      ],
    },
  ];

  const setup = async () => {
    await mkdir(TMP_DIR, { recursive: true });
  };

  const cleanup = async () => {
    await rm(TMP_DIR, { recursive: true, force: true });
  };

  it("renders comments to markdown", async () => {
    await setup();
    const file = join(TMP_DIR, "auth.md");
    await writeFile(file, "test");
    await renderComments(file, mockComments, mockDoc, mockConfig);

    const md = await readFile(join(TMP_DIR, "auth.comments.md"), "utf-8");
    expect(md).toContain("# Comments: Auth System");
    expect(md).toContain("## Open");
    expect(md).toContain("@david");
    expect(md).toContain("@sarah");
    expect(md).toContain("Should we consider opaque tokens?");
    expect(md).toContain("Good point, let's discuss.");
    await cleanup();
  });

  it("renders comments to json", async () => {
    await setup();
    const file = join(TMP_DIR, "auth.md");
    await writeFile(file, "test");
    await renderComments(file, mockComments, mockDoc, mockConfig);

    const json = JSON.parse(await readFile(join(TMP_DIR, "auth.comments.json"), "utf-8"));
    expect(json).toHaveLength(2);
    // Should be ordered by position in content (JWT comes before Rate limiting)
    expect(json[0].quoted_text).toBe("We should use JWT for session tokens");
    expect(json[1].quoted_text).toBe("Rate limiting at the edge");
    await cleanup();
  });

  it("orders comments by position in document", async () => {
    await setup();
    const file = join(TMP_DIR, "auth.md");
    await writeFile(file, "test");
    await renderComments(file, mockComments, mockDoc, mockConfig);

    const json = JSON.parse(await readFile(join(TMP_DIR, "auth.comments.json"), "utf-8"));
    // "We should use JWT" appears before "Rate limiting" in the content
    expect(json[0].author).toBe("david");
    expect(json[1].author).toBe("sarah");
    await cleanup();
  });

  it("marks orphaned comments", async () => {
    await setup();
    const file = join(TMP_DIR, "auth.md");
    await writeFile(file, "test");

    const orphanedComment: Comment = {
      id: "c3",
      source: "google_docs",
      author: "mike",
      body: "This is outdated",
      quoted_text: "text that no longer exists in the document",
      created_at: "2026-02-19T10:00:00Z",
      resolved: false,
      url: "https://docs.google.com/document/d/abc?disco=c3",
      replies: [],
    };

    await renderComments(file, [orphanedComment], mockDoc, mockConfig);
    const md = await readFile(join(TMP_DIR, "auth.comments.md"), "utf-8");
    expect(md).toContain("text no longer found in source");
    await cleanup();
  });
});
