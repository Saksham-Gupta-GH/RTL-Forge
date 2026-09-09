"use client";

import { useEditorStore } from '@/store/editorStore';
import { Play, Square, Save, Share2, PlusSquare, Cpu } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { CreateComponentDialog } from './CreateComponentDialog';
import Link from 'next/link';

export function Toolbar({ isSandbox = false }: { isSandbox?: boolean }) {
  const isSimulating = useEditorStore(state => state.isSimulating);
  const startSimulation = useEditorStore(state => state.startSimulation);
  const stopSimulation = useEditorStore(state => state.stopSimulation);
  
  const projectId = useEditorStore(state => state.projectId);
  const projectName = useEditorStore(state => state.projectName);
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showCreateComponent, setShowCreateComponent] = useState(false);

  const handleSave = async () => {
    if (isSandbox) {
      alert("Saving is disabled in Sandbox Mode. Please log in to save projects.");
      return;
    }
    if (!projectId) return;
    setIsSaving(true);
    const sessionId = localStorage.getItem('rtlforge_session');
    
    const circuit = {
      nodes: nodes.map(n => n.data),
      connections: edges.map(e => ({
        id: e.id,
        sourceNodeId: e.source,
        sourcePortId: e.sourceHandle as string,
        targetNodeId: e.target,
        targetPortId: e.targetHandle as string
      }))
    };

    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          data: { circuit }
        })
      });
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (isSandbox) {
      alert("Sharing is disabled in Sandbox Mode. Please log in to share projects.");
      return;
    }
    if (!projectId) return;
    const sessionId = localStorage.getItem('rtlforge_session');
    
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        const url = `${window.location.origin}/project/${projectId}?token=${data.token}`;
        setShareUrl(url);
        navigator.clipboard.writeText(url);
        alert('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error("Failed to share", err);
    }
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 text-slate-600 shadow-sm z-10">
      <div className="flex items-center space-x-4">
        <Link href={isSandbox ? "/" : "/dashboard"} className="font-bold text-slate-900 tracking-wider flex items-center space-x-2">
          <div className="w-5 h-5 bg-sky-600 rounded-sm flex items-center justify-center">
            <Cpu size={12} className="text-white" />
          </div>
          <span>RTLForge</span>
        </Link>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <span className="font-medium text-sm text-slate-700">{projectName}</span>
        {isSandbox && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded ml-2 font-medium border border-amber-200">Sandbox</span>}
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          className={clsx(
            "flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-semibold transition-colors border shadow-sm",
            isSimulating 
              ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" 
              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
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
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        <button 
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          onClick={() => setShowCreateComponent(true)}
        >
          <PlusSquare size={16} />
          <span>New Component</span>
        </button>
        
        {!isSandbox && (
          <>
            <button 
              className={clsx(
                "flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors",
                isSaving ? "text-slate-400 cursor-not-allowed" : "hover:bg-gray-100 text-slate-700"
              )}
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            <button 
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100 text-slate-700 transition-colors"
              onClick={handleShare}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </>
        )}
      </div>
      
      {showCreateComponent && <CreateComponentDialog onClose={() => setShowCreateComponent(false)} />}
    </div>
  );
}
