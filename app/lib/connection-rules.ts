import type { ComponentCategory } from "~/types";

// Define which categories can connect to which
// Key = source category, Value = allowed target categories
export const CONNECTION_RULES: Record<ComponentCategory, ComponentCategory[]> =
  {
    compute: ["network", "storage", "database", "security", "dns"],
    network: ["compute", "security", "dns", "network"],
    storage: ["compute", "security"], // S3 can connect to compute and security, NOT to another storage
    database: ["compute", "security", "network"],
    security: ["compute", "network", "storage", "database"],
    dns: ["network", "compute"],
  };

export function isValidConnection(
  sourceCategory: ComponentCategory,
  targetCategory: ComponentCategory,
): boolean {
  const allowed = CONNECTION_RULES[sourceCategory];
  return allowed ? allowed.includes(targetCategory) : false;
}
