import { Handle, Position } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import { CircuitNode, SignalValue } from '@/lib/domain/types';
import clsx from 'clsx';

function getSignalColor(val: SignalValue | undefined) {
  if (val === 1) return 'bg-emerald-500';
  if (val === 0) return 'bg-slate-300 border border-slate-400';
  if (val === 'X') return 'bg-rose-500';
  if (val === 'Z') return 'bg-amber-400';
  return 'bg-slate-300';
}

export function LogicNode({ data, selected }: { data: CircuitNode, selected?: boolean }) {
  const nodeValues = useEditorStore(state => state.nodeValues[data.id]);
  const nodeStates = useEditorStore(state => state.nodeStates[data.id]);

  const inputs = data.ports.filter(p => p.direction === 'input');
  const outputs = data.ports.filter(p => p.direction === 'output');

  return (
    <div className={clsx(
      "rounded-lg border-2 shadow-sm transition-shadow min-w-[100px] flex flex-col items-center justify-center font-sans",
      selected ? "border-sky-500 shadow-sky-500/20" : "border-gray-300 shadow-gray-200",
      data.type === 'INPUT' || data.type === 'OUTPUT' ? "bg-sky-50 py-3 px-4" : "bg-white py-4 px-6"
    )}>
      <div className="text-[9px] text-slate-500 uppercase tracking-widest bg-white/80 px-1 rounded-sm shadow-sm backdrop-blur-sm">
        {data.type}
      </div>
      <div className="text-sm font-bold tracking-wider text-slate-800">{data.label}</div>
      
      <div className="flex justify-between p-2 relative w-full mt-2">
        {/* Input Handles */}
        <div className="flex flex-col gap-2 relative">
          {inputs.map((port, i) => (
            <div key={port.id} className="flex items-center h-4 relative">
              <span className="mr-1 text-[10px] text-slate-500 font-medium">{port.name}</span>
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                className={clsx("w-3 h-3 border-2 border-white rounded-full", getSignalColor(nodeValues?.[port.id] ?? 'X'))}
                style={{ top: 'auto', bottom: 'auto' }}
              />
            </div>
          ))}
        </div>

        {/* Node Body / State Display */}
        <div className="flex items-center justify-center px-4">
          {data.type === 'INPUT' && (
            <div 
              className={clsx("w-8 h-8 flex items-center justify-center rounded font-bold cursor-pointer transition-colors shadow-inner text-white", 
                data.value === 1 ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-400 hover:bg-slate-500"
              )}
              onClick={() => useEditorStore.getState().setInputValue(data.id, data.value === 1 ? 0 : 1)}
            >
              {data.value}
            </div>
          )}
          {data.type === 'DFF' && (
            <div className="text-center font-mono text-xs text-slate-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
              Q: <span className="font-bold">{nodeStates?.q}</span>
            </div>
          )}
          {data.type === 'CLOCK' && (
            <div className={clsx("w-6 h-6 rounded-full border-2", nodeStates?.val === 1 ? "bg-emerald-500 border-emerald-600" : "bg-slate-300 border-slate-400")} />
          )}
        </div>

        {/* Output Handles */}
        <div className="flex flex-col gap-2 relative items-end">
          {outputs.map((port, i) => {
             const val = nodeValues?.[port.id];
             return (
              <div key={port.id} className="flex items-center h-4 relative justify-end">
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  className={clsx("w-3 h-3 border-2 border-white rounded-full", getSignalColor(val))}
                  style={{ top: 'auto', bottom: 'auto' }}
                />
                <span className="ml-1 text-[10px] text-slate-500 font-medium">{port.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
