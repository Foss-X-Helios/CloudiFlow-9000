import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import { memo } from "react";
import { cloudIconMap } from "~/lib/cloud-icons";
import { iconMap } from "~/lib/icons";
import type { CanvasNode, ComponentCategory } from "~/types";

const categoryColors: Record<ComponentCategory, string> = {
  compute: "text-blue-400 bg-blue-400/10",
  network: "text-emerald-400 bg-emerald-400/10",
  storage: "text-amber-400 bg-amber-400/10",
  database: "text-purple-400 bg-purple-400/10",
  security: "text-red-400 bg-red-400/10",
  dns: "text-cyan-400 bg-cyan-400/10",
};

function CloudNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const { component, label } = data;
  const CloudIcon = cloudIconMap[component.id];
  const IconComponent = CloudIcon ?? iconMap[component.icon] ?? Server;
  const catColor =
    categoryColors[component.category] || "text-[#888] bg-[#252525]";

  return (
    <div
      className={`cloud-node relative px-4 py-3 rounded-xl border transition-all duration-200 min-w-[140px] ${
        selected
          ? "border-[#f38020] bg-[#1a1a1a] shadow-[0_0_25px_rgba(243,128,32,0.15)]"
          : "border-[#2a2a2a] bg-[#161616] hover:border-[#f38020]/40 shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !-top-1.5"
      />

      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            selected ? "bg-[#f38020]/15" : "bg-[#252525]"
          }`}
        >
          <IconComponent
            className={`w-4 h-4 ${selected ? "text-[#f38020]" : catColor.split(" ")[0]}`}
          />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#e3e3e3] truncate">
            {label}
          </div>
          <span
            className={`inline-block text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded ${catColor}`}
          >
            {component.category}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !-bottom-1.5"
      />
    </div>
  );
}

export const CloudNode = memo(CloudNodeComponent);
