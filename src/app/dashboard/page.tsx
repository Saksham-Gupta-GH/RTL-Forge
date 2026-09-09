"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Clock, Cpu, LogOut } from 'lucide-react';

interface ProjectSnippet {
  id: string;
  name: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isGuest = localStorage.getItem('rtlforge_isGuest') === 'true';
    if (isGuest) {
      router.push('/editor/sandbox');
      return;
    }

    const sessionId = localStorage.getItem('rtlforge_session');
    if (!sessionId) {
      router.push('/login');
      return;
    }

    fetch(`/api/projects?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(err => console.error("Failed to load projects", err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleNewProject = async () => {
    const sessionId = localStorage.getItem('rtlforge_session');
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        name: 'Untitled Project',
        description: ''
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      router.push(`/editor/${data.id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rtlforge_session');
    localStorage.removeItem('rtlforge_isGuest');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-sky-600 rounded-sm flex items-center justify-center">
            <Cpu size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-wide text-xl">RTLForge</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
          <button 
            onClick={handleNewProject}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </div>

        {loading ? (
          <div className="text-slate-500 flex justify-center py-20 font-medium">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed shadow-sm">
            <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu size={32} className="text-sky-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Create your first digital logic project to start designing, simulating, and verifying circuits.
            </p>
            <button 
              onClick={handleNewProject}
              className="bg-white hover:bg-gray-50 text-slate-700 px-6 py-2.5 rounded-lg font-semibold transition-all border border-gray-300 shadow-sm"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <Link 
                href={`/editor/${p.id}`} 
                key={p.id}
                className="bg-white border border-gray-200 hover:border-sky-400 hover:shadow-md rounded-xl p-6 transition-all group block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 group-hover:bg-sky-100 group-hover:text-sky-700 transition-colors">
                    <Cpu size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">{p.name}</h3>
                <div className="flex items-center text-xs text-slate-500 space-x-1">
                  <Clock size={12} />
                  <span>Last edited {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
