import { describe, it, expect } from "vitest";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { parseDoc } from "../parser.js";

const TMP_DIR = join(import.meta.dirname, "__tmp_parser__");

describe("parseDoc", () => {
  const setup = async (content: string) => {
    await mkdir(TMP_DIR, { recursive: true });
    const file = join(TMP_DIR, "test.md");
    await writeFile(file, content);
    return file;
  };

  const cleanup = async () => {
    await rm(TMP_DIR, { recursive: true, force: true });
  };

  it("parses frontmatter", async () => {
    const file = await setup(`---
title: Test Doc
author: alice
status: draft
---

# Hello
`);
    const doc = await parseDoc(file);
    expect(doc.frontmatter.title).toBe("Test Doc");
    expect(doc.frontmatter.author).toBe("alice");
    expect(doc.frontmatter.status).toBe("draft");
    await cleanup();
  });

  it("parses publish config", async () => {
    const file = await setup(`---
title: Test Doc
publish:
  google_docs:
    sharing: anyone-with-link
  linear:
    project: my-project
    tasks: true
---

Content here
`);
    const doc = await parseDoc(file);
    expect(doc.frontmatter.publish?.google_docs?.sharing).toBe("anyone-with-link");
    expect(doc.frontmatter.publish?.linear?.project).toBe("my-project");
    expect(doc.frontmatter.publish?.linear?.tasks).toBe(true);
    await cleanup();
  });

  it("extracts tasks from checkboxes", async () => {
    const file = await setup(`---
title: Test
---

## Tasks

- [x] First task done
- [ ] Second task pending
- [X] Third task also done
- [ ] Fourth task
`);
    const doc = await parseDoc(file);
    expect(doc.tasks).toHaveLength(4);
    expect(doc.tasks[0]).toEqual({ title: "First task done", checked: true, line: 4 });
    expect(doc.tasks[1]).toEqual({ title: "Second task pending", checked: false, line: 5 });
    expect(doc.tasks[2]).toEqual({ title: "Third task also done", checked: true, line: 6 });
    expect(doc.tasks[3]).toEqual({ title: "Fourth task", checked: false, line: 7 });
    await cleanup();
  });

  it("extracts discussions", async () => {
    const file = await setup(`---
title: Test
discussions:
  slack:
    - https://slack.com/archives/C123/p456
  linear:
    - https://linear.app/team/issue/ENG-100
---

Content
`);
    const doc = await parseDoc(file);
    expect(doc.frontmatter.discussions?.slack).toEqual(["https://slack.com/archives/C123/p456"]);
    expect(doc.frontmatter.discussions?.linear).toEqual(["https://linear.app/team/issue/ENG-100"]);
    await cleanup();
  });

  it("handles no tasks", async () => {
    const file = await setup(`---
title: No Tasks
---

Just text, no checkboxes.
`);
    const doc = await parseDoc(file);
    expect(doc.tasks).toHaveLength(0);
    await cleanup();
  });
});
