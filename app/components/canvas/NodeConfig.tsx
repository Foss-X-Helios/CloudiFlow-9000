import { Server, X } from "lucide-react";
import { iconMap } from "~/lib/icons";
import type { CanvasNode } from "~/types";

interface NodeConfigProps {
  node: CanvasNode | null;
  onUpdate: (nodeId: string, data: Partial<CanvasNode["data"]>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeConfig({
  node,
  onUpdate,
  onDelete,
  onClose,
}: NodeConfigProps) {
  if (!node) return null;

  const { component, config, label } = node.data;
  const IconComponent = iconMap[component.icon] || Server;

  const handleChange = (
    fieldName: string,
    value: string | number | boolean,
  ) => {
    onUpdate(node.id, {
      config: { ...config, [fieldName]: value },
    });
  };

  const handleLabelChange = (newLabel: string) => {
    onUpdate(node.id, { label: newLabel });
  };

  return (
    <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-[#111] border-l border-[#222] shadow-[-4px_0_30px_rgba(0,0,0,0.5)] flex flex-col z-40 animate-slide-in">
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#f38020]/10 flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-4.5 h-4.5 text-[#f38020]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-white truncate">
              {component.name}
            </h3>
            <p className="text-[11px] text-[#555] truncate">
              {component.description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#555] hover:text-white hover:bg-[#222] rounded-lg transition-colors flex-shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label
            htmlFor="node-resource-name"
            className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-1.5"
          >
            Resource Name
          </label>
          <input
            id="node-resource-name"
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-[13px] text-white focus:outline-none focus:border-[#f38020] transition-colors"
          />
        </div>

        {component.fields.length > 0 && (
          <div>
            <p className="block text-[11px] font-medium text-[#888] uppercase tracking-wider mb-3">
              Configuration
            </p>
            <div className="space-y-3">
              {component.fields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="block text-[12px] text-[#888] mb-1.5"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-[#f38020] ml-0.5">*</span>
                    )}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={`field-${field.name}`}
                      value={String(config[field.name] ?? field.default ?? "")}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-[13px] text-white focus:outline-none focus:border-[#f38020] transition-colors"
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <label className="flex items-center gap-2.5 cursor-pointer py-1">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={Boolean(config[field.name] ?? field.default)}
                          onChange={(e) =>
                            handleChange(field.name, e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#222] rounded-full peer-checked:bg-[#f38020] transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                      </div>
                      <span className="text-[13px] text-[#ccc]">
                        {config[field.name] ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  ) : field.type === "number" ? (
                    <input
                      id={`field-${field.name}`}
                      type="number"
                      value={String(config[field.name] ?? field.default ?? "")}
                      onChange={(e) =>
                        handleChange(field.name, Number(e.target.value))
                      }
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-[13px] text-white focus:outline-none focus:border-[#f38020] transition-colors"
                    />
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type="text"
                      value={String(config[field.name] ?? field.default ?? "")}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-[13px] text-white focus:outline-none focus:border-[#f38020] transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#222]">
        <button
          type="button"
          onClick={() => onDelete(node.id)}
          className="w-full px-4 py-2.5 bg-transparent hover:bg-red-500/10 text-red-500 border border-red-500/30 hover:border-red-500/50 rounded-lg text-[13px] font-medium transition-all"
        >
          Delete Component
        </button>
      </div>
    </div>
  );
}
