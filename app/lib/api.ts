export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type ConnectorProvider = "aws" | "gcp" | "azure";

export interface DeploymentResponse {
  message: string;
  deploymentId: number;
}

export async function login(role: "admin" | "user" = "user"): Promise<string> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const { token } = await response.json();
  localStorage.setItem("cloudiflow_jwt", token);
  return token;
}

export function getStoredToken(): string | null {
  return localStorage.getItem("cloudiflow_jwt");
}

function normalizeIdToNumber(value: string): number {
  const asNumber = Number.parseInt(value, 10);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber;
  }

  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return (hash % 1_000_000_000) + 1;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken() || (await login()); // Auto-login for dev ease

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token expired, clear and retry once
    localStorage.removeItem("cloudiflow_jwt");
    const newToken = await login();
    return apiFetch(endpoint, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `API error: ${response.status}`);
  }

  return response.json();
}

export async function runDeployment(
  projectId: string,
  hcl: string,
): Promise<DeploymentResponse> {
  return apiFetch("/deploy", {
    method: "POST",
    body: JSON.stringify({
      projectId: normalizeIdToNumber(projectId),
      hcl,
    }),
  });
}

export async function createCloudConnector(input: {
  orgId: string;
  provider: ConnectorProvider;
  credentials: Record<string, string>;
}) {
  return apiFetch("/connectors", {
    method: "POST",
    body: JSON.stringify({
      orgId: normalizeIdToNumber(input.orgId),
      provider: input.provider,
      credentials: input.credentials,
    }),
  });
}

export async function createDeploymentEventSource(
  deploymentId: number,
): Promise<EventSource> {
  const token = getStoredToken() || (await login());
  return new EventSource(
    `${API_BASE}/api/v1/deploy/${deploymentId}/events?token=${encodeURIComponent(token)}`,
  );
}
