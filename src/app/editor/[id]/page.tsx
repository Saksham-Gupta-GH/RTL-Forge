"use client";

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { CircuitCanvas } from '@/components/editor/CircuitCanvas';
import { ComponentSidebar } from '@/components/editor/ComponentSidebar';
import { Inspector } from '@/components/editor/Inspector';
import { Toolbar } from '@/components/editor/Toolbar';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const setProjectInfo = useEditorStore(state => state.setProjectInfo);
  const setNodes = useEditorStore(state => state.setNodes);
  const setEdges = useEditorStore(state => state.setEdges);
  const evaluateCombinational = useEditorStore(state => state.evaluateCombinational);

  useEffect(() => {
    const isGuest = localStorage.getItem('rtlforge_isGuest') === 'true';
    if (isGuest) {
      router.push('/editor/sandbox');
      return;
    }

    const sessionId = localStorage.getItem('rtlforge_session');
    if (!sessionId) {
      router.push('/login');
      return;
    }

    fetch(`/api/projects/${id}?sessionId=${sessionId}`)
      .then(res => {
        if (res.status === 404) throw new Error('Project not found');
        if (res.status === 401) throw new Error('Unauthorized');
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
        
        // Transform domain models to React Flow models
        const flowNodes = data.circuit.nodes.map((n: any) => ({
          id: n.id,
          type: 'logicNode',
          position: n.position,
          data: n
        }));
        
        const flowEdges = data.circuit.connections.map((c: any) => ({
          id: c.id,
          source: c.sourceNodeId,
          sourceHandle: c.sourcePortId,
          target: c.targetNodeId,
          targetHandle: c.targetPortId
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
        // Note: component definitions and simulation settings should also be synced if we added them to setProjectInfo
        
        setTimeout(() => evaluateCombinational(), 50); // Initial evaluation
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router, setProjectInfo, setNodes, setEdges, evaluateCombinational]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50 text-slate-500">Loading project...</div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600">{error}</div>;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white text-slate-800 font-sans">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <ComponentSidebar />
        <main className="flex-1 relative flex flex-col border-l border-r border-gray-200">
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
