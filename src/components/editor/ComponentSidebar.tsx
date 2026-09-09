"use client";

import { useEditorStore } from '@/store/editorStore';

const CATEGORIES = [
  {
    name: 'Basic / IO',
    items: ['INPUT', 'OUTPUT', 'CONST_0', 'CONST_1', 'CLOCK']
  },
  {
    name: 'Combinational',
    items: ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'BUFFER']
  },
  {
    name: 'Sequential',
    items: ['DFF', 'REGISTER', 'COUNTER']
  }
];

export function ComponentSidebar() {
  const componentDefinitions = useEditorStore(state => state.componentDefinitions);

  const onDragStart = (event: React.DragEvent, nodeType: string, defId?: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    if (defId) {
      event.dataTransfer.setData('application/reactflow/defId', defId);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full text-slate-700">
      <div className="p-4 border-b border-gray-200 font-bold text-slate-900 bg-gray-50">Components</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {CATEGORIES.map(cat => (
          <div key={cat.name}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{cat.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              {cat.items.map(item => (
                <div
                  key={item}
                  className="bg-white border border-gray-300 shadow-sm rounded p-2 text-center text-xs font-medium cursor-grab hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-colors"
                  onDragStart={(event) => onDragStart(event, item)}
                  draggable
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custom</h3>
          <div className="grid grid-cols-1 gap-2">
            {componentDefinitions.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-gray-50 p-3 rounded border border-gray-200 border-dashed text-center">No custom components yet.</div>
            ) : (
              componentDefinitions.map(def => (
                <div
                  key={def.id}
                  className="bg-sky-50 border border-sky-200 text-sky-800 font-medium rounded p-2 text-center text-xs cursor-grab hover:bg-sky-100 hover:border-sky-300 transition-colors shadow-sm"
                  onDragStart={(event) => onDragStart(event, 'CUSTOM', def.id)}
                  draggable
                >
                  {def.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
