import type { Edge, Node } from "@xyflow/react";

export type { Edge };

export type CloudProvider = "aws" | "gcp" | "azure";

export type ComponentCategory =
  | "infrastructure"
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
  useCase: string; // beginner-friendly explanation of what this is and when to use it
  connectsTo: string[]; // list of component IDs this can connect to (e.g. ["aws-vpc", "aws-sg"])
  fields: ComponentField[];
  outputs?: string[]; // what the service produces (e.g. ["VPC ID"])
  isContainer?: boolean; // marks components that render as enclosing boxes
  containerLevel?: number; // nesting order (1=Region, 2=AZ, 3=VPC, 4=Subnet/Cluster)
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
  id: string;
  parentId?: string;
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
  outputFormat: "terraform" | "pulumi";
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
