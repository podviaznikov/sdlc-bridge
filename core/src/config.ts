import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import matter from "gray-matter";
import type { Config, OutputFormat } from "./types.js";

const DEFAULT_CONFIG: Config = {
  docsPath: "docs/**/*.md",
  configPath: ".sdlc-bridge.yml",
  syncComments: true,
  syncTasks: true,
  formats: {
    comments: ["md", "json"],
    tasks: ["md", "json"],
  },
};

export async function loadConfig(): Promise<Config> {
  const config = { ...DEFAULT_CONFIG };

  // Load from environment (GitHub Action inputs)
  config.googleCredentials = process.env.INPUT_GOOGLE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS;
  config.linearApiKey = process.env.INPUT_LINEAR_API_KEY || process.env.LINEAR_API_KEY;
  config.docsPath = process.env.INPUT_DOCS_PATH || config.docsPath;
  config.configPath = process.env.INPUT_CONFIG_PATH || config.configPath;
  config.syncComments = process.env.INPUT_SYNC_COMMENTS !== "false";
  config.syncTasks = process.env.INPUT_SYNC_TASKS !== "false";

  // Load from .sdlc-bridge.yml if exists
  if (existsSync(config.configPath)) {
    const raw = await readFile(config.configPath, "utf-8");
    const parsed = matter(raw).data as Partial<Config>;

    if (parsed.docsPath) config.docsPath = parsed.docsPath;
    if (parsed.formats?.comments) config.formats.comments = parsed.formats.comments as OutputFormat[];
    if (parsed.formats?.tasks) config.formats.tasks = parsed.formats.tasks as OutputFormat[];
    if (parsed.syncComments !== undefined) config.syncComments = parsed.syncComments;
    if (parsed.syncTasks !== undefined) config.syncTasks = parsed.syncTasks;
  }

  return config;
}
