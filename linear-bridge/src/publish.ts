import { createLinearClient } from "./auth.js";
import { buildSourceHeader } from "../../core/src/header.js";
import type { ParsedDoc, Config, PublishResult } from "../../core/src/types.js";

export async function publishToLinear(doc: ParsedDoc, config: Config): Promise<PublishResult> {
  const client = createLinearClient(config.linearApiKey!);
  const existingDocId = doc.frontmatter.publish?.linear?.doc_id;
  const header = buildSourceHeader(doc.frontmatter, doc.filePath, "markdown");
  const content = header + doc.content;

  if (existingDocId) {
    await client.updateDocument(existingDocId, { content });
    const document = await client.document(existingDocId);
    return {
      docId: existingDocId,
      url: `https://linear.app/document/${document.slugId}`,
    };
  } else {
    const projectId = await resolveProjectId(client, doc.frontmatter.publish?.linear?.project);

    const document = await client.createDocument({
      title: doc.frontmatter.title,
      content,
      ...(projectId && { projectId }),
    });

    const created = await document.document;
    if (!created) throw new Error("Failed to create Linear document");

    return {
      docId: created.id,
      url: `https://linear.app/document/${created.slugId}`,
    };
  }
}

async function resolveProjectId(client: ReturnType<typeof createLinearClient>, projectSlug?: string): Promise<string | undefined> {
  if (!projectSlug) return undefined;

  const projects = await client.projects({
    filter: { slugId: { eq: projectSlug } },
  });

  return projects.nodes[0]?.id;
}

