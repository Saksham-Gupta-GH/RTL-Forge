import { Circuit, CircuitNode, ComponentDefinition, Connection, SignalValue } from '../domain/types';
import * as Gates from './gates';

export type NodeValues = Record<string, Record<string, SignalValue>>; // nodeId -> portId -> value
export type NodeStates = Record<string, Record<string, any>>; // nodeId -> stateKey -> value

export interface SimulationResult {
  values: NodeValues;
  nextStates: NodeStates;
  unresolvedNodes: string[];
}

export function simulateCircuit(
  circuit: Circuit,
  inputs: Record<string, SignalValue>, // nodeId -> value (for INPUT nodes)
  definitions: Record<string, ComponentDefinition>,
  currentStates: NodeStates = {}
): SimulationResult {
  const values: NodeValues = {};
  const nextStates: NodeStates = JSON.parse(JSON.stringify(currentStates));
  const unresolvedNodes = new Set<string>();

  // Initialize values structure
  circuit.nodes.forEach(node => {
    values[node.id] = {};
    (node.ports || []).forEach(port => {
      values[node.id][port.id] = 'X';
    });
  });

  // Apply input values
  circuit.nodes.forEach(node => {
    if (node.type === 'INPUT') {
      const val = inputs[node.id] !== undefined ? inputs[node.id] : (node as any).value ?? 0;
      const outPort = node.ports?.find(p => p.direction === 'output');
      if (outPort) values[node.id][outPort.id] = val;
    } else if (node.type === 'CONST_0') {
      const outPort = node.ports?.find(p => p.direction === 'output');
      if (outPort) values[node.id][outPort.id] = 0;
    } else if (node.type === 'CONST_1') {
      const outPort = node.ports?.find(p => p.direction === 'output');
      if (outPort) values[node.id][outPort.id] = 1;
    }
  });

  let changed = true;
  let iterations = 0;
  const MAX_ITERATIONS = 1000; // Prevent infinite combinational loops

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (const node of circuit.nodes) {
      if (['INPUT', 'CONST_0', 'CONST_1'].includes(node.type)) continue;

      // Gather input values for this node
      const inputPorts = node.ports?.filter(p => p.direction === 'input') || [];
      const inputValues: Record<string, SignalValue> = {};
      
      inputPorts.forEach(port => {
        // Find connection targeting this port
        const conn = circuit.connections.find(c => c.targetNodeId === node.id && c.targetPortId === port.id);
        if (conn) {
          inputValues[port.name] = values[conn.sourceNodeId][conn.sourcePortId];
        } else {
          inputValues[port.name] = 'Z'; // Unconnected input
        }
      });

      // Evaluate node
      const newOutValues = evaluateNode(node, inputValues, currentStates[node.id] || {}, definitions);

      // Check if values changed
      for (const portName in newOutValues) {
        const port = node.ports?.find(p => p.name === portName && p.direction === 'output');
        if (port) {
          if (values[node.id][port.id] !== newOutValues[portName]) {
            values[node.id][port.id] = newOutValues[portName];
            changed = true;
          }
        }
      }
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn('Simulation reached max iterations, possible combinational loop.');
    // Nodes that were still changing could be marked as unresolved, but for simplicity we return what we have.
  }

  // Handle sequential state updates (clock edge detection would be external to this pure combinational pass)
  // For simplicity, clock edge logic will be handled outside, and states passed in.

  return { values, nextStates, unresolvedNodes: Array.from(unresolvedNodes) };
}

export function evaluateNode(
  node: CircuitNode,
  inputs: Record<string, SignalValue>,
  state: Record<string, any>,
  definitions: Record<string, ComponentDefinition>
): Record<string, SignalValue> {
  const getIn = (name: string) => inputs[name] ?? 'X';

  switch (node.type) {
    case 'AND': return { out: Gates.evalAnd(getIn('in1'), getIn('in2')) };
    case 'OR': return { out: Gates.evalOr(getIn('in1'), getIn('in2')) };
    case 'NOT': return { out: Gates.evalNot(getIn('in')) };
    case 'XOR': return { out: Gates.evalXor(getIn('in1'), getIn('in2')) };
    case 'NAND': return { out: Gates.evalNand(getIn('in1'), getIn('in2')) };
    case 'NOR': return { out: Gates.evalNor(getIn('in1'), getIn('in2')) };
    case 'XNOR': return { out: Gates.evalXnor(getIn('in1'), getIn('in2')) };
    case 'BUFFER': return { out: Gates.evalBuffer(getIn('in')) };
    
    case 'DFF':
      // Q output is just the current state. State update happens on clock edge.
      return { 
        q: (state.q as SignalValue) ?? 'X',
        qNot: Gates.evalNot((state.q as SignalValue) ?? 'X')
      };
      
    case 'CLOCK':
      // Clock is a special input node, its value is toggled by the environment
      return { out: (state.val as SignalValue) ?? 0 };

    case 'OUTPUT':
      // Outputs just pass through their input for display
      return {}; 

    case 'CUSTOM':
      if (node.definitionId && definitions[node.definitionId]) {
        const def = definitions[node.definitionId];
        // Create inner inputs mapping
        const innerInputs: Record<string, SignalValue> = {};
        for (const portName of def.inputPorts) {
          innerInputs[portName] = inputs[portName] ?? 'X';
        }
        
        // Find INPUT nodes inside the definition circuit to inject values
        const innerInputNodesMap: Record<string, SignalValue> = {};
        def.circuit.nodes.filter(n => n.type === 'INPUT').forEach(n => {
          if (innerInputs[n.label] !== undefined) {
             innerInputNodesMap[n.id] = innerInputs[n.label];
          }
        });

        // Simulate inner circuit
        // We pass current definitions down. If there's recursive nesting, it works as long as no circular deps
        const innerRes = simulateCircuit(def.circuit, innerInputNodesMap, definitions, state.innerStates as NodeStates);
        
        // Extract outputs
        const outputs: Record<string, SignalValue> = {};
        def.circuit.nodes.filter(n => n.type === 'OUTPUT').forEach(n => {
           // Output nodes get their value from their input port connection
           const inPort = n.ports?.find(p => p.direction === 'input');
           if (inPort) {
             const conn = def.circuit.connections.find(c => c.targetNodeId === n.id && c.targetPortId === inPort.id);
             if (conn) {
               outputs[n.label] = innerRes.values[conn.sourceNodeId][conn.sourcePortId];
             } else {
               outputs[n.label] = 'X';
             }
           }
        });
        
        // Propagate updated states up if needed (mutating state parameter is hacky, returning better but let's assume innerRes handles it)
        return outputs;
      }
      return {};

    default:
      return {};
  }
}
