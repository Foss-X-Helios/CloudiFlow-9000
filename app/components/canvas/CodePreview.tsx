import { Copy, Download, FileCode } from "lucide-react";
import { useMemo, useState } from "react";
import { generateCode } from "~/lib/iac-generator";
import type { CanvasNode, Edge } from "~/types";

interface CodePreviewProps {
  nodes: CanvasNode[];
  edges: Edge[];
  format: "terraform" | "pulumi" | "ansible";
}

export function CodePreview({ nodes, edges, format }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    return generateCode(nodes, edges, format);
  }, [nodes, edges, format]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      terraform: ".tf",
      pulumi: ".ts",
      ansible: ".yml",
    };
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cloudforge-infra${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-96 bg-[#1a1a1a] border-l border-[#333333] flex flex-col">
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#666666]" />
            <h2 className="text-[13px] font-medium text-[#e3e3e3]">
              Generated Code
            </h2>
          </div>
          <span className="text-[10px] font-medium px-2 py-1 bg-[#252525] rounded text-[#f38020] uppercase">
            {format}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-[#111111]">
          <pre className="text-[12px] text-[#9b9b9b] font-mono whitespace-pre-wrap break-words leading-relaxed">
            {generatedCode}
          </pre>
        </div>

        <div className="p-4 border-t border-[#333333] space-y-2">
          {nodes.length > 0 ? (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full px-4 py-2 bg-[#f38020] hover:bg-[#e07010] text-white rounded text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-[#252525] hover:bg-[#333333] text-[#e3e3e3] rounded text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {format.toUpperCase()} File
              </button>
            </>
          ) : (
            <div className="text-center text-[13px] text-[#666666] py-4">
              Add components to generate code
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
