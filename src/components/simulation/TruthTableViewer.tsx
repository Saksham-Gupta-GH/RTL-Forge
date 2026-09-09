"use client";

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { generateTruthTable, TruthTableRow } from '@/lib/simulator/truthTable';

export function TruthTableViewer() {
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const definitions = useEditorStore(state => state.componentDefinitions);
  
  const [table, setTable] = useState<TruthTableRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    try {
      setError(null);
      
      const circuit = {
        nodes: nodes.map(n => n.data) as any,
        connections: edges.map(e => ({
          id: e.id,
          sourceNodeId: e.source,
          sourcePortId: e.sourceHandle as string,
          targetNodeId: e.target,
          targetPortId: e.targetHandle as string
        }))
      };
      
      const defs = definitions.reduce((acc, def) => {
        acc[def.id] = def;
        return acc;
      }, {} as any);

      const rows = generateTruthTable(circuit, defs);
      setTable(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to generate truth table');
    }
  };

  return (
    <div className="h-full flex flex-col text-slate-700 text-sm">
      <div className="mb-4">
        <button 
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors shadow-sm"
          onClick={handleGenerate}
        >
          Generate Truth Table
        </button>
      </div>

      {error && <div className="text-red-600 mb-4 font-medium">{error}</div>}

      {table && table.length > 0 && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {Object.keys(table[0].inputs).map(key => (
                  <th key={key} className="border-b border-gray-300 py-2 px-4 font-bold text-emerald-600">{key}</th>
                ))}
                <th className="border-b border-gray-300 py-2 px-4 border-l border-gray-300">|</th>
                {Object.keys(table[0].outputs).map(key => (
                  <th key={key} className="border-b border-gray-300 py-2 px-4 font-bold text-sky-600">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100 transition-colors">
                  {Object.values(row.inputs).map((val, j) => (
                    <td key={j} className="border-b border-gray-200 py-1.5 px-4 font-mono font-medium text-slate-600">{val}</td>
                  ))}
                  <td className="border-b border-gray-200 py-1.5 px-4 border-l border-gray-300"></td>
                  {Object.values(row.outputs).map((val, j) => (
                    <td key={j} className="border-b border-gray-200 py-1.5 px-4 font-mono font-bold text-slate-900">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {table && table.length === 0 && (
        <div className="text-slate-500 italic">No inputs or outputs found in the current circuit.</div>
      )}
    </div>
  );
}
