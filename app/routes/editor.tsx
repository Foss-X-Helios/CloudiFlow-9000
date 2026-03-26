import { ArrowLeft, Building2, Cloud, FolderGit2, Play, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Canvas } from "~/components/canvas/Canvas";
import {
  getCanvasState,
  getOrganization,
  getProject,
  updateCanvasProvider,
} from "~/lib/store";
import type {
  CanvasNode,
  CloudProvider,
  Edge,
  Organization,
  Project,
} from "~/types";

const providerMeta: Record<
  CloudProvider,
  { label: string; defaultRegion: string; color: string }
> = {
  aws: { label: "AWS", defaultRegion: "us-east-1", color: "#FF9900" },
  gcp: { label: "GCP", defaultRegion: "us-central1", color: "#4285F4" },
  azure: { label: "Azure", defaultRegion: "eastus", color: "#0078D4" },
};

interface CanvasTab {
  provider: CloudProvider;
  nodes: CanvasNode[];
  edges: Edge[];
}

export function meta() {
  return [{ title: "Editor - CloudiFlow-9000" }];
}

export default function Editor() {
  const params = useParams<{ orgId: string; projectId: string }>();
  const navigate = useNavigate();
  const [outputFormat, setOutputFormat] = useState<"terraform" | "pulumi">(
    "terraform",
  );
  const [org, setOrg] = useState<Organization | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  // Multi-tab canvas state
  const [tabs, setTabs] = useState<CanvasTab[]>([
    { provider: "aws", nodes: [], edges: [] },
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const activeTab = tabs[activeTabIndex];

  useEffect(() => {
    if (!params.orgId || !params.projectId) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const foundOrg = getOrganization(params.orgId);
    const foundProject = foundOrg
      ? getProject(params.orgId, params.projectId)
      : undefined;

    if (!foundOrg || !foundProject) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setOrg(foundOrg);
    setProject(foundProject);

    const canvasState = getCanvasState(params.projectId);

    const urlParams = new URLSearchParams(window.location.search);
    const providerOverride = urlParams.get("provider") as CloudProvider | null;
    const initialProvider =
      providerOverride && ["aws", "gcp", "azure"].includes(providerOverride)
        ? providerOverride
        : canvasState.provider;

    setTabs([{ provider: initialProvider, nodes: [], edges: [] }]);
    setActiveTabIndex(0);

    const format = canvasState.outputFormat;
    if (format === "terraform" || format === "pulumi") {
      setOutputFormat(format);
    }
  }, [params.orgId, params.projectId, navigate]);

  const handleProviderSelect = useCallback(
    (newProvider: CloudProvider) => {
      // Check if a tab for this provider already exists
      const existingIndex = tabs.findIndex((t) => t.provider === newProvider);
      if (existingIndex !== -1) {
        setActiveTabIndex(existingIndex);
      } else {
        // Create a new tab
        const newTabs = [
          ...tabs,
          { provider: newProvider, nodes: [], edges: [] },
        ];
        setTabs(newTabs);
        setActiveTabIndex(newTabs.length - 1);
      }

      // Persist
      const defaultRegion = providerMeta[newProvider].defaultRegion;
      if (params.projectId) {
        updateCanvasProvider(params.projectId, newProvider, defaultRegion);
      }
    },
    [tabs, params.projectId],
  );

  const closeTab = useCallback(
    (index: number) => {
      if (tabs.length <= 1) return; // Can't close last tab
      const newTabs = tabs.filter((_, i) => i !== index);
      setTabs(newTabs);
      // Adjust active index
      if (activeTabIndex >= newTabs.length) {
        setActiveTabIndex(newTabs.length - 1);
      } else if (activeTabIndex > index) {
        setActiveTabIndex(activeTabIndex - 1);
      }
    },
    [tabs, activeTabIndex],
  );

  const handleNodesChange = useCallback(
    (nodes: CanvasNode[]) => {
      setTabs((prev) =>
        prev.map((tab, i) => (i === activeTabIndex ? { ...tab, nodes } : tab)),
      );
    },
    [activeTabIndex],
  );

  const handleEdgesChange = useCallback(
    (edges: Edge[]) => {
      setTabs((prev) =>
        prev.map((tab, i) => (i === activeTabIndex ? { ...tab, edges } : tab)),
      );
    },
    [activeTabIndex],
  );

  if (!org || !project) {
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505]">
      <header className="h-14 bg-[#0a0a0a] border-b border-[#151515] flex items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#f38020] to-[#e06000] flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[14px] font-semibold text-white">
              CloudiFlow-9000
            </span>
          </div>

          <div className="h-5 w-px bg-[#222]" />

          <div className="flex items-center gap-3 text-[12px]">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-[#888] hover:text-white transition-colors"
            >
              <Building2 className="w-3 h-3 text-[#555]" />
              {org.name}
            </Link>
            <span className="text-[#333]">/</span>
            <span className="flex items-center gap-1.5 text-[#ccc]">
              <FolderGit2 className="w-3 h-3 text-[#f38020]" />
              {project.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Provider selector — adds new tab */}
          <div className="flex items-center gap-1 bg-[#111] rounded-full p-1 border border-[#1a1a1a]">
            {(["aws", "gcp", "azure"] as const).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => handleProviderSelect(p)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  activeTab?.provider === p
                    ? "bg-[#f38020] text-white shadow-[0_0_10px_rgba(243,128,32,0.2)]"
                    : "text-[#666] hover:text-[#ccc]"
                }`}
              >
                {providerMeta[p].label}
              </button>
            ))}
          </div>

          {/* Format toggle */}
          <div className="flex items-center gap-1 bg-[#111] rounded-full p-1 border border-[#1a1a1a]">
            {(["terraform", "pulumi"] as const).map((format) => (
              <button
                type="button"
                key={format}
                onClick={() => setOutputFormat(format)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  outputFormat === format
                    ? "bg-[#f38020] text-white shadow-[0_0_10px_rgba(243,128,32,0.2)]"
                    : "text-[#666] hover:text-[#ccc]"
                }`}
              >
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Deploy infrastructure"
            onClick={() =>
              window.alert(
                "Deploy coming soon! For now, copy the generated code and apply it with your CLI.",
              )
            }
            className="px-4 py-1.5 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(243,128,32,0.15)]"
          >
            <Play className="w-3 h-3" />
            Deploy
          </button>
        </div>
      </header>

      <main className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Canvas tabs — SegmentedControl */}
        {tabs.length > 1 && (
          <div className="h-9 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center px-2 gap-1 flex-shrink-0">
            {tabs.map((tab, index) => {
              const meta = providerMeta[tab.provider];
              const isActive = index === activeTabIndex;
              const tabKey = `tab-${tab.provider}`;
              return (
                <div
                  key={tabKey}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? "bg-[#1a1a1a] text-white border border-[#333]"
                      : "text-[#666] hover:text-[#aaa] hover:bg-[#111]"
                  }`}
                  onClick={() => setActiveTabIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActiveTabIndex(index);
                  }}
                  role="tab"
                  tabIndex={0}
                  aria-selected={isActive}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  {meta.label}
                  {tab.nodes.length > 0 && (
                    <span className="text-[10px] text-[#555]">
                      ({tab.nodes.length})
                    </span>
                  )}
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Close ${meta.label} tab`}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(index);
                      }}
                      className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Active canvas */}
        <div className="flex-1">
          {activeTab && (
            <Canvas
              key={`${activeTab.provider}-${activeTabIndex}`}
              projectId={params.projectId!}
              outputFormat={outputFormat}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              provider={activeTab.provider}
            />
          )}
        </div>
      </main>
    </div>
  );
}
