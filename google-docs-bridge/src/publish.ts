import { createGoogleClients } from "./auth.js";
import { markdownToDocsRequests } from "./mdast-to-docs.js";
import type { ParsedDoc, Config, PublishResult } from "../../core/src/types.js";

const SOURCE_HEADER = (repoUrl: string, filePath: string) =>
  `📄 Source: ${repoUrl}/blob/main/${filePath}\nThis document is auto-published by sdlc-bridge. Edit the markdown source, not this document.\n\n`;

export async function publishToGoogleDocs(doc: ParsedDoc, config: Config): Promise<PublishResult> {
  const clients = createGoogleClients(config.googleCredentials!);
  const existingDocId = doc.frontmatter.publish?.google_docs?.doc_id;

  if (existingDocId) {
    return await updateDoc(existingDocId, doc, config, clients);
  } else {
    return await createDoc(doc, config, clients);
  }
}

async function createDoc(
  doc: ParsedDoc,
  config: Config,
  clients: ReturnType<typeof createGoogleClients>
): Promise<PublishResult> {
  // Create empty doc
  const createRes = await clients.docs.documents.create({
    requestBody: { title: doc.frontmatter.title },
  });

  const docId = createRes.data.documentId!;

  // Build content requests
  const repoUrl = getRepoUrl();
  const header = SOURCE_HEADER(repoUrl, doc.filePath);
  const requests = markdownToDocsRequests(header + doc.content);

  if (requests.length > 0) {
    await clients.docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests },
    });
  }

  // Set sharing
  const sharing = doc.frontmatter.publish?.google_docs?.sharing;
  if (sharing === "anyone-with-link") {
    await clients.drive.permissions.create({
      fileId: docId,
      requestBody: {
        role: "commenter",
        type: "anyone",
      },
    });
  }

  const url = `https://docs.google.com/document/d/${docId}/edit`;
  return { docId, url };
}

async function updateDoc(
  docId: string,
  doc: ParsedDoc,
  config: Config,
  clients: ReturnType<typeof createGoogleClients>
): Promise<PublishResult> {
  // Get current doc to find content range
  const currentDoc = await clients.docs.documents.get({ documentId: docId });
  const body = currentDoc.data.body;
  const endIndex = body?.content?.at(-1)?.endIndex ?? 1;

  const requests: ReturnType<typeof markdownToDocsRequests> = [];

  // Clear existing content (keep the first newline)
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: endIndex - 1 },
      },
    });
  }

  // Insert new content
  const repoUrl = getRepoUrl();
  const header = SOURCE_HEADER(repoUrl, doc.filePath);
  const contentRequests = markdownToDocsRequests(header + doc.content);
  requests.push(...contentRequests);

  if (requests.length > 0) {
    await clients.docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests },
    });
  }

  const url = `https://docs.google.com/document/d/${docId}/edit`;
  return { docId, url };
}

function getRepoUrl(): string {
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) return `https://github.com/${repo}`;
  return "https://github.com";
}
