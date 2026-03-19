import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import { iconMap } from "~/lib/icons";
import type { CanvasNode } from "~/types";

function CloudNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const { component, label } = data;
  const IconComponent = iconMap[component.icon] || Server;

  return (
    <div
      className={`cloud-node relative px-4 py-3 rounded-xl border transition-all duration-200 min-w-[140px] ${
        selected
          ? "border-[#f38020] bg-[#1a1a1a] shadow-[0_0_25px_rgba(243,128,32,0.15)]"
          : "border-[#2a2a2a] bg-[#161616] hover:border-[#f38020]/40 shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
      }`}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !-top-1.5"
      />

      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          selected ? "bg-[#f38020]/15" : "bg-[#252525]"
        }`}>
          <IconComponent className="w-4 h-4 text-[#f38020]" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#e3e3e3] truncate">{label}</div>
          <div className="text-[10px] text-[#666] uppercase tracking-wide">{component.category}</div>
        </div>
      </div>

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !-bottom-1.5"
      />
    </div>
  );
}

export const CloudNode = memo(CloudNodeComponent);
