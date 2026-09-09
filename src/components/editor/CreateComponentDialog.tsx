"use client";

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { nanoid } from 'nanoid';
import { X } from 'lucide-react';

export function CreateComponentDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const componentDefinitions = useEditorStore(state => state.componentDefinitions);
  
  // Minimal logic: user selects nodes. We find inputs/outputs
  const selectedNodes = nodes.filter(n => n.selected);
  const inputNodes = selectedNodes.filter(n => n.data.type === 'INPUT');
  const outputNodes = selectedNodes.filter(n => n.data.type === 'OUTPUT');

  const handleSave = () => {
    if (!name) return;
    if (selectedNodes.length === 0) {
      alert('Please select the nodes you want to include in the custom component.');
      return;
    }

    const newDef = {
      id: nanoid(),
      name,
      version: 1,
      description: desc,
      inputPorts: inputNodes.map(n => n.data.label as string),
      outputPorts: outputNodes.map(n => n.data.label as string),
      circuit: {
        nodes: selectedNodes.map(n => n.data) as any,
        // Only include edges between selected nodes
        connections: edges.filter(e => 
          selectedNodes.some(n => n.id === e.source) && 
          selectedNodes.some(n => n.id === e.target)
        ).map(e => ({
          id: e.id,
          sourceNodeId: e.source,
          sourcePortId: e.sourceHandle as string,
          targetNodeId: e.target,
          targetPortId: e.targetHandle as string
        }))
      },
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    useEditorStore.setState(state => {
      state.componentDefinitions.push(newDef);
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-xl p-6 w-96 shadow-xl relative">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-slate-900 mb-4">Create Component</h2>
        
        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <label className="block mb-1 font-semibold text-slate-800">Component Name</label>
            <input 
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. FullAdder"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-slate-800">Description</label>
            <textarea 
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow"
              value={desc} onChange={e => setDesc(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="mb-2"><span className="text-slate-900 font-bold">{selectedNodes.length}</span> nodes selected</p>
            <p className="text-xs text-slate-600">
              <span className="text-emerald-600 font-bold">{inputNodes.length}</span> inputs,{' '}
              <span className="text-sky-600 font-bold">{outputNodes.length}</span> outputs detected.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors" onClick={onClose}>Cancel</button>
          <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm" onClick={handleSave}>
            Save Component
          </button>
        </div>
      </div>
    </div>
  );
}
