import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-10 text-center">
          <div className="bg-[#00C08B] w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00C08B]/20">
            <Leaf className="text-white w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SEURB Ananindeua</h1>
          <div className="inline-block px-4 py-1 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Gestão de Serviços Urbanos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
              <Mail className="w-4 h-4 text-slate-400" />
              E-mail
            </label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00C08B]/20 focus:border-[#00C08B] transition-all text-slate-900 placeholder:text-slate-400"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
              <Lock className="w-4 h-4 text-slate-400" />
              Senha
            </label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00C08B]/20 focus:border-[#00C08B] transition-all text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00C08B] hover:bg-[#00A678] text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-[#00C08B]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Entrar no Sistema'}
          </button>

          <div className="text-center pt-2">
            <button type="button" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              Esqueceu sua senha? Entre em contato com o suporte.
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
