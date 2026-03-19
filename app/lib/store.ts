import type { CloudProvider, Organization, Project, CanvasNode, Edge } from "~/types";

const STORAGE_KEY = "cloudforge_state";

export interface AppState {
  organizations: Organization[];
  onboardingComplete: boolean;
}

function generateId(): string {
  return crypto.randomUUID().slice(0, 8);
}

function loadState(): AppState {
  if (typeof window === "undefined") {
    return { organizations: [], onboardingComplete: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted state, reset
  }
  return { organizations: [], onboardingComplete: false };
}

function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Organizations ---

export function getState(): AppState {
  return loadState();
}

export function isOnboarded(): boolean {
  return loadState().onboardingComplete;
}

export function getOrganizations(): Organization[] {
  return loadState().organizations;
}

export function getOrganization(orgId: string): Organization | undefined {
  return loadState().organizations.find((o) => o.id === orgId);
}

export function createOrganization(name: string): Organization {
  const state = loadState();
  const org: Organization = {
    id: generateId(),
    name,
    projects: [],
    createdAt: new Date().toISOString(),
  };
  state.organizations.push(org);
  state.onboardingComplete = true;
  saveState(state);
  return org;
}

export function deleteOrganization(orgId: string): void {
  const state = loadState();
  state.organizations = state.organizations.filter((o) => o.id !== orgId);
  saveState(state);
}

// --- Projects ---

export function getProject(orgId: string, projectId: string): Project | undefined {
  const org = getOrganization(orgId);
  return org?.projects.find((p) => p.id === projectId);
}

export function createProject(
  orgId: string,
  name: string
): Project | undefined {
  const state = loadState();
  const org = state.organizations.find((o) => o.id === orgId);
  if (!org) return undefined;

  const project: Project = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  };
  org.projects.push(project);
  saveState(state);
  return project;
}

export function deleteProject(orgId: string, projectId: string): void {
  const state = loadState();
  const org = state.organizations.find((o) => o.id === orgId);
  if (!org) return;
  org.projects = org.projects.filter((p) => p.id !== projectId);
  saveState(state);

  // Also clean up canvas state
  if (typeof window !== "undefined") {
    localStorage.removeItem(`cloudforge_canvas_${projectId}`);
  }
}

// --- Canvas State (per project) ---

export interface CanvasState {
  nodes: CanvasNode[];
  edges: Edge[];
  outputFormat: "terraform" | "pulumi" | "ansible";
  provider: CloudProvider;
  region: string;
}

const DEFAULT_CANVAS_STATE: CanvasState = {
  nodes: [],
  edges: [],
  outputFormat: "terraform",
  provider: "aws",
  region: "us-east-1",
};

export function getCanvasState(projectId: string): CanvasState {
  if (typeof window === "undefined") {
    return { ...DEFAULT_CANVAS_STATE };
  }
  try {
    const raw = localStorage.getItem(`cloudforge_canvas_${projectId}`);
    if (raw) return { ...DEFAULT_CANVAS_STATE, ...JSON.parse(raw) };
  } catch {
    // corrupted
  }
  return { ...DEFAULT_CANVAS_STATE };
}

export function updateCanvasProvider(projectId: string, provider: CloudProvider, region: string): void {
  const state = getCanvasState(projectId);
  state.provider = provider;
  state.region = region;
  saveCanvasState(projectId, state);
}

export function saveCanvasState(projectId: string, state: CanvasState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`cloudforge_canvas_${projectId}`, JSON.stringify(state));
}

// --- Reset ---

export function resetAll(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("cloudforge_"));
  keys.forEach((k) => localStorage.removeItem(k));
}
