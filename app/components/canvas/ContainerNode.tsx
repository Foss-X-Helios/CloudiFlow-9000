import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import { memo } from "react";
import { cloudIconMap } from "~/lib/cloud-icons";
import { iconMap } from "~/lib/icons";
import type { CanvasNode } from "~/types";

const levelStyles: Record<
  number,
  { border: string; bg: string; borderStyle: string }
> = {
  1: {
    border: "border-[#555]",
    bg: "bg-[#1a1a1a]/40",
    borderStyle: "border-solid",
  },
  2: {
    border: "border-[#666]",
    bg: "bg-[#1e1e2e]/30",
    borderStyle: "border-dashed",
  },
  3: {
    border: "border-teal-600/60",
    bg: "bg-teal-900/10",
    borderStyle: "border-solid",
  },
  4: {
    border: "border-[#555]/50",
    bg: "bg-[#222]/20",
    borderStyle: "border-dotted",
  },
};

const providerBadgeColors: Record<string, string> = {
  aws: "bg-[#FF9900]/15 text-[#FF9900]",
  gcp: "bg-[#4285F4]/15 text-[#4285F4]",
  azure: "bg-[#0078D4]/15 text-[#0078D4]",
};

function ContainerNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const { component, label, config } = data;
  const level = component.containerLevel ?? 3;
  const style = levelStyles[level] || levelStyles[3];
  const CloudIcon = cloudIconMap[component.id];
  const IconComponent = CloudIcon ?? iconMap[component.icon] ?? Server;
  const badgeColor =
    providerBadgeColors[component.provider] || providerBadgeColors.aws;

  const regionLabel =
    (config.regionName as string) ||
    (config.azName as string) ||
    (config.zoneName as string) ||
    (config.name as string) ||
    "";

  return (
    <div
      className={`rounded-lg border-2 ${style.border} ${style.borderStyle} ${style.bg} min-h-full min-w-full ${
        selected
          ? "!border-[#f38020] shadow-[0_0_20px_rgba(243,128,32,0.12)]"
          : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !top-5 !-left-1.5"
      />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-inherit rounded-t-lg bg-[#111]/60">
        <IconComponent
          width={16}
          height={16}
          className="w-4 h-4 flex-shrink-0"
        />
        <span className="text-[12px] font-semibold text-[#ddd] truncate">
          {label}
        </span>
        <span
          className={`text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded ${badgeColor}`}
        >
          {component.provider}
        </span>
        {regionLabel && (
          <span className="text-[10px] text-[#888] ml-auto truncate">
            {regionLabel}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !top-5 !-right-1.5"
      />
    </div>
  );
}

export const ContainerNode = memo(ContainerNodeComponent);
