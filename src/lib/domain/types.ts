// Port direction
export type PortDirection = 'input' | 'output';

// Supported node types
export type NodeType =
  | 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR' | 'BUFFER'
  | 'INPUT' | 'OUTPUT' | 'CONST_0' | 'CONST_1'
  | 'DFF' | 'REGISTER' | 'COUNTER' | 'CLOCK'
  | 'CUSTOM';                         // references a ComponentDefinition

export interface Port {
  id: string;
  name: string;
  direction: PortDirection;
  nodeId: string;
}

// 4-value logic
export type SignalValue = 0 | 1 | 'X' | 'Z';

export interface CircuitNode extends Record<string, unknown> {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  ports: Port[];
  // Only for CUSTOM nodes:
  definitionId?: string;
  definitionVersion?: number;
  // For INPUT nodes or nodes with editable internal state
  value?: SignalValue; 
  // State for sequential elements:
  state?: Record<string, any>;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

export interface Circuit {
  nodes: CircuitNode[];
  connections: Connection[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  version: number;
  description?: string;
  inputPorts: string[];              // ordered port names
  outputPorts: string[];
  circuit: Circuit;                  // inner circuit
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SimulationSettings {
  clockSpeedHz: number;
}

export interface TestVector {
  inputs: Record<string, SignalValue>;
  expectedOutputs: Record<string, SignalValue>;
}

export interface Testbench {
  id: string;
  name: string;
  vectors: TestVector[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  circuit: Circuit;
  componentDefinitions: ComponentDefinition[];  // inline definitions
  simulationSettings: SimulationSettings;
  testbenches: Testbench[];
  isPublic: boolean;
  shareToken?: string;
  ownerSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
