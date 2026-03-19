import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Cloud, Play, ArrowLeft, Building2, FolderGit2 } from "lucide-react";
import { Canvas } from "~/components/canvas/Canvas";
import { getOrganization, getProject, getCanvasState, updateCanvasProvider } from "~/lib/store";
import type { CloudProvider, CanvasNode, Edge, Organization, Project } from "~/types";

const providers: { id: CloudProvider; label: string; defaultRegion: string }[] = [
  { id: "aws", label: "AWS", defaultRegion: "us-east-1" },
  { id: "gcp", label: "GCP", defaultRegion: "us-central1" },
  { id: "azure", label: "Azure", defaultRegion: "eastus" },
];

export function meta() {
  return [{ title: "Editor - CloudiFlow-9000" }];
}

export default function Editor() {
  const params = useParams<{ orgId: string; projectId: string }>();
  const navigate = useNavigate();
  const [outputFormat, setOutputFormat] = useState<"terraform" | "pulumi" | "ansible">("terraform");
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [org, setOrg] = useState<Organization | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [provider, setProvider] = useState<CloudProvider>("aws");

  useEffect(() => {
    if (!params.orgId || !params.projectId) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const foundOrg = getOrganization(params.orgId);
    const foundProject = foundOrg ? getProject(params.orgId, params.projectId) : undefined;

    if (!foundOrg || !foundProject) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setOrg(foundOrg);
    setProject(foundProject);

    const canvasState = getCanvasState(params.projectId);
    setProvider(canvasState.provider);
    setOutputFormat(canvasState.outputFormat);
  }, [params.orgId, params.projectId, navigate]);

  const handleProviderChange = (newProvider: CloudProvider) => {
    setProvider(newProvider);
    const defaultRegion = providers.find((p) => p.id === newProvider)!.defaultRegion;
    if (params.projectId) {
      updateCanvasProvider(params.projectId, newProvider, defaultRegion);
    }
  };

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
            <span className="text-[14px] font-semibold text-white">CloudiFlow-9000</span>
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
          {/* Provider toggle */}
          <div className="flex items-center gap-1 bg-[#111] rounded-full p-1 border border-[#1a1a1a]">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  provider === p.id
                    ? "bg-[#f38020] text-white shadow-[0_0_10px_rgba(243,128,32,0.2)]"
                    : "text-[#666] hover:text-[#ccc]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Format toggle */}
          <div className="flex items-center gap-1 bg-[#111] rounded-full p-1 border border-[#1a1a1a]">
            {(["terraform", "pulumi", "ansible"] as const).map((format) => (
              <button
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

          <button className="px-4 py-1.5 bg-gradient-to-r from-[#f38020] to-[#e06000] hover:from-[#ff9030] hover:to-[#f07010] text-white rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(243,128,32,0.15)]">
            <Play className="w-3 h-3" />
            Deploy
          </button>
        </div>
      </header>

      <main className="h-[calc(100vh-3.5rem)]">
        <Canvas
          outputFormat={outputFormat}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          provider={provider}
        />
      </main>
    </div>
  );
}
