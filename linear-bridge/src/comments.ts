import { createLinearClient } from "./auth.js";
import type { ParsedDoc, Config, Comment } from "../../core/src/types.js";

export async function fetchLinearComments(doc: ParsedDoc, config: Config): Promise<Comment[]> {
  const client = createLinearClient(config.linearApiKey!);
  const docId = doc.frontmatter.publish?.linear?.doc_id;

  if (!docId) return [];

  const document = await client.document(docId);

  // Fetch comments on the document via raw GraphQL
  // The SDK doesn't expose document comments directly
  const rawClient = client as unknown as { _request: (query: string, variables: Record<string, unknown>) => Promise<unknown> };

  const query = `
    query DocumentComments($id: String!) {
      document(id: $id) {
        comments {
          nodes {
            id
            body
            quotedText
            createdAt
            resolvedAt
            url
            user {
              name
            }
            children {
              nodes {
                id
                body
                createdAt
                url
                user {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const result = await rawClient._request(query, { id: docId }) as {
      document: {
        comments: {
          nodes: Array<{
            id: string;
            body: string;
            quotedText?: string;
            createdAt: string;
            resolvedAt?: string;
            url: string;
            user: { name: string };
            children: {
              nodes: Array<{
                id: string;
                body: string;
                createdAt: string;
                url?: string;
                user: { name: string };
              }>;
            };
          }>;
        };
      };
    };

    return result.document.comments.nodes.map((c) => ({
      id: c.id,
      source: "linear" as const,
      author: c.user.name,
      body: c.body,
      quoted_text: c.quotedText || undefined,
      created_at: c.createdAt,
      resolved: !!c.resolvedAt,
      url: c.url,
      replies: c.children.nodes.map((r) => ({
        author: r.user.name,
        body: r.body,
        created_at: r.createdAt,
        url: r.url,
      })),
    }));
  } catch {
    // Fallback if raw query fails — return empty
    console.warn(`Could not fetch inline comments for Linear document ${docId}`);
    return [];
  }
}
