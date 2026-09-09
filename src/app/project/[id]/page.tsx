"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { CircuitCanvas } from '@/components/editor/CircuitCanvas';
import { Inspector } from '@/components/editor/Inspector';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';
import { Play, Square } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

export default function SharedProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setProjectInfo = useEditorStore(state => state.setProjectInfo);
  const setNodes = useEditorStore(state => state.setNodes);
  const setEdges = useEditorStore(state => state.setEdges);
  const evaluateCombinational = useEditorStore(state => state.evaluateCombinational);
  
  const isSimulating = useEditorStore(state => state.isSimulating);
  const startSimulation = useEditorStore(state => state.startSimulation);
  const stopSimulation = useEditorStore(state => state.stopSimulation);
  const projectName = useEditorStore(state => state.projectName);

  useEffect(() => {
    // Shared view does not send sessionId (so it relies on project being public)
    fetch(`/api/projects/${id}`)
      .then(res => {
        if (res.status === 404) throw new Error('Project not found');
        if (res.status === 401) throw new Error('This project is not public');
        if (!res.ok) throw new Error('Failed to load project');
        return res.json();
      })
      .then(data => {
        setProjectInfo({
          id: data.id,
          name: data.name,
          description: data.description,
          isPublic: data.isPublic
        });
        
        const flowNodes = data.circuit.nodes.map((n: any) => ({
          ...n,
          type: 'logicNode',
          draggable: false, // Make read-only
          selectable: true,
          data: n
        }));
        
        const flowEdges = data.circuit.connections.map((c: any) => ({
          id: c.id,
          source: c.sourceNodeId,
          sourceHandle: c.sourcePortId,
          target: c.targetNodeId,
          targetHandle: c.targetPortId,
          animated: true,
          deletable: false, // Make read-only
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
        useEditorStore.setState(state => {
          state.componentDefinitions = data.componentDefinitions || [];
        });
        
        setTimeout(() => evaluateCombinational(), 50);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, setProjectInfo, setNodes, setEdges, evaluateCombinational]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">Loading project...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-slate-950 text-red-400">{error}</div>;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-950 text-slate-200 font-sans">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 text-slate-300">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold text-white tracking-wider flex items-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded-sm"></div>
            <span>RTLForge</span>
          </Link>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <span className="font-medium text-sm text-slate-200">{projectName} <span className="bg-slate-800 text-xs px-2 py-0.5 rounded ml-2 text-slate-400">Read-Only</span></span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className={clsx(
              "flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-medium transition-colors border",
              isSimulating 
                ? "bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50" 
                : "bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/50"
            )}
            onClick={isSimulating ? stopSimulation : startSimulation}
          >
            {isSimulating ? (
              <>
                <Square size={16} />
                <span>Stop Simulation</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
            <CircuitCanvas />
          </div>
          <SimulationPanel />
        </main>
        <Inspector />
      </div>
    </div>
  );
}
