import { Circuit, ComponentDefinition, SignalValue } from '../domain/types';
import { simulateCircuit, NodeStates } from './engine';

export function tickClock(
  circuit: Circuit,
  inputs: Record<string, SignalValue>,
  currentStates: NodeStates,
  definitions: Record<string, ComponentDefinition>
): NodeStates {
  // 1. Simulate combinational logic first to resolve D inputs to flip flops
  const res = simulateCircuit(circuit, inputs, definitions, currentStates);
  const values = res.values;
  
  const nextStates: NodeStates = JSON.parse(JSON.stringify(currentStates));

  // 2. Update states on rising edge (assuming simple DFF model without explicit clock wiring for now, 
  // or explicit clock if wired). For this simple model, all sequential elements update on this "tick"
  // which simulates a global synchronous clock.
  
  for (const node of circuit.nodes) {
    if (!nextStates[node.id]) nextStates[node.id] = {};

    if (node.type === 'DFF') {
      const dPort = node.ports?.find(p => p.name === 'D');
      if (dPort) {
        // Find what is connected to D
        const conn = circuit.connections.find(c => c.targetNodeId === node.id && c.targetPortId === dPort.id);
        if (conn) {
          nextStates[node.id].q = values[conn.sourceNodeId][conn.sourcePortId];
        } else {
          nextStates[node.id].q = 'X';
        }
      }
    } else if (node.type === 'COUNTER') {
      // Simple 4-bit counter
      let currentVal = (currentStates[node.id]?.val as number) || 0;
      currentVal = (currentVal + 1) % 16;
      nextStates[node.id].val = currentVal;
      
      // Output is the 4 bits. Let's say counter has out0, out1, out2, out3
    }
    
    // Process CUSTOM nodes which might contain sequential logic
    if (node.type === 'CUSTOM' && node.definitionId && definitions[node.definitionId]) {
        const def = definitions[node.definitionId];
        // Create inner inputs mapping
        const innerInputs: Record<string, SignalValue> = {};
        for (const portName of def.inputPorts) {
            const port = node.ports?.find(p => p.name === portName && p.direction === 'input');
            if (port) {
                const conn = circuit.connections.find(c => c.targetNodeId === node.id && c.targetPortId === port.id);
                if (conn) {
                    innerInputs[portName] = values[conn.sourceNodeId][conn.sourcePortId];
                }
            }
        }
        
        const innerInputNodesMap: Record<string, SignalValue> = {};
        def.circuit.nodes.filter(n => n.type === 'INPUT').forEach(n => {
          if (innerInputs[n.label] !== undefined) {
             innerInputNodesMap[n.id] = innerInputs[n.label];
          }
        });

        // Tick inner circuit
        const innerCurrentStates = (currentStates[node.id]?.innerStates as NodeStates) || {};
        const innerNextStates = tickClock(def.circuit, innerInputNodesMap, innerCurrentStates, definitions);
        nextStates[node.id].innerStates = innerNextStates as any;
    }
  }

  return nextStates;
}
