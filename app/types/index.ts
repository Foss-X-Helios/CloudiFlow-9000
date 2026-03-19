import type { Node, Edge } from "@xyflow/react";

export type { Edge };

export type CloudProvider = "aws" | "gcp" | "azure";

export type ComponentCategory =
  | "compute"
  | "network"
  | "storage"
  | "database"
  | "security"
  | "dns";

export interface CloudComponent {
  id: string;
  name: string;
  icon: string;
  category: ComponentCategory;
  provider: CloudProvider;
  description: string;
  fields: ComponentField[];
}

export interface ComponentField {
  name: string;
  label: string;
  type: "string" | "number" | "select" | "boolean";
  default?: string | number | boolean;
  options?: string[];
  required?: boolean;
}

export interface CanvasNode extends Node {
  data: {
    component: CloudComponent;
    config: Record<string, string | number | boolean>;
    label: string;
  };
}

export type CanvasEdge = Edge;

export interface ProjectState {
  provider: CloudProvider;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  generatedCode: string;
  outputFormat: "terraform" | "pulumi" | "ansible";
}

export interface Organization {
  id: string;
  name: string;
  projects: Project[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}
