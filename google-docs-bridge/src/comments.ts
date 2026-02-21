import { createGoogleClients } from "./auth.js";
import type { ParsedDoc, Config, Comment } from "../../core/src/types.js";

export async function fetchGoogleDocsComments(doc: ParsedDoc, config: Config): Promise<Comment[]> {
  const clients = createGoogleClients(config.googleCredentials!);
  const docId = doc.frontmatter.publish?.google_docs?.doc_id;

  if (!docId) return [];

  const res = await clients.drive.comments.list({
    fileId: docId,
    fields: "comments(id,content,quotedFileContent,author,createdTime,resolved,replies,htmlContent)",
    includeDeleted: false,
  });

  const comments: Comment[] = (res.data.comments || []).map((c) => ({
    id: c.id!,
    source: "google_docs" as const,
    author: c.author?.displayName || "Unknown",
    body: c.content || "",
    quoted_text: c.quotedFileContent?.value || undefined,
    created_at: c.createdTime || new Date().toISOString(),
    resolved: c.resolved || false,
    url: `https://docs.google.com/document/d/${docId}/edit?disco=${c.id}`,
    replies: (c.replies || []).map((r) => ({
      author: r.author?.displayName || "Unknown",
      body: r.content || "",
      created_at: r.createdTime || new Date().toISOString(),
    })),
  }));

  return comments;
}
