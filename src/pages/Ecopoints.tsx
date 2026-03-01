import React, { useState, useEffect } from 'react';
import { Plus, Recycle, MapPin, Clock, Edit2, Trash2, X, Save } from 'lucide-react';

export default function Ecopoints() {
  const [ecopoints, setEcopoints] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEco, setEditingEco] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    hours: '',
    materials: ''
  });

  useEffect(() => {
    loadEcopoints();
  }, []);

  const loadEcopoints = () => {
    window.fetch('/api/ecopoints')
      .then(res => res.json())
      .then(setEcopoints);
  };

  const handleOpenModal = (eco: any = null) => {
    if (eco) {
      setEditingEco(eco);
      setFormData({
        name: eco.name,
        address: eco.address,
        hours: eco.hours,
        materials: eco.materials
      });
    } else {
      setEditingEco(null);
      setFormData({
        name: '',
        address: '',
        hours: '',
        materials: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingEco ? 'PUT' : 'POST';
    const url = editingEco ? `/api/ecopoints/${editingEco.id}` : '/api/ecopoints';

    const res = await window.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      loadEcopoints();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este ecoponto?')) {
      await window.fetch(`/api/ecopoints/${id}`, { method: 'DELETE' });
      loadEcopoints();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ecopontos</h2>
          <p className="text-slate-500">Gerencie os pontos de entrega voluntária</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-seurb-green hover:bg-seurb-green-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Ecoponto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ecopoints.map((eco) => (
          <div key={eco.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <Recycle className="w-6 h-6 text-seurb-green" />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleOpenModal(eco)}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(eco.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-4">{eco.name}</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço</p>
                  <p className="text-sm text-slate-600">{eco.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Horário</p>
                  <p className="text-sm text-slate-600">{eco.hours}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Materiais Aceitos</p>
                <p className="text-xs text-slate-500 leading-relaxed">{eco.materials}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingEco ? 'Editar Ecoponto' : 'Novo Ecoponto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nome do Ecoponto</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ecoponto de PNEUS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Endereço Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Número, Bairro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Horário de Funcionamento</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="Ex: Segunda a sexta, 8h às 15h"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Materiais Aceitos</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 resize-none"
                  rows={3}
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="Liste os materiais aceitos..."
                />
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
                  Salvar Ecoponto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
