import { Server } from "lucide-react";
import { cloudComponents } from "~/lib/components";
import { iconMap } from "~/lib/icons";
import type { CloudComponent, CloudProvider, ComponentCategory } from "~/types";

interface ComponentPanelProps {
  provider: CloudProvider;
  onDragStart: (component: CloudComponent) => void;
}

const categoryLabels: Record<ComponentCategory, string> = {
  compute: "Compute",
  network: "Network",
  storage: "Storage",
  database: "Database",
  security: "Security",
  dns: "DNS",
};

const categoryOrder: ComponentCategory[] = [
  "compute",
  "network",
  "storage",
  "database",
  "security",
  "dns",
];

export function ComponentPanel({ provider, onDragStart }: ComponentPanelProps) {
  const components = cloudComponents[provider] || [];

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
    <div className="h-full w-56 bg-[#1a1a1a] border-r border-[#333333] overflow-y-auto">
      <div className="p-3 border-b border-[#333333]">
        <h2 className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wider">
          Components
        </h2>
      </div>

      <div className="p-2">
        {Object.entries(componentsByCategory).map(
          ([category, categoryComponents]) => (
            <div key={category} className="mb-3">
              <h3 className="text-[10px] font-medium text-[#666666] uppercase tracking-wider px-2 mb-1">
                {categoryLabels[category as ComponentCategory]}
              </h3>
              <div className="space-y-0.5">
                {categoryComponents.map((component) => {
                  const IconComponent = iconMap[component.icon] || Server;
                  return (
                    <button
                      type="button"
                      key={component.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(component),
                        );
                        e.dataTransfer.effectAllowed = "copy";
                        onDragStart(component);
                      }}
                      className="w-full text-left px-2 py-2 rounded hover:bg-[#252525] transition-colors cursor-grab active:cursor-grabbing flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded bg-[#252525] flex items-center justify-center group-hover:bg-[#333333] transition-colors">
                        <IconComponent className="w-4 h-4 text-[#f38020]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#e3e3e3] truncate">
                          {component.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
