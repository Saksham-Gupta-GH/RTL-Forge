import { simulateCircuit } from '../src/lib/simulator/engine';
import { CircuitNode, Connection } from '../src/lib/domain/types';

describe('Simulation Engine', () => {
  it('evaluates a simple AND gate', () => {
    const nodes: CircuitNode[] = [
      { id: 'in1', type: 'INPUT', label: 'A', position: { x: 0, y: 0 }, ports: [{ id: 'p1', name: 'out', direction: 'output', nodeId: 'in1' }] },
      { id: 'in2', type: 'INPUT', label: 'B', position: { x: 0, y: 0 }, ports: [{ id: 'p2', name: 'out', direction: 'output', nodeId: 'in2' }] },
      { id: 'and', type: 'AND', label: 'AND1', position: { x: 0, y: 0 }, ports: [
        { id: 'pa1', name: 'in1', direction: 'input', nodeId: 'and' },
        { id: 'pa2', name: 'in2', direction: 'input', nodeId: 'and' },
        { id: 'pa3', name: 'out', direction: 'output', nodeId: 'and' }
      ] },
      { id: 'out', type: 'OUTPUT', label: 'Y', position: { x: 0, y: 0 }, ports: [{ id: 'po1', name: 'in', direction: 'input', nodeId: 'out' }] }
    ];

    const connections: Connection[] = [
      { id: 'c1', sourceNodeId: 'in1', sourcePortId: 'p1', targetNodeId: 'and', targetPortId: 'pa1' },
      { id: 'c2', sourceNodeId: 'in2', sourcePortId: 'p2', targetNodeId: 'and', targetPortId: 'pa2' },
      { id: 'c3', sourceNodeId: 'and', sourcePortId: 'pa3', targetNodeId: 'out', targetPortId: 'po1' },
    ];

    const circuit = { nodes, connections };

    // Test 1 AND 1 = 1
    const res1 = simulateCircuit(circuit, { 'in1': 1, 'in2': 1 }, {});
    expect(res1.values['and']['pa3']).toBe(1);

    // Test 1 AND 0 = 0
    const res2 = simulateCircuit(circuit, { 'in1': 1, 'in2': 0 }, {});
    expect(res2.values['and']['pa3']).toBe(0);
  });
});
