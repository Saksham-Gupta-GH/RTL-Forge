"use client";

import { useEditorStore } from '@/store/editorStore';

export function Inspector() {
  // Using a simpler subscription approach for selected nodes:
  // We can just rely on the store's nodes which has selected property if we sync it.
  const nodes = useEditorStore(state => state.nodes);
  const selectedNodes = nodes.filter(n => n.selected);
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const nodeValues = useEditorStore(state => state.nodeValues);
  const nodeStates = useEditorStore(state => state.nodeStates);

  if (!selectedNode) {
    return (
      <aside className="w-64 bg-white border-l border-gray-200 p-4 text-slate-500 text-sm">
        <div className="text-center mt-10">Select a component to view properties.</div>
      </aside>
    );
  }

  const data = selectedNode.data as any;
  const values = nodeValues[selectedNode.id] || {};
  const state = nodeStates[selectedNode.id] || {};

  return (
    <aside className="w-64 bg-white border-l border-gray-200 text-slate-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 font-bold text-slate-900 bg-gray-50">Inspector</div>
      
      <div className="p-4 space-y-6 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Component</h3>
          <div className="bg-gray-50 rounded p-3 border border-gray-200">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Type</span>
              <span className="font-mono font-semibold text-sky-700">{data.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ID</span>
              <span className="font-mono text-xs">{selectedNode.id.substring(0, 8)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Signals</h3>
          <div className="bg-gray-50 rounded p-3 space-y-2 font-mono text-sm border border-gray-200">
            {data.ports.map((port: any) => (
              <div key={port.id} className="flex justify-between items-center">
                <span className={port.direction === 'input' ? 'text-emerald-600' : 'text-sky-600'}>
                  {port.direction === 'input' ? '→ ' : '← '}{port.name}
                </span>
                <span className="font-bold text-slate-800 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                  {values[port.id] ?? 'X'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(state).length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal State</h3>
            <div className="bg-gray-50 rounded p-3 space-y-2 font-mono text-sm border border-gray-200">
              {Object.entries(state).map(([key, val]) => {
                if (key === 'innerStates') return null; // Don't show deeply nested state here
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-indigo-600">{key}</span>
                    <span className="font-bold text-slate-800 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                      {String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
