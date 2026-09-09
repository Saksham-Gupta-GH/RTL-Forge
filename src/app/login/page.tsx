"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Lock, User, LogIn, ChevronRight, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: isLoginMode ? 'login' : 'register',
          username, 
          email: isLoginMode ? undefined : email,
          password 
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('rtlforge_session', data.sessionId);
        localStorage.setItem('rtlforge_isGuest', 'false');
        router.push('/dashboard');
      } else {
        const err = await res.json();
        setError(err.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    localStorage.setItem('rtlforge_session', 'guest_' + Math.random().toString(36).substring(7));
    localStorage.setItem('rtlforge_isGuest', 'true');
    router.push('/editor/sandbox');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-sky-600 rounded-md flex items-center justify-center">
          <Cpu size={20} className="text-white" />
        </div>
        <span className="font-bold text-slate-900 tracking-wide text-3xl">RTLForge</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Toggle tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 text-center font-semibold transition-colors ${isLoginMode ? 'text-sky-600 border-b-2 border-sky-600 bg-white' : 'text-slate-500 hover:text-slate-700 bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => { setIsLoginMode(true); setError(''); }}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 py-4 text-center font-semibold transition-colors ${!isLoginMode ? 'text-sky-600 border-b-2 border-sky-600 bg-white' : 'text-slate-500 hover:text-slate-700 bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => { setIsLoginMode(false); setError(''); }}
          >
            Create Account
          </button>
        </div>

        <div className="px-8 py-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isLoginMode ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLoginMode ? 'Enter your credentials to access your projects.' : 'Start designing your circuits today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-slate-900"
                  placeholder="e.g. jdoe"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required={!isLoginMode}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-slate-900"
                    placeholder="e.g. user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-slate-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-lg font-semibold transition-all shadow-md disabled:opacity-70"
            >
              {isLoginMode ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{loading ? 'Authenticating...' : (isLoginMode ? 'Sign In' : 'Sign Up')}</span>
            </button>
          </form>
        </div>
        
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-slate-500 mb-4">Just want to try it out?</p>
          <button 
            onClick={handleGuest}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-slate-700 border border-gray-300 py-2.5 rounded-lg font-semibold transition-all"
          >
            <span>Continue as Guest</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
