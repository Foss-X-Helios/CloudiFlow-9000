import { AlertCircle, Copy, DollarSign, Download, FileCode, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_EXPORT_FILENAME } from "~/lib/constants";
import { estimateCost, estimateCostAsync } from "~/lib/cost-estimator";
import { generateCode, generateCodeAsync } from "~/lib/iac-generator";
import type { CanvasNode, CostEstimate, Edge } from "~/types";

interface CodePreviewProps {
  nodes: CanvasNode[];
  edges: Edge[];
  format: "terraform" | "pulumi";
  projectId: string;
}

type PanelTab = "code" | "cost";

export function CodePreview({ nodes, edges, format, projectId }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("code");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [asyncCode, setAsyncCode] = useState<string>("");
  const [asyncCost, setAsyncCost] = useState<CostEstimate | null>(null);

  useEffect(() => {
    if (nodes.length === 0) {
      setAsyncCode("");
      setAsyncCost(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [codeRes, costRes] = await Promise.all([
          generateCodeAsync(nodes, edges),
          estimateCostAsync(nodes),
        ]);
        setAsyncCode(codeRes.hcl);
        setAsyncCost(costRes);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data from backend");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500); // Debounce
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  const generatedCode = asyncCode || generateCode(nodes, format);
  const costEstimate = asyncCost || estimateCost(nodes);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      terraform: ".tf",
      pulumi: ".ts",
    };
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${DEFAULT_EXPORT_FILENAME}${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-96 bg-[#1a1a1a] border-l border-[#333333] flex flex-col">
      {/* Tab header */}
      <div className="p-3 border-b border-[#333333]">
        <div className="flex items-center bg-[#111] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${
              activeTab === "code"
                ? "bg-[#252525] text-white"
                : "text-[#666] hover:text-[#aaa]"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Code
            <span className="text-[10px] px-1.5 py-0.5 bg-[#333] rounded text-[#f38020] uppercase">
              {format}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cost")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${
              activeTab === "cost"
                ? "bg-[#252525] text-white"
                : "text-[#666] hover:text-[#aaa]"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Cost
            {costEstimate.totalMonthly > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#333] rounded text-emerald-400">
                ${costEstimate.totalMonthly.toFixed(0)}/mo
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "code" ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 bg-[#111111] scrollbar-hide">
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
                    aria-label="Copy code to clipboard"
                    className="w-full px-4 py-2 bg-[#f38020] hover:bg-[#e07010] text-white rounded text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    aria-label="Download generated code"
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
          </>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {costEstimate.items.length > 0 ? (
              <>
                {/* Cost line items */}
                <div className="p-4 space-y-2">
                  {costEstimate.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-[#111] rounded-lg border border-[#222]"
                    >
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-[#ddd] truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#666]">
                          {item.service}
                          {item.detail !== "Pay-per-use" &&
                            item.detail !== "Base cost" && (
                              <span className="text-[#555]">
                                {" "}
                                · {item.detail}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        {item.monthlyCost > 0 ? (
                          <span className="text-[13px] font-semibold text-emerald-400">
                            ${item.monthlyCost.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#555]">
                            Free / Pay-per-use
                          </span>
                        )}
                        {item.monthlyCost > 0 && (
                          <div className="text-[9px] text-[#555]">/month</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="p-4 border-t border-[#333] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#888]">
                      Monthly estimate
                    </span>
                    <span className="text-[18px] font-bold text-white">
                      ${costEstimate.totalMonthly.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#888]">
                      Yearly estimate
                    </span>
                    <span className="text-[14px] font-semibold text-[#aaa]">
                      ${costEstimate.totalYearly.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#555] leading-relaxed mt-2">
                    Estimates based on on-demand pricing for the default region.
                    Actual costs may vary based on usage, reserved instances,
                    and data transfer.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <DollarSign className="w-8 h-8 text-[#333] mb-3" />
                <p className="text-[13px] text-[#666]">
                  Add components to see cost estimates
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
