import Link from 'next/link';
import { Cpu, Zap, Activity, Box, LogIn, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 selection:bg-sky-500/30 font-sans">
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-sky-600 rounded-sm flex items-center justify-center">
            <Cpu size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-wide text-xl">RTLForge</span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/login" className="flex items-center space-x-1 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded transition-colors shadow-sm">
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-24 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-8 border border-sky-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>Interactive Digital Logic Lab</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Design. Simulate. <span className="text-sky-600">Verify.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            An interactive digital logic and RTL experimentation environment built for exploring hierarchical hardware design.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/dashboard"
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg w-full sm:w-auto flex items-center justify-center space-x-2"
            >
              <span>Launch Simulator</span>
              <ChevronRight size={18} />
            </Link>
            <Link 
              href="/editor/sandbox"
              className="bg-white hover:bg-gray-50 text-slate-700 px-8 py-3.5 rounded-lg font-semibold transition-all border border-gray-300 shadow-sm w-full sm:w-auto"
            >
              Try Sandbox (Guest)
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-24 bg-white border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
                  <Box className="text-sky-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Hierarchical Components</h3>
                <p className="text-slate-600 leading-relaxed">
                  Build complex circuits by abstracting sub-circuits into reusable black-box components. From basic logic gates to ALUs.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Simulation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Deterministic simulation engine supporting 4-value logic (0, 1, X, Z) and cycle-accurate sequential elements.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Activity className="text-emerald-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verification & Testbenches</h3>
                <p className="text-slate-600 leading-relaxed">
                  Write test vectors, execute testbenches, generate truth tables, and visually inspect signal waveforms over time.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-6">
                  <Cpu className="text-slate-700" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Engineering Grade</h3>
                <p className="text-slate-600 leading-relaxed">
                  Built for semiconductor engineering concepts. A robust, purely client-side simulator with cloud persistence.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 border-t border-gray-200 bg-white text-center text-slate-500 text-sm">
        <p>Built as a portfolio project demonstrating digital logic, RTL concepts, and software engineering.</p>
      </footer>
    </div>
  );
}
