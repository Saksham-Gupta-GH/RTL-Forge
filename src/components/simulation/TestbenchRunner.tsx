"use client";

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { runTestbench, TestbenchResult } from '@/lib/simulator/testbench';

export function TestbenchRunner() {
  const nodes = useEditorStore(state => state.nodes);
  const edges = useEditorStore(state => state.edges);
  const definitions = useEditorStore(state => state.componentDefinitions);
  
  // Minimal placeholder state for now
  const [result, setResult] = useState<TestbenchResult | null>(null);

  const handleRun = () => {
    // In a full implementation, we'd have a UI to create the test vectors.
    // For now, let's auto-generate a dummy testbench with 1 vector for inputs = 0
    const inputNodes = nodes.filter(n => n.data.type === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.type === 'OUTPUT');
    
    if (inputNodes.length === 0 || outputNodes.length === 0) {
      alert("Circuit needs at least one INPUT and one OUTPUT to run a testbench.");
      return;
    }

    const inputs: Record<string, any> = {};
    inputNodes.forEach(n => inputs[n.data.label as string] = 0);
    
    const expectedOutputs: Record<string, any> = {};
    outputNodes.forEach(n => expectedOutputs[n.data.label as string] = 0);

    const dummyTestbench = {
      id: 'tb-1',
      name: 'Dummy Testbench',
      vectors: [
        { inputs, expectedOutputs }
      ]
    };

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

    const res = runTestbench(circuit, dummyTestbench, defs);
    setResult(res);
  };

  return (
    <div className="h-full flex flex-col text-slate-700 text-sm">
      <div className="mb-4">
        <button 
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors shadow-sm"
          onClick={handleRun}
        >
          Run Testbench
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-md shadow-sm">
          <h3 className="font-bold mb-2 text-slate-900">Test Results</h3>
          <p className="text-slate-700">Total: {result.totalTests}</p>
          <p className="text-emerald-600 font-medium">Passed: {result.passedTests}</p>
          <p className="text-rose-600 font-medium">Failed: {result.failedTests}</p>
          <p className="font-bold mt-2 text-slate-800">
            Pass Rate: {((result.passedTests / result.totalTests) * 100).toFixed(0)}%
          </p>
        </div>
      )}
      
      {!result && (
        <div className="text-slate-500 italic">
          Testbench UI is simplified for MVP. Click run to execute a basic structural test.
        </div>
      )}
    </div>
  );
}
