import { google } from "googleapis";
import type { docs_v1, drive_v3 } from "googleapis";

export interface GoogleClients {
  docs: docs_v1.Docs;
  drive: drive_v3.Drive;
}

export function createGoogleClients(credentialsJson: string): GoogleClients {
  const credentials = JSON.parse(credentialsJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ],
  });

  const docs = google.docs({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  return { docs, drive };
}
