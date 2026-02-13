
import React, { useState } from 'react';
import { Icons } from '../constants';
import { userService } from '../services/userService';

interface LoginPageProps {
  onLogin: (email: string) => void;
  initialMode?: 'login' | 'signup';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulated Backend Auth Call
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (mode === 'signup') {
        if (!name) {
          setError('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        const response = userService.register(name, email, password);
        if (response.success) {
          onLogin(email);
        } else {
          setError(response.error || 'Signup failed.');
        }
      } else {
        const response = userService.login(email, password);
        if (response.success) {
          onLogin(email);
        } else {
          setError(response.error || 'Login failed.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-100 mx-auto mb-6">S</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join SkillSwap'}
          </h1>
          <p className="text-slate-500 font-medium">
            {mode === 'login' ? 'Exchange your skills, not your money.' : 'Start your journey of peer-to-peer learning today.'}
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Profile />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs font-bold text-rose-500 text-center animate-in shake duration-300">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Log In to SkillSwap' : 'Create Your Account'
              )}
            </button>
          </form>


        </div>

        <p className="mt-10 text-center text-sm text-slate-400 font-medium">
          {mode === 'login' ? (
            <>
              New to the community? <button onClick={() => setMode('signup')} className="text-indigo-600 font-bold hover:underline">Create an account</button>
            </>
          ) : (
            <>
              Already have an account? <button onClick={() => setMode('login')} className="text-indigo-600 font-bold hover:underline">Sign In instead</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
