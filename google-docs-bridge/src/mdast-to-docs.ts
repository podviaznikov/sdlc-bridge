import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { docs_v1 } from "googleapis";
import type { Root, Content, PhrasingContent, TableCell } from "mdast";

type DocsRequest = docs_v1.Schema$Request;

interface BuildContext {
  index: number;
  requests: DocsRequest[];
  tabId?: string;
}

export function markdownToDocsRequests(markdown: string, tabId?: string): DocsRequest[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;

  const ctx: BuildContext = {
    index: 1,
    requests: [],
    tabId,
  };

  for (const node of tree.children) {
    processNode(node, ctx);
  }

  return ctx.requests;
}

function processNode(node: Content, ctx: BuildContext): void {
  switch (node.type) {
    case "heading":
      processHeading(node, ctx);
      break;
    case "paragraph":
      processParagraph(node, ctx);
      break;
    case "list":
      for (const item of node.children) {
        const text = extractText(item);
        insertText(ctx, text + "\n");
        if (node.ordered === false || node.ordered === null) {
          createBullet(ctx, ctx.index - text.length - 1, ctx.index - 1);
        }
      }
      break;
    case "code":
      processCodeBlock(node, ctx);
      break;
    case "table":
      processTable(node, ctx);
      break;
    case "thematicBreak":
      insertText(ctx, "\n");
      ctx.requests.push({
        insertSectionBreak: {
          location: { index: ctx.index - 1, ...(ctx.tabId && { tabId: ctx.tabId }) },
          sectionType: "CONTINUOUS",
        },
      });
      break;
    default:
      // Fallback: extract text content
      const text = extractText(node);
      if (text) {
        insertText(ctx, text + "\n");
      }
      break;
  }
}

function processHeading(node: { depth: number; children: PhrasingContent[] }, ctx: BuildContext): void {
  const text = extractInlineText(node.children);
  const startIndex = ctx.index;
  insertText(ctx, text + "\n");

  const headingMap: Record<number, string> = {
    1: "HEADING_1",
    2: "HEADING_2",
    3: "HEADING_3",
    4: "HEADING_4",
    5: "HEADING_5",
    6: "HEADING_6",
  };

  ctx.requests.push({
    updateParagraphStyle: {
      range: {
        startIndex,
        endIndex: ctx.index,
        ...(ctx.tabId && { tabId: ctx.tabId }),
      },
      paragraphStyle: { namedStyleType: headingMap[node.depth] || "HEADING_3" },
      fields: "namedStyleType",
    },
  });

  applyInlineStyles(node.children, startIndex, ctx);
}

function processParagraph(node: { children: PhrasingContent[] }, ctx: BuildContext): void {
  const startIndex = ctx.index;
  const text = extractInlineText(node.children);
  insertText(ctx, text + "\n");
  applyInlineStyles(node.children, startIndex, ctx);
}

function processCodeBlock(node: { value: string; lang?: string | null }, ctx: BuildContext): void {
  const startIndex = ctx.index;
  const text = node.value + "\n";
  insertText(ctx, text + "\n");

  ctx.requests.push({
    updateTextStyle: {
      range: {
        startIndex,
        endIndex: startIndex + text.length,
        ...(ctx.tabId && { tabId: ctx.tabId }),
      },
      textStyle: {
        weightedFontFamily: { fontFamily: "Courier New" },
        fontSize: { magnitude: 9, unit: "PT" },
      },
      fields: "weightedFontFamily,fontSize",
    },
  });
}

function processTable(node: { children: Array<{ children: TableCell[] }> }, ctx: BuildContext): void {
  const rows = node.children.length;
  const cols = node.children[0]?.children.length || 1;

  ctx.requests.push({
    insertTable: {
      rows,
      columns: cols,
      location: { index: ctx.index, ...(ctx.tabId && { tabId: ctx.tabId }) },
    },
  });

  // Table takes up structural indices — advance past it
  // Each cell has a paragraph (2 indices: start + newline), plus table/row/cell structure
  // This is approximate — exact index math depends on Google Docs internals
  ctx.index += rows * cols * 2 + rows + cols + 4;
}

function extractInlineText(children: PhrasingContent[]): string {
  return children.map((child) => {
    if (child.type === "text") return child.value;
    if (child.type === "inlineCode") return child.value;
    if (child.type === "link") return extractInlineText(child.children);
    if ("children" in child) return extractInlineText(child.children as PhrasingContent[]);
    if ("value" in child) return child.value;
    return "";
  }).join("");
}

function extractText(node: unknown): string {
  const n = node as Record<string, unknown>;
  if (n.type === "text") return n.value as string;
  if (n.value) return n.value as string;
  if (n.children && Array.isArray(n.children)) {
    return (n.children as unknown[]).map(extractText).join("");
  }
  return "";
}

function applyInlineStyles(children: PhrasingContent[], offset: number, ctx: BuildContext): void {
  let pos = offset;

  for (const child of children) {
    const text = child.type === "text" ? child.value :
                 child.type === "inlineCode" ? child.value :
                 extractInlineText("children" in child ? child.children as PhrasingContent[] : []);

    const len = text.length;

    if (child.type === "strong") {
      ctx.requests.push({
        updateTextStyle: {
          range: { startIndex: pos, endIndex: pos + len, ...(ctx.tabId && { tabId: ctx.tabId }) },
          textStyle: { bold: true },
          fields: "bold",
        },
      });
    }

    if (child.type === "emphasis") {
      ctx.requests.push({
        updateTextStyle: {
          range: { startIndex: pos, endIndex: pos + len, ...(ctx.tabId && { tabId: ctx.tabId }) },
          textStyle: { italic: true },
          fields: "italic",
        },
      });
    }

    if (child.type === "inlineCode") {
      ctx.requests.push({
        updateTextStyle: {
          range: { startIndex: pos, endIndex: pos + len, ...(ctx.tabId && { tabId: ctx.tabId }) },
          textStyle: { weightedFontFamily: { fontFamily: "Courier New" } },
          fields: "weightedFontFamily",
        },
      });
    }

    if (child.type === "link") {
      ctx.requests.push({
        updateTextStyle: {
          range: { startIndex: pos, endIndex: pos + len, ...(ctx.tabId && { tabId: ctx.tabId }) },
          textStyle: { link: { url: child.url } },
          fields: "link",
        },
      });
    }

    pos += len;
  }
}

function insertText(ctx: BuildContext, text: string): void {
  ctx.requests.push({
    insertText: {
      location: { index: ctx.index, ...(ctx.tabId && { tabId: ctx.tabId }) },
      text,
    },
  });
  ctx.index += text.length;
}

function createBullet(ctx: BuildContext, start: number, end: number): void {
  ctx.requests.push({
    createParagraphBullets: {
      range: { startIndex: start, endIndex: end, ...(ctx.tabId && { tabId: ctx.tabId }) },
      bulletPreset: "BULLET_DISC_CIRCLE_SQUARE",
    },
  });
}
