"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { CircuitCanvas } from '@/components/editor/CircuitCanvas';
import { ComponentSidebar } from '@/components/editor/ComponentSidebar';
import { Inspector } from '@/components/editor/Inspector';
import { Toolbar } from '@/components/editor/Toolbar';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';

export default function SandboxPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setProjectInfo = useEditorStore(state => state.setProjectInfo);
  const setNodes = useEditorStore(state => state.setNodes);
  const setEdges = useEditorStore(state => state.setEdges);
  const evaluateCombinational = useEditorStore(state => state.evaluateCombinational);

  useEffect(() => {
    // Check if guest
    const isGuest = localStorage.getItem('rtlforge_isGuest') === 'true';
    if (!isGuest) {
      const session = localStorage.getItem('rtlforge_session');
      if (!session) {
        router.push('/login');
        return;
      }
    }

    setProjectInfo({
      id: 'sandbox',
      name: 'Sandbox Mode (Guest)',
      description: 'Your progress will not be saved.',
      isPublic: false
    });
    
    setNodes([]);
    setEdges([]);
    
    setTimeout(() => {
      evaluateCombinational();
      setLoading(false);
    }, 50);
  }, [router, setProjectInfo, setNodes, setEdges, evaluateCombinational]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50 text-slate-500">Initializing Sandbox...</div>;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white text-slate-800 font-sans">
      <Toolbar isSandbox={true} />
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
