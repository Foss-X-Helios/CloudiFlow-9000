import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import { memo } from "react";
import { Tooltip } from "~/components/ui/Tooltip";
import { cloudIconMap } from "~/lib/cloud-icons";
import { cloudComponents } from "~/lib/components";
import { iconMap } from "~/lib/icons";
import type { CanvasNode, ComponentCategory } from "~/types";

const categoryColors: Record<ComponentCategory, string> = {
  infrastructure: "text-orange-400 bg-orange-400/10",
  compute: "text-blue-400 bg-blue-400/10",
  network: "text-emerald-400 bg-emerald-400/10",
  storage: "text-amber-400 bg-amber-400/10",
  database: "text-purple-400 bg-purple-400/10",
  security: "text-red-400 bg-red-400/10",
  dns: "text-cyan-400 bg-cyan-400/10",
};

/** Cache: which component IDs are referenced as a target by any other component */
const hasInputCache = new Map<string, boolean>();
function componentHasInput(componentId: string, provider: string): boolean {
  const key = `${provider}:${componentId}`;
  if (hasInputCache.has(key)) return hasInputCache.get(key)!;
  const allComponents =
    cloudComponents[provider as keyof typeof cloudComponents] || [];
  const result = allComponents.some((c) => c.connectsTo.includes(componentId));
  hasInputCache.set(key, result);
  return result;
}

function CloudNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const { component, label } = data;
  const CloudIcon = cloudIconMap[component.id];
  const IconComponent = CloudIcon ?? iconMap[component.icon] ?? Server;
  const catColor =
    categoryColors[component.category] || "text-[#888] bg-[#252525]";

  const hasOutput = component.connectsTo.length > 0;
  const hasInput = componentHasInput(component.id, component.provider);

  return (
    <Tooltip
      content={{
        name: component.name,
        description: component.description,
        useCase: component.useCase,
        icon: <IconComponent width={18} height={18} />,
      }}
    >
      <div className="flex flex-col items-center">
        {/* Node body — icon only */}
        <div
          className={`cloud-node relative rounded-xl border transition-all duration-200 w-12 h-12 flex items-center justify-center ${
            selected
              ? "border-[#f38020] bg-[#1a1a1a] shadow-[0_0_25px_rgba(243,128,32,0.15)]"
              : "border-[#2a2a2a] bg-[#161616] hover:border-[#f38020]/40 shadow-[0_12px_35px_rgba(0,0,0,0.45)]"
          }`}
        >
          {hasInput && (
            <Handle
              type="target"
              position={Position.Left}
              className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !top-1/2 !-translate-y-1/2 !-left-1.5"
            />
          )}

          <IconComponent
            width={24}
            height={24}
            className={`w-6 h-6 ${selected ? "text-[#f38020]" : catColor.split(" ")[0]}`}
          />

          {hasOutput && (
            <Handle
              type="source"
              position={Position.Right}
              className="!w-3 !h-3 !bg-[#1a1a1a] !border-2 !border-[#f38020] hover:!bg-[#f38020] hover:!scale-125 !transition-all !duration-150 !top-1/2 !-translate-y-1/2 !-right-1.5"
            />
          )}
        </div>

        {/* Label below the node */}
        <div className="mt-1.5 text-center max-w-[90px]">
          <div className="text-[11px] font-medium text-[#ccc] truncate">
            {label}
          </div>
        </div>
      </div>
    </Tooltip>
  );
}

export const CloudNode = memo(CloudNodeComponent);
