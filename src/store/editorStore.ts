import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Node as FlowNode, Edge as FlowEdge, Connection as FlowConnection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { CircuitNode, Connection, ComponentDefinition, SimulationSettings, Testbench, SignalValue } from '@/lib/domain/types';
import { simulateCircuit, NodeStates } from '@/lib/simulator/engine';
import { tickClock } from '@/lib/simulator/sequential';

export type AppNode = FlowNode<CircuitNode>;
export type AppEdge = FlowEdge;

interface EditorState {
  // Project Info
  projectId: string | null;
  projectName: string;
  projectDescription: string;
  isPublic: boolean;
  
  // Circuit
  nodes: AppNode[];
  edges: AppEdge[];
  
  // Custom Components
  componentDefinitions: ComponentDefinition[];
  
  // Simulation
  isSimulating: boolean;
  simulationIntervalId: NodeJS.Timeout | null;
  settings: SimulationSettings;
  testbenches: Testbench[];
  
  // Live State
  nodeValues: Record<string, Record<string, SignalValue>>;
  nodeStates: NodeStates;
  
  // Waveform History
  tickCount: number;
  waveformHistory: Array<{ time: number, values: Record<string, SignalValue> }>;
  
  // Actions
  setProjectInfo: (info: { id: string, name: string, description: string, isPublic: boolean }) => void;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: AppEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: FlowConnection) => void;
  addNode: (type: string, position: { x: number, y: number }, definitionId?: string) => void;
  deleteSelection: (selectedNodeIds: string[], selectedEdgeIds: string[]) => void;
  
  setInputValue: (nodeId: string, value: SignalValue) => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
  tickSimulation: () => void;
  evaluateCombinational: () => void;
  clearWaveformHistory: () => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    projectId: null,
    projectName: 'Untitled Project',
    projectDescription: '',
    isPublic: false,
    
    nodes: [],
    edges: [],
    
    componentDefinitions: [],
    
    isSimulating: false,
    simulationIntervalId: null,
    settings: { clockSpeedHz: 2 },
    testbenches: [],
    
    nodeValues: {},
    nodeStates: {},
    
    tickCount: 0,
    waveformHistory: [],
    
    setProjectInfo: (info) => set((state) => {
      state.projectId = info.id;
      state.projectName = info.name;
      state.projectDescription = info.description;
      state.isPublic = info.isPublic;
    }),
    
    setNodes: (nodes) => set((state) => { state.nodes = nodes; }),
    setEdges: (edges) => set((state) => { state.edges = edges; }),
    
    onNodesChange: (changes) => set((state) => {
      state.nodes = applyNodeChanges(changes, state.nodes) as AppNode[];
    }),
    
    onEdgesChange: (changes) => set((state) => {
      state.edges = applyEdgeChanges(changes, state.edges);
    }),
    
    onConnect: (connection) => set((state) => {
      // Prevent connecting input to input etc, but basically allow any valid connection
      state.edges = addEdge(connection, state.edges);
      get().evaluateCombinational();
    }),
    
    addNode: (type, position, definitionId) => set((state) => {
      const id = nanoid();
      const ports = [];
      // Assign standard ports based on type
      if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(type)) {
        ports.push({ id: nanoid(), name: 'in1', direction: 'input', nodeId: id });
        ports.push({ id: nanoid(), name: 'in2', direction: 'input', nodeId: id });
        ports.push({ id: nanoid(), name: 'out', direction: 'output', nodeId: id });
      } else if (['NOT', 'BUFFER'].includes(type)) {
        ports.push({ id: nanoid(), name: 'in', direction: 'input', nodeId: id });
        ports.push({ id: nanoid(), name: 'out', direction: 'output', nodeId: id });
      } else if (type === 'INPUT') {
        ports.push({ id: nanoid(), name: 'out', direction: 'output', nodeId: id });
      } else if (type === 'OUTPUT') {
        ports.push({ id: nanoid(), name: 'in', direction: 'input', nodeId: id });
      } else if (type === 'DFF') {
        ports.push({ id: nanoid(), name: 'D', direction: 'input', nodeId: id });
        ports.push({ id: nanoid(), name: 'CLK', direction: 'input', nodeId: id });
        ports.push({ id: nanoid(), name: 'Q', direction: 'output', nodeId: id });
        ports.push({ id: nanoid(), name: 'Q_not', direction: 'output', nodeId: id });
      } else if (type === 'CLOCK' || type === 'CONST_0' || type === 'CONST_1') {
        ports.push({ id: nanoid(), name: 'out', direction: 'output', nodeId: id });
      } else if (type === 'CUSTOM' && definitionId) {
        const def = state.componentDefinitions.find(d => d.id === definitionId);
        if (def) {
          def.inputPorts.forEach(name => ports.push({ id: nanoid(), name, direction: 'input', nodeId: id }));
          def.outputPorts.forEach(name => ports.push({ id: nanoid(), name, direction: 'output', nodeId: id }));
        }
      }

      const newNode: AppNode = {
        id,
        type: 'logicNode', // The custom React Flow node type
        position,
        data: {
          id,
          type: type as any,
          label: `${type}_${id.substring(0, 4)}`,
          position,
          ports: ports as any,
          definitionId
        }
      };
      
      if (type === 'INPUT') {
        newNode.data.value = 0; // Default input value
      }
      if (type === 'DFF') {
        state.nodeStates[id] = { q: 0 };
      }

      state.nodes.push(newNode);
      get().evaluateCombinational();
    }),
    
    deleteSelection: (selectedNodeIds, selectedEdgeIds) => set((state) => {
      state.nodes = state.nodes.filter(n => !selectedNodeIds.includes(n.id));
      state.edges = state.edges.filter(e => !selectedEdgeIds.includes(e.id) && 
                                             !selectedNodeIds.includes(e.source) && 
                                             !selectedNodeIds.includes(e.target));
      get().evaluateCombinational();
    }),
    
    setInputValue: (nodeId, value) => set((state) => {
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.data.value = value;
      }
      get().evaluateCombinational();
    }),
    
    clearWaveformHistory: () => set((state) => {
      state.waveformHistory = [];
      state.tickCount = 0;
    }),
    
    evaluateCombinational: () => set((state) => {
      // Build domain circuit
      const circuit = {
        nodes: state.nodes.map(n => n.data),
        connections: state.edges.map(e => ({
          id: e.id,
          sourceNodeId: e.source,
          sourcePortId: e.sourceHandle as string,
          targetNodeId: e.target,
          targetPortId: e.targetHandle as string
        }))
      };
      
      const inputs = {}; // Not explicitly passed here since INPUT nodes store their value in `data.value`
      const definitions = state.componentDefinitions.reduce((acc, def) => {
        acc[def.id] = def;
        return acc;
      }, {} as Record<string, ComponentDefinition>);
      
      const result = simulateCircuit(circuit, inputs, definitions, state.nodeStates);
      state.nodeValues = result.values;
      
      // Update history if we want to track every change.
      // But we mostly want to track on 'tickSimulation' or inputs.
      // Let's do it here so manual input changes are caught.
      const snapshot: Record<string, SignalValue> = {};
      state.nodes.forEach(n => {
        // We track the primary output for simplicity.
        // For inputs, it's the `out` port or data.value. For others, find their output port.
        if (n.data.type === 'INPUT') {
           snapshot[n.id] = result.values[n.id]?.['out'] ?? n.data.value ?? 'X';
        } else {
           const outPort = n.data.ports?.find((p: any) => p.direction === 'output');
           if (outPort) {
             snapshot[n.id] = result.values[n.id]?.[outPort.id] ?? 'X';
           }
        }
      });
      
      state.waveformHistory.push({ time: state.tickCount, values: snapshot });
      if (state.waveformHistory.length > 100) {
        state.waveformHistory.shift();
      }
      // state.tickCount++; // Don't auto-increment here, let the clock do it, but we use tickCount to mark manual changes
    }),
    
    tickSimulation: () => set((state) => {
      const circuit = {
        nodes: state.nodes.map(n => n.data),
        connections: state.edges.map(e => ({
          id: e.id,
          sourceNodeId: e.source,
          sourcePortId: e.sourceHandle as string,
          targetNodeId: e.target,
          targetPortId: e.targetHandle as string
        }))
      };
      const definitions = state.componentDefinitions.reduce((acc, def) => { acc[def.id] = def; return acc; }, {} as Record<string, ComponentDefinition>);
      
      // Tick clock for CLOCK nodes
      state.nodes.forEach(n => {
        if (n.data.type === 'CLOCK') {
          if (!state.nodeStates[n.id]) state.nodeStates[n.id] = { val: 0 };
          state.nodeStates[n.id].val = state.nodeStates[n.id].val === 0 ? 1 : 0;
        }
      });
      
      const nextStates = tickClock(circuit, {}, state.nodeStates, definitions);
      state.nodeStates = nextStates;
      state.tickCount += 1;
      get().evaluateCombinational();
    }),
    
    startSimulation: () => {
      const state = get();
      if (state.isSimulating) return;
      
      const intervalId = setInterval(() => {
        get().tickSimulation();
      }, 1000 / state.settings.clockSpeedHz);
      
      set({ isSimulating: true, simulationIntervalId: intervalId });
    },
    
    stopSimulation: () => {
      const state = get();
      if (state.simulationIntervalId) {
        clearInterval(state.simulationIntervalId);
      }
      set({ isSimulating: false, simulationIntervalId: null });
    }
  }))
);
