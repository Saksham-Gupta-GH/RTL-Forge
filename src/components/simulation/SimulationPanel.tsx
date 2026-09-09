"use client";

import { useState } from 'react';
import clsx from 'clsx';
import { TruthTableViewer } from './TruthTableViewer';
import { TestbenchRunner } from './TestbenchRunner';
import { WaveformViewer } from './WaveformViewer';

type Tab = 'Properties' | 'Truth Table' | 'Testbench' | 'Waveform';

export function SimulationPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('Truth Table');
  const [isExpanded, setIsExpanded] = useState(false);

  const TABS: Tab[] = ['Properties', 'Truth Table', 'Testbench', 'Waveform'];

  return (
    <div className={clsx(
      "bg-white border-t border-gray-200 flex flex-col transition-all duration-300",
      isExpanded ? "h-64" : "h-10"
    )}>
      {/* Header / Tabs */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1 h-full">
          {TABS.map(tab => (
            <button
              key={tab}
              className={clsx(
                "px-4 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab 
                  ? "border-sky-600 text-sky-700 bg-white" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-gray-100"
              )}
              onClick={() => {
                setActiveTab(tab);
                if (!isExpanded) setIsExpanded(true);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <button 
          className="text-slate-500 hover:text-slate-800 text-sm font-medium px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼ Minimize' : '▲ Expand'}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden p-4">
          {activeTab === 'Truth Table' && <TruthTableViewer />}
          {activeTab === 'Testbench' && <TestbenchRunner />}
          {activeTab === 'Waveform' && <WaveformViewer />}
          {activeTab === 'Properties' && (
            <div className="text-slate-500 text-sm">
              Project properties will go here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
