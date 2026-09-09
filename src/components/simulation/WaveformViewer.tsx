"use client";

import { useEditorStore } from '@/store/editorStore';
import { useMemo, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export function WaveformViewer() {
  const waveformHistory = useEditorStore(state => state.waveformHistory);
  const nodes = useEditorStore(state => state.nodes);
  const clearWaveformHistory = useEditorStore(state => state.clearWaveformHistory);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out nodes that we want to track
  const trackedNodes = useMemo(() => {
    return nodes.filter(n => ['INPUT', 'OUTPUT', 'CLOCK', 'DFF', 'REGISTER'].includes(n.data.type as string));
  }, [nodes]);

  const nodeStates = useEditorStore(state => state.nodeStates);

  // SVG dimensions
  const laneHeight = 70;
  const tickWidth = 30;
  const labelWidth = 140;
  const padding = 10;
  
  const svgWidth = Math.max(800, waveformHistory.length * tickWidth + labelWidth + 20);
  const svgHeight = Math.max(250, trackedNodes.length * laneHeight + 40);

  // Auto-scroll to the right when history updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [waveformHistory.length]);

  if (trackedNodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 italic">
        <p>No trackable components (Inputs, Outputs, Clocks) in the circuit.</p>
      </div>
    );
  }

  const renderTrace = (nodeId: string, laneIndex: number, nodeType: string) => {
    if (waveformHistory.length === 0) return null;

    let pathD = "";
    
    // Y coordinates for this lane
    const yTop = laneIndex * laneHeight + padding;
    const yMid = laneIndex * laneHeight + laneHeight / 2;
    const yBot = laneIndex * laneHeight + laneHeight - padding;

    const getY = (val: any) => val === 1 ? yTop : (val === 0 ? yBot : yMid);
    const isUnknown = (val: any) => val !== 0 && val !== 1;
    
    waveformHistory.forEach((snapshot, i) => {
      const val = snapshot.values[nodeId];
      const xStart = labelWidth + i * tickWidth;
      const xEnd = xStart + tickWidth;
      const y = getY(val);

      if (i === 0) {
        pathD += `M ${xStart} ${y} L ${xEnd} ${y}`;
      } else {
        const prevVal = waveformHistory[i - 1].values[nodeId];
        const prevY = getY(prevVal);
        if (y !== prevY) pathD += ` L ${xStart} ${y}`;
        pathD += ` L ${xEnd} ${y}`;
      }
    });

    const hasUnknown = waveformHistory.some(s => isUnknown(s.values[nodeId]));
    const strokeColor = hasUnknown ? '#94a3b8' : (nodeType === 'CLOCK' ? '#f59e0b' : nodeType === 'OUTPUT' ? '#22c55e' : '#0ea5e9');

    return (
      <path 
        d={pathD} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="2.5" 
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-white">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Signals: {trackedNodes.length} | Ticks: {waveformHistory.length}
        </span>
        <button 
          onClick={clearWaveformHistory}
          className="flex items-center space-x-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-slate-600 rounded transition-colors"
          title="Clear History"
        >
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-50 p-4"
      >
        <svg width={svgWidth} height={svgHeight} className="bg-white border border-gray-200 shadow-sm rounded">
          {/* Draw Grid Lines */}
          <g className="grid-lines" stroke="#e2e8f0" strokeWidth="1">
            {waveformHistory.map((_, i) => (
              <line 
                key={`v-${i}`} 
                x1={labelWidth + i * tickWidth} 
                y1={0} 
                x2={labelWidth + i * tickWidth} 
                y2={svgHeight} 
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Draw Lanes and Labels */}
          {trackedNodes.map((node, i) => {
            const laneY = i * laneHeight;
            return (
              <g key={`lane-${node.id}`}>
                {/* Lane separator */}
                <line x1={0} y1={laneY + laneHeight} x2={svgWidth} y2={laneY + laneHeight} stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Label Background */}
                <rect x={0} y={laneY} width={labelWidth} height={laneHeight} fill="#f8fafc" />
                <line x1={labelWidth} y1={laneY} x2={labelWidth} y2={laneY + laneHeight} stroke="#e2e8f0" strokeWidth="1" />
                
                {/* Label Text */}
                <text 
                  x={10} 
                  y={laneY + laneHeight / 2 + 4} 
                  fontSize="12" 
                  fontWeight="bold" 
                  fill="#475569"
                  fontFamily="monospace"
                >
                  {node.data.label.substring(0, 12)}
                </text>
                
                {/* Trace */}
                {renderTrace(node.id, i, node.data.type as string)}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
