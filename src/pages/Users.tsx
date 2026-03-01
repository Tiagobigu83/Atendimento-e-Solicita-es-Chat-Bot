import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Mail, Trash2, X, Save, Shield } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'attendant' as 'manager' | 'attendant'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    window.fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'attendant'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';

    const res = await window.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      loadUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
      await window.fetch(`/api/users/${id}`, { method: 'DELETE' });
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Usuários</h2>
          <p className="text-slate-500">Gerencie colaboradores e seus perfis de acesso</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-seurb-green hover:bg-seurb-green-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Novo Colaborador
        </button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-seurb-green flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'manager' ? 'Gestor' : 'Atendente'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  <span className="text-slate-300 text-xs">Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenModal(user)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button 
                onClick={() => handleDelete(user.id)}
                className="p-2 border border-slate-200 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do colaborador"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">E-mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ananindeua.pa.gov.br"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Perfil de Acesso</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'attendant' })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.role === 'attendant'
                        ? 'border-seurb-green bg-emerald-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <p className={`font-bold text-sm ${formData.role === 'attendant' ? 'text-seurb-green' : 'text-slate-700'}`}>Atendente</p>
                    <p className="text-[10px] text-slate-500 mt-1">Acesso operacional e chat</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'manager' })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.role === 'manager'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <p className={`font-bold text-sm ${formData.role === 'manager' ? 'text-purple-600' : 'text-slate-700'}`}>Gestor</p>
                    <p className="text-[10px] text-slate-500 mt-1">Acesso total ao sistema</p>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-seurb-green hover:bg-seurb-green-dark text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
