import { execSync } from "node:child_process";
import { loadConfig } from "../core/src/config.js";
import { findDocFiles } from "../core/src/files.js";
import { parseDoc } from "../core/src/parser.js";
import { writeFrontmatter } from "../core/src/frontmatter.js";
import { renderComments } from "../core/src/comments.js";
import { renderTasks } from "../core/src/tasks.js";
import { publishToGoogleDocs, fetchGoogleDocsComments } from "../google-docs-bridge/src/index.js";
import { publishToLinear, fetchLinearComments, syncLinearTasks } from "../linear-bridge/src/index.js";

async function main() {
  const config = await loadConfig();
  const files = await findDocFiles(config.docsPath);

  console.log(`Found ${files.length} doc(s) to sync`);

  for (const file of files) {
    console.log(`Processing: ${file}`);
    const doc = await parseDoc(file);

    // Publish to Google Docs
    if (doc.frontmatter.publish?.google_docs && config.googleCredentials) {
      console.log(`  → Publishing to Google Docs`);
      const result = await publishToGoogleDocs(doc, config);
      doc.frontmatter.publish.google_docs.doc_id = result.docId;
      doc.frontmatter.publish.google_docs.url = result.url;
      console.log(`  ✓ Google Docs: ${result.url}`);
    }

    // Publish to Linear
    if (doc.frontmatter.publish?.linear && config.linearApiKey) {
      console.log(`  → Publishing to Linear`);
      const result = await publishToLinear(doc, config);
      doc.frontmatter.publish.linear.doc_id = result.docId;
      doc.frontmatter.publish.linear.url = result.url;
      console.log(`  ✓ Linear: ${result.url}`);

      // Sync tasks
      if (config.syncTasks && doc.frontmatter.publish.linear.tasks) {
        console.log(`  → Syncing tasks to Linear`);
        const issues = await syncLinearTasks(doc, config);
        doc.frontmatter.publish.linear.issues = issues;
        console.log(`  ✓ ${issues.length} task(s) synced`);

        // Render tasks output files
        await renderTasks(file, issues, doc, config);
      }
    }

    // Write updated frontmatter back
    await writeFrontmatter(file, doc.frontmatter);

    // Sync comments
    if (config.syncComments) {
      const comments = [];

      if (doc.frontmatter.publish?.google_docs?.doc_id && config.googleCredentials) {
        console.log(`  → Fetching Google Docs comments`);
        const gdocsComments = await fetchGoogleDocsComments(doc, config);
        comments.push(...gdocsComments);
      }

      if (doc.frontmatter.publish?.linear?.doc_id && config.linearApiKey) {
        console.log(`  → Fetching Linear comments`);
        const linearComments = await fetchLinearComments(doc, config);
        comments.push(...linearComments);
      }

      if (comments.length > 0) {
        await renderComments(file, comments, doc, config);
        console.log(`  ✓ ${comments.length} comment(s) synced`);
      }
    }
  }

  // Commit changes back to repo
  if (process.env.GITHUB_ACTIONS) {
    await commitChanges();
  }

  console.log("Done.");
}

async function commitChanges(): Promise<void> {
  try {
    execSync('git config user.name "sdlc-bridge[bot]"');
    execSync('git config user.email "sdlc-bridge[bot]@users.noreply.github.com"');

    // Check if there are changes
    const status = execSync("git status --porcelain").toString().trim();
    if (!status) {
      console.log("No changes to commit");
      return;
    }

    // Stage doc files and generated outputs
    execSync("git add docs/ .sdlc-bridge.yml 2>/dev/null || true");
    execSync('git commit -m "sdlc-bridge: sync docs, comments, and tasks [skip ci]"');
    execSync("git push");
    console.log("Changes committed and pushed");
  } catch (err) {
    console.warn("Could not commit changes:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
