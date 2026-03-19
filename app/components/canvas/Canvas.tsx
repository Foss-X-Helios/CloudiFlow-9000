import {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  MarkerType,
  MiniMap,
  type OnSelectionChangeParams,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";

import { ComponentPanel } from "~/components/panel/ComponentPanel";
import type { CanvasNode, CloudComponent, CloudProvider } from "~/types";
import { CloudNode } from "./CloudNode";
import { CodePreview } from "./CodePreview";
import { NodeConfig } from "./NodeConfig";

const initialNodes: CanvasNode[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = { cloud: CloudNode };

let nodeIdCounter = 0;

interface CanvasProps {
  outputFormat: "terraform" | "pulumi" | "ansible";
  onNodesChange: (nodes: CanvasNode[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  provider: CloudProvider;
}

export function Canvas({
  outputFormat,
  onNodesChange,
  onEdgesChange,
  provider,
}: CanvasProps) {
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () =>
      selectedNodeId
        ? (nodes.find((n) => n.id === selectedNodeId) as CanvasNode | undefined)
        : undefined,
    [nodes, selectedNodeId],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#f38020", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#f38020",
              width: 16,
              height: 16,
            },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      setSelectedNodeId(
        selectedNodes.length === 1 ? selectedNodes[0].id : null,
      );
    },
    [],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData("application/json");
      if (!data) return;

      const component: CloudComponent = JSON.parse(data);

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 75,
        y: event.clientY - bounds.top - 25,
      };

      nodeIdCounter++;
      const newNode: CanvasNode = {
        id: `${component.id}-${nodeIdCounter}`,
        type: "cloud",
        position,
        data: {
          component,
          label: `${component.name} ${nodeIdCounter}`,
          config: component.fields.reduce(
            (acc, field) => {
              acc[field.name] = field.default ?? "";
              return acc;
            },
            {} as Record<string, string | number | boolean>,
          ),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
    },
    [setNodes],
  );

  const onNodeUpdate = useCallback(
    (nodeId: string, newData: Partial<CanvasNode["data"]>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  const onNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      );
      setSelectedNodeId(null);
    },
    [setNodes, setEdges],
  );

  const handleDragStart = (_component: CloudComponent) => {};

  return (
    <div className="flex h-full w-full">
      <ComponentPanel provider={provider} onDragStart={handleDragStart} />

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={(changes) => {
              onNodesChangeHandler(changes);
              const updatedNodes = [...nodes];
              changes.forEach((change) => {
                if (
                  change.type === "position" &&
                  change.position &&
                  change.id
                ) {
                  const idx = updatedNodes.findIndex((n) => n.id === change.id);
                  if (idx !== -1) {
                    updatedNodes[idx] = {
                      ...updatedNodes[idx],
                      position: change.position,
                    };
                  }
                }
              });
              onNodesChange(updatedNodes as CanvasNode[]);
            }}
            onEdgesChange={(changes) => {
              onEdgesChangeHandler(changes);
              onEdgesChange(edges);
            }}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="bg-[#0d0d0d]"
            connectionLineStyle={{
              stroke: "#f38020",
              strokeWidth: 2,
              strokeDasharray: "6 3",
            }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "#f38020", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#f38020",
                width: 16,
                height: 16,
              },
            }}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
          >
            <Controls
              className="!bg-[#1a1a1a] !border-[#2a2a2a] !rounded-lg !shadow-lg"
              showInteractive={false}
            />
            <MiniMap
              className="!bg-[#1a1a1a] !border !border-[#2a2a2a] !rounded-lg"
              nodeColor="#f38020"
              maskColor="rgba(0, 0, 0, 0.8)"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#1f1f1f"
            />
          </ReactFlow>

          {/* Empty state hint */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[#333] text-[14px] font-medium mb-1">
                  Drag components from the left panel
                </div>
                <div className="text-[#2a2a2a] text-[12px]">
                  Connect them by dragging between the handles
                </div>
              </div>
            </div>
          )}
        </div>

        <CodePreview
          nodes={nodes as CanvasNode[]}
          edges={edges}
          format={outputFormat}
        />
      </div>

      {/* Config panel — slides in when a node is selected */}
      <NodeConfig
        node={selectedNode ?? null}
        onUpdate={onNodeUpdate}
        onDelete={onNodeDelete}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
