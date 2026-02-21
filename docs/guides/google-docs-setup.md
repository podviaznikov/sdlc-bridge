# Google Docs Setup

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Note the project ID

## 2. Enable APIs

Enable these two APIs in your project:

- [Google Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com)
- [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)

## 3. Create a Service Account

1. Go to [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/service-accounts)
2. Click **Create Service Account**
3. Name it `sdlc-bridge` (or any name)
4. Skip granting roles (not needed)
5. Click **Done**

## 4. Create a Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key → Create New Key**
4. Choose **JSON**
5. Download the key file

## 5. Share a Google Drive Folder

1. Create a folder in Google Drive where docs will be published
2. Share the folder with the service account email (looks like `sdlc-bridge@project-id.iam.gserviceaccount.com`)
3. Give it **Editor** access

## 6. Add to GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Create a new secret named `GOOGLE_SA_KEY`
3. Paste the entire JSON key file contents as the value

## Permissions

The service account needs:

- `https://www.googleapis.com/auth/documents` — read/write Google Docs
- `https://www.googleapis.com/auth/drive` — create files, manage sharing, read comments

These scopes are automatically requested by sdlc-bridge.
