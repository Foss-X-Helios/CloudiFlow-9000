import type { CanvasNode } from "~/types";

export interface CodeGenerator {
  generateTerraform(nodes: CanvasNode[]): string;
  generatePulumi(nodes: CanvasNode[]): string;
}

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}
