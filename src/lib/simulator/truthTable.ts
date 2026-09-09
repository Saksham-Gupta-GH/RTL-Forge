import { Circuit, ComponentDefinition, SignalValue } from '../domain/types';
import { simulateCircuit, NodeStates } from './engine';

export interface TruthTableRow {
  inputs: Record<string, SignalValue>;
  outputs: Record<string, SignalValue>;
}

export function generateTruthTable(
  circuit: Circuit,
  definitions: Record<string, ComponentDefinition>
): TruthTableRow[] {
  // Find all INPUT nodes
  const inputNodes = circuit.nodes.filter(n => n.type === 'INPUT');
  const outputNodes = circuit.nodes.filter(n => n.type === 'OUTPUT');

  if (inputNodes.length > 16) {
    throw new Error('Too many inputs for truth table generation (max 16).');
  }

  const rows: TruthTableRow[] = [];
  const numRows = Math.pow(2, inputNodes.length);

  for (let i = 0; i < numRows; i++) {
    const inputValues: Record<string, SignalValue> = {};
    const inputMap: Record<string, SignalValue> = {};

    // Set binary values based on `i`
    for (let j = 0; j < inputNodes.length; j++) {
      const bit = ((i >> (inputNodes.length - 1 - j)) & 1) as SignalValue;
      const node = inputNodes[j];
      inputValues[node.label] = bit;
      inputMap[node.id] = bit;
    }

    const { values } = simulateCircuit(circuit, inputMap, definitions, {});

    const outputValues: Record<string, SignalValue> = {};
    outputNodes.forEach(node => {
      const inPort = node.ports.find(p => p.direction === 'input');
      if (inPort) {
        const conn = circuit.connections.find(c => c.targetNodeId === node.id && c.targetPortId === inPort.id);
        if (conn) {
          outputValues[node.label] = values[conn.sourceNodeId][conn.sourcePortId];
        } else {
          outputValues[node.label] = 'X';
        }
      }
    });

    rows.push({ inputs: inputValues, outputs: outputValues });
  }

  return rows;
}
