export interface Config {
  docsPath: string;
  configPath: string;
  googleCredentials?: string;
  linearApiKey?: string;
  syncComments: boolean;
  syncTasks: boolean;
  formats: {
    comments: OutputFormat[];
    tasks: OutputFormat[];
  };
}

export type OutputFormat = "md" | "json";

export interface DocFrontmatter {
  title: string;
  author?: string;
  created?: string;
  updated?: string;
  status?: string;
  discussions?: {
    slack?: string[];
    linear?: string[];
    google_docs?: string[];
  };
  publish?: {
    google_docs?: GoogleDocsPublishConfig;
    linear?: LinearPublishConfig;
  };
  formats?: {
    comments?: OutputFormat[];
    tasks?: OutputFormat[];
  };
}

export interface GoogleDocsPublishConfig {
  sharing?: "anyone-with-link" | "restricted";
  doc_id?: string;
  url?: string;
}

export interface LinearPublishConfig {
  project?: string;
  team?: string;
  tasks?: boolean;
  doc_id?: string;
  url?: string;
  issues?: LinearIssueRef[];
}

export interface LinearIssueRef {
  id: string;
  title: string;
  url: string;
}

export interface ParsedDoc {
  filePath: string;
  frontmatter: DocFrontmatter;
  content: string;
  tasks: TaskItem[];
}

export interface TaskItem {
  title: string;
  checked: boolean;
  line: number;
}

export interface Comment {
  id: string;
  source: "google_docs" | "linear";
  author: string;
  body: string;
  quoted_text?: string;
  created_at: string;
  resolved: boolean;
  url: string;
  replies: CommentReply[];
}

export interface CommentReply {
  author: string;
  body: string;
  created_at: string;
  url?: string;
}

export interface PublishResult {
  docId: string;
  url: string;
}
