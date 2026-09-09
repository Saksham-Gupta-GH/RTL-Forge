"use client";

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/editorStore';
import { LogicNode } from './nodes/GateNode';

const nodeTypes = {
  logicNode: LogicNode,
};

function Flow() {
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const onNodesChange = useEditorStore(state => state.onNodesChange);
  const onEdgesChange = useEditorStore(state => state.onEdgesChange);
  const onConnect = useEditorStore(state => state.onConnect);
  const addNode = useEditorStore(state => state.addNode);
  const deleteSelection = useEditorStore(state => state.deleteSelection);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const defId = event.dataTransfer.getData('application/reactflow/defId');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position, defId || undefined);
    },
    [screenToFlowPosition, addNode],
  );

  return (
    <div className="w-full h-full bg-gray-50" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={(deleted) => deleteSelection(deleted.map(n => n.id), [])}
        onEdgesDelete={(deleted) => deleteSelection([], deleted.map(e => e.id))}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="light"
      >
        <Background color="#cbd5e1" gap={16} size={1.5} />
        <Controls className="bg-white border-gray-200 shadow-sm" />
        <MiniMap 
          nodeStrokeColor="#64748b" 
          nodeColor="#cbd5e1" 
          maskColor="rgba(241, 245, 249, 0.7)" 
          className="bg-white border border-gray-200 shadow-sm rounded-md"
        />
      </ReactFlow>
    </div>
  );
}

export function CircuitCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
