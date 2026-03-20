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
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";

import { ComponentPanel } from "~/components/panel/ComponentPanel";
import { isValidConnection as checkValidConnection } from "~/lib/connection-rules";
import type { CanvasNode, CloudComponent, CloudProvider } from "~/types";
import { CloudNode } from "./CloudNode";
import { CodePreview } from "./CodePreview";
import { ContainerNode } from "./ContainerNode";
import { NodeConfig } from "./NodeConfig";

const initialNodes: CanvasNode[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = { cloud: CloudNode, container: ContainerNode };

const containerSizes: Record<number, { width: number; height: number }> = {
  1: { width: 700, height: 500 },
  2: { width: 600, height: 400 },
  3: { width: 500, height: 350 },
  4: { width: 350, height: 250 },
};

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
  const rfInstance = useRef<ReactFlowInstance | null>(null);

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

      // Use ReactFlow instance for accurate flow coordinates
      let position: { x: number; y: number };
      if (rfInstance.current) {
        position = rfInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
      } else {
        const bounds = event.currentTarget.getBoundingClientRect();
        position = {
          x: event.clientX - bounds.left - 75,
          y: event.clientY - bounds.top - 25,
        };
      }

      const isContainer = component.isContainer === true;
      const containerLevel = component.containerLevel ?? 0;

      nodeIdCounter++;

      // Find the innermost container at the drop point for auto-parenting
      let parentId: string | undefined;
      if (!isContainer || containerLevel > 1) {
        // Find all container nodes that contain the drop point
        const containersAtPoint = nodes
          .filter((n) => {
            const comp = (n as CanvasNode).data?.component;
            if (!comp?.isContainer) return false;
            // For container-in-container, child level must be higher
            if (isContainer && (comp.containerLevel ?? 0) >= containerLevel)
              return false;
            const nodeWidth =
              (n.measured?.width ??
                containerSizes[comp.containerLevel ?? 3]?.width) ||
              500;
            const nodeHeight =
              (n.measured?.height ??
                containerSizes[comp.containerLevel ?? 3]?.height) ||
              350;
            // Check if drop point is within this container's bounds
            // For child nodes, position is relative to parent — we need absolute position
            const absPos = getAbsolutePosition(n, nodes);
            return (
              position.x >= absPos.x &&
              position.x <= absPos.x + nodeWidth &&
              position.y >= absPos.y &&
              position.y <= absPos.y + nodeHeight
            );
          })
          .sort(
            (a, b) =>
              ((b as CanvasNode).data?.component?.containerLevel ?? 0) -
              ((a as CanvasNode).data?.component?.containerLevel ?? 0),
          );

        if (containersAtPoint.length > 0) {
          const parent = containersAtPoint[0];
          parentId = parent.id;
          // Convert position to be relative to the parent
          const parentAbsPos = getAbsolutePosition(parent, nodes);
          position = {
            x: position.x - parentAbsPos.x,
            y: position.y - parentAbsPos.y,
          };
        }
      }

      const newNode: CanvasNode = {
        id: `${component.id}-${nodeIdCounter}`,
        type: isContainer ? "container" : "cloud",
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
        ...(isContainer
          ? {
              style: {
                width: containerSizes[containerLevel]?.width ?? 500,
                height: containerSizes[containerLevel]?.height ?? 350,
              },
            }
          : {}),
        ...(parentId
          ? {
              parentId,
              extent: "parent" as const,
              expandParent: true,
            }
          : {}),
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
    },
    [setNodes, nodes],
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

  const validateConnection = useCallback(
    (connection: Edge | Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source) as
        | CanvasNode
        | undefined;
      const targetNode = nodes.find((n) => n.id === connection.target) as
        | CanvasNode
        | undefined;

      if (!sourceNode || !targetNode) return false;

      // Prevent self-connections
      if (connection.source === connection.target) return false;

      return checkValidConnection(
        sourceNode.data.component,
        targetNode.data.component,
      );
    },
    [nodes],
  );

  const onNodeDelete = useCallback(
    (nodeId: string) => {
      // Cascade delete: find all descendants recursively
      const toDelete = new Set<string>();
      function collectDescendants(id: string) {
        toDelete.add(id);
        for (const n of nodes) {
          if (n.parentId === id && !toDelete.has(n.id)) {
            collectDescendants(n.id);
          }
        }
      }
      collectDescendants(nodeId);

      setNodes((nds) => nds.filter((node) => !toDelete.has(node.id)));
      setEdges((eds) =>
        eds.filter(
          (edge) => !toDelete.has(edge.source) && !toDelete.has(edge.target),
        ),
      );
      setSelectedNodeId(null);
    },
    [setNodes, setEdges, nodes],
  );

  return (
    <div className="flex h-full w-full">
      <ComponentPanel provider={provider} />

      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={(instance) => {
              rfInstance.current = instance;
            }}
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
            isValidConnection={validateConnection}
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
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#f38020]/10 flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-[#f38020]/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Add components"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-[#555] text-[14px] font-medium mb-1">
                    Drag components from the left panel
                  </div>
                  <div className="text-[#333] text-[12px]">
                    Connect them by dragging between the handles
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <CodePreview nodes={nodes as CanvasNode[]} format={outputFormat} />
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

/** Get absolute position of a node (accounting for nested parents) */
function getAbsolutePosition(
  node: CanvasNode,
  allNodes: CanvasNode[],
): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let current = node;
  while (current.parentId) {
    const parent = allNodes.find((n) => n.id === current.parentId) as
      | CanvasNode
      | undefined;
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    current = parent;
  }
  return { x, y };
}
