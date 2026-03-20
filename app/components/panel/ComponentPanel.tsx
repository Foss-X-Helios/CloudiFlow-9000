import { ChevronDown, ChevronRight, Server } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "~/components/ui/Tooltip";
import { cloudIconMap } from "~/lib/cloud-icons";
import { cloudComponents } from "~/lib/components";
import { iconMap } from "~/lib/icons";
import type { CloudComponent, CloudProvider, ComponentCategory } from "~/types";

interface ComponentPanelProps {
  provider: CloudProvider;
}

const categoryLabels: Record<ComponentCategory, string> = {
  infrastructure: "Infrastructure",
  compute: "Compute",
  network: "Network",
  storage: "Storage",
  database: "Database",
  security: "Security",
  dns: "DNS",
};

const categoryOrder: ComponentCategory[] = [
  "infrastructure",
  "compute",
  "network",
  "storage",
  "database",
  "security",
  "dns",
];

export function ComponentPanel({ provider }: ComponentPanelProps) {
  const components = cloudComponents[provider] || [];
  const [collapsed, setCollapsed] = useState<Set<ComponentCategory>>(new Set());

  const toggleCategory = (category: ComponentCategory) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const componentsByCategory = categoryOrder.reduce(
    (acc, category) => {
      const categoryComponents = components.filter(
        (c) => c.category === category,
      );
      if (categoryComponents.length > 0) {
        acc[category] = categoryComponents;
      }
      return acc;
    },
    {} as Record<ComponentCategory, CloudComponent[]>,
  );

  return (
    <div className="h-full w-56 bg-[#1a1a1a] border-r border-[#333333] overflow-y-auto scrollbar-hide">
      <div className="p-3 border-b border-[#333333]">
        <h2 className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider">
          Components
        </h2>
      </div>

      <div className="p-2">
        {Object.entries(componentsByCategory).map(
          ([category, categoryComponents]) => (
            <div key={category} className="mb-1">
              <button
                type="button"
                onClick={() => toggleCategory(category as ComponentCategory)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#252525] transition-colors group"
              >
                <h3 className="text-[10px] font-medium text-[#666666] uppercase tracking-wider group-hover:text-[#888]">
                  {categoryLabels[category as ComponentCategory]}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#444] font-medium">
                    {categoryComponents.length}
                  </span>
                  {collapsed.has(category as ComponentCategory) ? (
                    <ChevronRight className="w-3 h-3 text-[#555]" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-[#555]" />
                  )}
                </div>
              </button>

              {!collapsed.has(category as ComponentCategory) && (
                <div className="space-y-0.5 mt-0.5">
                  {categoryComponents.map((component) => {
                    const CloudIcon = cloudIconMap[component.id];
                    const IconComponent =
                      CloudIcon ?? iconMap[component.icon] ?? Server;
                    return (
                      <Tooltip
                        key={component.id}
                        position="right"
                        content={{
                          name: component.name,
                          description: component.description,
                          useCase: component.useCase,
                          icon: <IconComponent width={16} height={16} />,
                        }}
                      >
                        <button
                          type="button"
                          aria-label={`Drag ${component.name} to canvas`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "application/json",
                              JSON.stringify(component),
                            );
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          className="w-full text-left px-2 py-2 rounded hover:bg-[#252525] transition-colors cursor-grab active:cursor-grabbing flex items-center gap-3 group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded bg-[#252525] flex items-center justify-center group-hover:bg-[#333333] transition-colors">
                            <IconComponent
                              width={16}
                              height={16}
                              className="w-4 h-4 text-[#f38020]"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-[#e3e3e3] truncate">
                              {component.name}
                            </p>
                            <p className="text-[10px] text-[#555] truncate">
                              {component.description}
                            </p>
                          </div>
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
