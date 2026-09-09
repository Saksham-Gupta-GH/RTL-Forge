import { Circuit, ComponentDefinition, SignalValue, Testbench } from '../domain/types';
import { simulateCircuit } from './engine';

export interface TestResult {
  passed: boolean;
  actualOutputs: Record<string, SignalValue>;
}

export interface TestbenchResult {
  testbenchId: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
}

export function runTestbench(
  circuit: Circuit,
  testbench: Testbench,
  definitions: Record<string, ComponentDefinition>
): TestbenchResult {
  const outputNodes = circuit.nodes.filter(n => n.type === 'OUTPUT');
  const inputNodes = circuit.nodes.filter(n => n.type === 'INPUT');

  const results: TestResult[] = [];
  let passedTests = 0;

  for (const vector of testbench.vectors) {
    // Map vector input labels to node IDs
    const inputMap: Record<string, SignalValue> = {};
    for (const node of inputNodes) {
      if (vector.inputs[node.label] !== undefined) {
        inputMap[node.id] = vector.inputs[node.label];
      }
    }

    const { values } = simulateCircuit(circuit, inputMap, definitions, {});

    const actualOutputs: Record<string, SignalValue> = {};
    let passed = true;

    for (const node of outputNodes) {
      const inPort = node.ports?.find(p => p.direction === 'input');
      let val: SignalValue = 'X';
      if (inPort) {
        const conn = circuit.connections.find(c => c.targetNodeId === node.id && c.targetPortId === inPort.id);
        if (conn) {
          val = values[conn.sourceNodeId][conn.sourcePortId];
        }
      }
      actualOutputs[node.label] = val;

      if (vector.expectedOutputs[node.label] !== undefined) {
        if (vector.expectedOutputs[node.label] !== val) {
          passed = false;
        }
      }
    }

    results.push({ passed, actualOutputs });
    if (passed) passedTests++;
  }

  return {
    testbenchId: testbench.id,
    totalTests: testbench.vectors.length,
    passedTests,
    failedTests: testbench.vectors.length - passedTests,
    results
  };
}
