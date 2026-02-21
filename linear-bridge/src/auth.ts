import { LinearClient } from "@linear/sdk";

export function createLinearClient(apiKey: string): LinearClient {
  return new LinearClient({ apiKey });
}
