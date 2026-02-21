import { createLinearClient } from "./auth.js";
import type { ParsedDoc, Config, LinearIssueRef } from "../../core/src/types.js";

export async function syncLinearTasks(doc: ParsedDoc, config: Config): Promise<LinearIssueRef[]> {
  const client = createLinearClient(config.linearApiKey!);
  const linearConfig = doc.frontmatter.publish?.linear;
  if (!linearConfig) return [];

  const existingIssues = linearConfig.issues || [];
  const results: LinearIssueRef[] = [];

  // Resolve team ID for issue creation
  const teamId = await resolveTeamId(client, linearConfig.team);
  if (!teamId && existingIssues.length === 0 && doc.tasks.length > 0) {
    console.warn("No team specified for Linear task creation. Skipping.");
    return [];
  }

  for (const task of doc.tasks) {
    const existing = existingIssues.find((i) => i.title === task.title);

    if (existing) {
      // Update status if task was checked/unchecked
      const issue = await client.issue(existing.id);
      if (issue) {
        const state = await issue.state;
        const isDone = state?.type === "completed" || state?.type === "canceled";

        if (task.checked && !isDone) {
          // Mark as done — find completed state
          const team = await issue.team;
          if (team) {
            const states = await team.states();
            const doneState = states.nodes.find((s) => s.type === "completed");
            if (doneState) {
              await client.updateIssue(existing.id, { stateId: doneState.id });
            }
          }
        }
      }

      results.push(existing);
    } else if (teamId) {
      // Create new issue
      const created = await client.createIssue({
        title: task.title,
        teamId,
        description: `From design doc: ${doc.frontmatter.title}\n\nSource: ${doc.filePath}`,
      });

      const issue = await created.issue;
      if (issue) {
        results.push({
          id: issue.identifier,
          title: task.title,
          url: issue.url,
        });
      }
    }
  }

  return results;
}

async function resolveTeamId(client: ReturnType<typeof createLinearClient>, teamKey?: string): Promise<string | undefined> {
  if (!teamKey) {
    // Use first team as default
    const teams = await client.teams();
    return teams.nodes[0]?.id;
  }

  const teams = await client.teams({ filter: { key: { eq: teamKey } } });
  return teams.nodes[0]?.id;
}
