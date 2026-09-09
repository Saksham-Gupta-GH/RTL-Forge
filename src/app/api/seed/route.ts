import { NextResponse } from 'next/server';
import { ProjectModel } from '@/lib/db/models';
import dbConnect from '@/lib/db/mongodb';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    await dbConnect();

    // Create a Half Adder example
    const halfAdderNodes = [
      { id: 'inA', type: 'INPUT', label: 'A', position: { x: 100, y: 100 }, ports: [{ id: 'p1', name: 'out', direction: 'output', nodeId: 'inA' }] },
      { id: 'inB', type: 'INPUT', label: 'B', position: { x: 100, y: 200 }, ports: [{ id: 'p2', name: 'out', direction: 'output', nodeId: 'inB' }] },
      { id: 'xor1', type: 'XOR', label: 'XOR', position: { x: 300, y: 100 }, ports: [{ id: 'px1', name: 'in1', direction: 'input', nodeId: 'xor1' }, { id: 'px2', name: 'in2', direction: 'input', nodeId: 'xor1' }, { id: 'px3', name: 'out', direction: 'output', nodeId: 'xor1' }] },
      { id: 'and1', type: 'AND', label: 'AND', position: { x: 300, y: 200 }, ports: [{ id: 'pa1', name: 'in1', direction: 'input', nodeId: 'and1' }, { id: 'pa2', name: 'in2', direction: 'input', nodeId: 'and1' }, { id: 'pa3', name: 'out', direction: 'output', nodeId: 'and1' }] },
      { id: 'outSum', type: 'OUTPUT', label: 'Sum', position: { x: 500, y: 100 }, ports: [{ id: 'ps1', name: 'in', direction: 'input', nodeId: 'outSum' }] },
      { id: 'outCout', type: 'OUTPUT', label: 'Carry', position: { x: 500, y: 200 }, ports: [{ id: 'pc1', name: 'in', direction: 'input', nodeId: 'outCout' }] },
    ];
    
    const halfAdderConnections = [
      { id: 'c1', sourceNodeId: 'inA', sourcePortId: 'p1', targetNodeId: 'xor1', targetPortId: 'px1' },
      { id: 'c2', sourceNodeId: 'inB', sourcePortId: 'p2', targetNodeId: 'xor1', targetPortId: 'px2' },
      { id: 'c3', sourceNodeId: 'inA', sourcePortId: 'p1', targetNodeId: 'and1', targetPortId: 'pa1' },
      { id: 'c4', sourceNodeId: 'inB', sourcePortId: 'p2', targetNodeId: 'and1', targetPortId: 'pa2' },
      { id: 'c5', sourceNodeId: 'xor1', sourcePortId: 'px3', targetNodeId: 'outSum', targetPortId: 'ps1' },
      { id: 'c6', sourceNodeId: 'and1', sourcePortId: 'pa3', targetNodeId: 'outCout', targetPortId: 'pc1' },
    ];

    const haProject = {
      id: nanoid(),
      name: 'Half Adder Example',
      description: 'A simple half adder circuit.',
      circuit: { nodes: halfAdderNodes, connections: halfAdderConnections },
      componentDefinitions: [],
      simulationSettings: { clockSpeedHz: 2 },
      testbenches: [],
      isPublic: true, // Make it public so anyone can view it
      ownerSessionId: 'global_seed', // Doesn't belong to any specific user
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // For simplicity, just insert this one for now.
    await ProjectModel.create(haProject);

    return NextResponse.json({ success: true, message: 'Seed complete. Project added.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
