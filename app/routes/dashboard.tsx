import anime from "animejs";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Cloud,
  FolderGit2,
  Loader2,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  createCloudConnector,
  type ConnectorProvider,
} from "~/lib/api";
import {
  createOrganization,
  createProject,
  deleteOrganization,
  deleteProject,
  getOrganizations,
  isOnboarded,
} from "~/lib/store";
import type { Organization } from "~/types";

export function meta() {
  return [{ title: "Dashboard - CloudiFlow-9000" }];
}

type ModalState =
  | { type: "none" }
  | { type: "new-org" }
  | { type: "connectors" }
  | { type: "new-project"; orgId: string }
  | {
      type: "confirm-delete-org";
      orgId: string;
      orgName: string;
      projectCount: number;
    }
  | {
      type: "confirm-delete-project";
      orgId: string;
      projectId: string;
      projectName: string;
    };

export default function Dashboard() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [connectorOrgId, setConnectorOrgId] = useState("");
  const [connectorProvider, setConnectorProvider] =
    useState<ConnectorProvider>("aws");
  const [connectorCredentials, setConnectorCredentials] = useState<
    Record<string, string>
  >({
    accessKeyId: "",
    secretAccessKey: "",
    region: "",
  });
  const [isSavingConnector, setIsSavingConnector] = useState(false);
  const [connectorError, setConnectorError] = useState<string | null>(null);
  const [connectorSuccess, setConnectorSuccess] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const connectorFieldMeta: Record<
    ConnectorProvider,
    { name: string; label: string; placeholder: string; sensitive?: boolean }[]
  > = {
    aws: [
      {
        name: "accessKeyId",
        label: "Access Key ID",
        placeholder: "AKIA...",
      },
      {
        name: "secretAccessKey",
        label: "Secret Access Key",
        placeholder: "••••••••",
        sensitive: true,
      },
      {
        name: "region",
        label: "Region",
        placeholder: "us-east-1",
      },
    ],
    gcp: [
      {
        name: "projectId",
        label: "Project ID",
        placeholder: "my-gcp-project",
      },
      {
        name: "serviceAccountKey",
        label: "Service Account Key (JSON)",
        placeholder: '{"type":"service_account",...}',
        sensitive: true,
      },
      {
        name: "region",
        label: "Region",
        placeholder: "us-central1",
      },
    ],
    azure: [
      {
        name: "tenantId",
        label: "Tenant ID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      },
      {
        name: "clientId",
        label: "Client ID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      },
      {
        name: "clientSecret",
        label: "Client Secret",
        placeholder: "••••••••",
        sensitive: true,
      },
      {
        name: "subscriptionId",
        label: "Subscription ID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      },
    ],
  };

  const buildDefaultCredentials = useCallback(
    (provider: ConnectorProvider): Record<string, string> => {
      return connectorFieldMeta[provider].reduce<Record<string, string>>(
        (result, field) => {
          result[field.name] = "";
          return result;
        },
        {},
      );
    },
    [connectorFieldMeta],
  );

  const refresh = useCallback(() => setOrgs(getOrganizations()), []);

  useEffect(() => {
    if (!isOnboarded()) {
      navigate("/onboarding", { replace: true });
      return;
    }
    refresh();
  }, [navigate, refresh]);

  useEffect(() => {
    if (contentRef.current) {
      anime({
        targets: contentRef.current.querySelectorAll(".dash-item"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(50),
        easing: "easeOutCubic",
      });
    }
  }, []);

  const handleCreateOrg = () => {
    if (!orgName.trim()) return;
    createOrganization(orgName.trim());
    setOrgName("");
    setModal({ type: "none" });
    refresh();
  };

  const handleCreateProject = (orgId: string) => {
    if (!projectName.trim()) return;
    const project = createProject(orgId, projectName.trim());
    if (project) {
      setProjectName("");
      setModal({ type: "none" });
      navigate(`/org/${orgId}/project/${project.id}`);
    }
  };

  const confirmDeleteOrg = (org: Organization) => {
    setModal({
      type: "confirm-delete-org",
      orgId: org.id,
      orgName: org.name,
      projectCount: org.projects.length,
    });
  };

  const handleDeleteOrg = (orgId: string) => {
    deleteOrganization(orgId);
    setModal({ type: "none" });
    refresh();
  };

  const confirmDeleteProject = (
    orgId: string,
    projectId: string,
    projectName: string,
  ) => {
    setModal({ type: "confirm-delete-project", orgId, projectId, projectName });
  };

  const handleDeleteProject = (orgId: string, projectId: string) => {
    deleteProject(orgId, projectId);
    setModal({ type: "none" });
    refresh();
  };

  const openConnectionsModal = () => {
    setConnectorError(null);
    setConnectorSuccess(null);
    setConnectorProvider("aws");
    setConnectorCredentials(buildDefaultCredentials("aws"));
    setConnectorOrgId((previous) => previous || orgs[0]?.id || "");
    setModal({ type: "connectors" });
  };

  const handleConnectorProviderChange = (provider: ConnectorProvider) => {
    setConnectorProvider(provider);
    setConnectorCredentials(buildDefaultCredentials(provider));
    setConnectorError(null);
    setConnectorSuccess(null);
  };

  const handleConnectorFieldChange = (field: string, value: string) => {
    setConnectorCredentials((previous) => ({ ...previous, [field]: value }));
    setConnectorError(null);
    setConnectorSuccess(null);
  };

  const handleSaveConnector = async () => {
    if (!connectorOrgId) {
      setConnectorError("Select an organization first.");
      return;
    }

    const missingRequiredField = connectorFieldMeta[connectorProvider].find(
      (field) => !connectorCredentials[field.name]?.trim(),
    );

    if (missingRequiredField) {
      setConnectorError(`Please provide ${missingRequiredField.label}.`);
      return;
    }

    setIsSavingConnector(true);
    setConnectorError(null);
    setConnectorSuccess(null);

    try {
      await createCloudConnector({
        orgId: connectorOrgId,
        provider: connectorProvider,
        credentials: connectorCredentials,
      });
      setConnectorSuccess("Cloud connector saved successfully.");
      setConnectorCredentials(buildDefaultCredentials(connectorProvider));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save connector.";
      setConnectorError(message);
    } finally {
      setIsSavingConnector(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e3e3e3]">
      {/* Header */}
      <header className="h-16 border-b border-[#151515] flex items-center justify-between px-8 backdrop-blur-md bg-[#0a0a0a]/90 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#f38020] to-[#e06000] flex items-center justify-center shadow-[0_0_15px_rgba(243,128,32,0.15)]">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            CloudiFlow-9000
          </span>
        </div>
        <button
          type="button"
          onClick={openConnectionsModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] hover:border-[#f38020]/30 rounded-lg text-[13px] text-[#ccc] hover:text-white transition-all duration-200"
        >
          <Settings className="w-3.5 h-3.5" />
          Connections
        </button>
        <button
          type="button"
          onClick={() => setModal({ type: "new-org" })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] hover:border-[#f38020]/30 rounded-lg text-[13px] text-[#ccc] hover:text-white transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          New Organization
        </button>
      </header>

      {/* Content */}
      <div ref={contentRef} className="max-w-5xl mx-auto px-8 py-10">
        {orgs.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-10 h-10 text-[#333] mx-auto mb-4" />
            <p className="text-[#666] text-[14px]">No organizations yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orgs.map((org) => (
              <div key={org.id} className="dash-item">
                {/* Org header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#151515] border border-[#1f1f1f] flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-[#f38020]" />
                    </div>
                    <div>
                      <h2 className="text-[16px] font-semibold text-white">
                        {org.name}
                      </h2>
                      <p className="text-[12px] text-[#555]">
                        {org.projects.length} project
                        {org.projects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModal({ type: "new-project", orgId: org.id });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-[#2a2a2a] rounded-lg text-[12px] text-[#888] hover:text-white hover:border-[#f38020]/40 transition-all duration-200"
                    >
                      <Plus className="w-3 h-3" />
                      New Project
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteOrg(org)}
                      className="p-1.5 text-[#333] hover:text-red-500 transition-colors"
                      title="Delete organization"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Project grid */}
                {org.projects.length === 0 ? (
                  <div className="border border-dashed border-[#1a1a1a] rounded-xl px-6 py-5 text-center">
                    <p className="text-[13px] text-[#444]">No projects yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {org.projects.map((project) => (
                      <div
                        key={project.id}
                        className="dash-item group relative rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#f38020]/20 transition-all duration-300"
                      >
                        <Link
                          to={`/org/${org.id}/project/${project.id}`}
                          className="block p-5"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#151515] flex items-center justify-center">
                              <FolderGit2 className="w-3.5 h-3.5 text-[#f38020]" />
                            </div>
                            <h3 className="text-[14px] font-medium text-white">
                              {project.name}
                            </h3>
                          </div>
                          <div className="text-[12px] text-[#555]">
                            Created{" "}
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4 text-[#666]" />
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteProject(
                              org.id,
                              project.id,
                              project.name,
                            );
                          }}
                          className="absolute bottom-4 right-4 p-1 text-[#333] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {modal.type !== "none" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModal({ type: "none" })}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModal({ type: "none" });
          }}
        >
          <div
            role="document"
            className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {modal.type === "new-org" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-semibold text-white">
                    New Organization
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="text-[#666] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="modal-org-name"
                    className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="modal-org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateOrg()}
                    placeholder="Organization name"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#f38020] transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateOrg}
                  disabled={!orgName.trim()}
                  className="w-full py-3 bg-linear-to-r from-[#f38020] to-[#e06000] text-white rounded-xl text-[14px] font-medium disabled:opacity-40 transition-all"
                >
                  Create Organization
                </button>
              </>
            )}

            {modal.type === "connectors" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-semibold text-white">
                    Cloud Connections
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="text-[#666] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {orgs.length === 0 ? (
                  <p className="text-[13px] text-[#777]">
                    Create an organization first to add connectors.
                  </p>
                ) : (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="connector-org"
                        className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2"
                      >
                        Organization
                      </label>
                      <select
                        id="connector-org"
                        value={connectorOrgId}
                        onChange={(event) =>
                          setConnectorOrgId(event.target.value)
                        }
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-[14px] text-white focus:outline-none focus:border-[#f38020] transition-colors"
                      >
                        {orgs.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2">
                        Provider
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["aws", "gcp", "azure"] as const).map((provider) => (
                          <button
                            key={provider}
                            type="button"
                            onClick={() => handleConnectorProviderChange(provider)}
                            className={`py-2 rounded-lg border text-[12px] font-medium transition-colors ${
                              connectorProvider === provider
                                ? "bg-[#f38020]/15 border-[#f38020]/40 text-[#f4a45f]"
                                : "bg-[#0a0a0a] border-[#222] text-[#888] hover:text-white"
                            }`}
                          >
                            {provider.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      {connectorFieldMeta[connectorProvider].map((field) => (
                        <div key={field.name}>
                          <label
                            htmlFor={`connector-${field.name}`}
                            className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2"
                          >
                            {field.label}
                          </label>
                          <input
                            id={`connector-${field.name}`}
                            type={field.sensitive ? "password" : "text"}
                            value={connectorCredentials[field.name] || ""}
                            onChange={(event) =>
                              handleConnectorFieldChange(
                                field.name,
                                event.target.value,
                              )
                            }
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#f38020] transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    {connectorError && (
                      <p className="text-[12px] text-red-400 mb-3">
                        {connectorError}
                      </p>
                    )}
                    {connectorSuccess && (
                      <p className="text-[12px] text-emerald-400 mb-3">
                        {connectorSuccess}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveConnector}
                      disabled={isSavingConnector}
                      className="w-full py-3 bg-linear-to-r from-[#f38020] to-[#e06000] text-white rounded-xl text-[14px] font-medium disabled:opacity-40 transition-all inline-flex items-center justify-center gap-2"
                    >
                      {isSavingConnector && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {isSavingConnector ? "Saving..." : "Save Connector"}
                    </button>
                  </>
                )}
              </>
            )}

            {modal.type === "new-project" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-semibold text-white">
                    New Project
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="text-[#666] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="modal-project-name"
                    className="block text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2"
                  >
                    Project name
                  </label>
                  <input
                    id="modal-project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateProject(modal.orgId)
                    }
                    placeholder="e.g. Core Network"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#f38020] transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateProject(modal.orgId)}
                  disabled={!projectName.trim()}
                  className="w-full py-3 bg-linear-to-r from-[#f38020] to-[#e06000] text-white rounded-xl text-[14px] font-medium disabled:opacity-40 transition-all"
                >
                  Create & Open Editor
                </button>
              </>
            )}

            {modal.type === "confirm-delete-org" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-white">
                      Delete Organization
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="text-[#666] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[14px] text-[#888] mb-2">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">
                    {modal.orgName}
                  </span>
                  ?
                </p>
                {modal.projectCount > 0 && (
                  <p className="text-[13px] text-red-400/80 mb-5">
                    This will permanently delete {modal.projectCount} project
                    {modal.projectCount !== 1 ? "s" : ""} and all their canvas
                    data.
                  </p>
                )}
                {modal.projectCount === 0 && <div className="mb-5" />}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="flex-1 py-2.5 bg-[#1a1a1a] border border-[#222] text-[#ccc] rounded-xl text-[13px] font-medium hover:bg-[#222] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrg(modal.orgId)}
                    className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[13px] font-medium hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {modal.type === "confirm-delete-project" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-white">
                      Delete Project
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="text-[#666] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[14px] text-[#888] mb-5">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-medium">
                    {modal.projectName}
                  </span>
                  ? This will remove all canvas data for this project.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "none" })}
                    className="flex-1 py-2.5 bg-[#1a1a1a] border border-[#222] text-[#ccc] rounded-xl text-[13px] font-medium hover:bg-[#222] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteProject(modal.orgId, modal.projectId)
                    }
                    className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[13px] font-medium hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
