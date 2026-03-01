import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, Edit2, Trash2, Info, X, Save } from 'lucide-react';

export default function Routes() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    neighborhoods: '',
    days: [] as string[],
    hours: '',
    observations: ''
  });

  const availableDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = () => {
    window.fetch('/api/routes')
      .then(res => res.json())
      .then(setRoutes);
  };

  const handleOpenModal = (route: any = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        name: route.name,
        neighborhoods: route.neighborhoods,
        days: JSON.parse(route.days),
        hours: route.hours,
        observations: route.observations || ''
      });
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        neighborhoods: '',
        days: [],
        hours: '',
        observations: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingRoute ? 'PUT' : 'POST';
    const url = editingRoute ? `/api/routes/${editingRoute.id}` : '/api/routes';

    const res = await window.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      loadRoutes();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta rota?')) {
      await window.fetch(`/api/routes/${id}`, { method: 'DELETE' });
      loadRoutes();
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rotas de Coleta</h2>
          <p className="text-slate-500">Gerencie os dias e horários de coleta por bairro</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-seurb-green hover:bg-seurb-green-dark text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Rota
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <MapPin className="w-6 h-6 text-seurb-green" />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleOpenModal(route)}
                  className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(route.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-4">{route.name}</h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dias de Coleta</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(route.days).map((day: string) => (
                    <span key={day} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Horário</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{route.hours}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observações</p>
                <div className="flex items-start gap-2 text-slate-500">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">{route.observations}</p>
                </div>
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
                {editingRoute ? 'Editar Rota' : 'Nova Rota de Coleta'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nome da Rota</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Rota 101 - Centro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Bairros Atendidos</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.neighborhoods}
                  onChange={(e) => setFormData({ ...formData, neighborhoods: e.target.value })}
                  placeholder="Ex: Centro, Coqueiro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Dias de Coleta</label>
                <div className="flex flex-wrap gap-2">
                  {availableDays.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        formData.days.includes(day)
                          ? 'bg-seurb-green text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Horário</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="Ex: 08:00 - 12:00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Observações</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 resize-none"
                  rows={3}
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
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
                  Salvar Rota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
