import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, MapPin, Calendar, Clock, ClipboardList, X, CheckCircle2, AlertCircle, Truck, Trash2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('Todos os status');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const loadRequests = () => {
    window.fetch('/api/requests')
      .then(res => res.json())
      .then(setRequests);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filtered = requests.filter(r => {
    const matchesStatus = filter === 'Todos os status' || r.status === filter;
    const matchesSearch = r.protocol.toLowerCase().includes(search.toLowerCase()) || 
                         r.citizen_name.toLowerCase().includes(search.toLowerCase()) ||
                         r.address.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-amber-100 text-amber-700';
      case 'Em análise': return 'bg-blue-100 text-blue-700';
      case 'Em rota': return 'bg-indigo-100 text-indigo-700';
      case 'Concluído': return 'bg-emerald-100 text-emerald-700';
      case 'Cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    await window.fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadRequests();
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    await window.fetch(`/api/requests/${id}`, { method: 'DELETE' });
    loadRequests();
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Solicitações</h2>
          <p className="text-slate-500">Gerencie todas as solicitações de serviços</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por protocolo, nome ou endereço..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 focus:border-seurb-green transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select 
            className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 appearance-none cursor-pointer text-sm font-medium text-slate-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Todos os status</option>
            <option>Pendente</option>
            <option>Em análise</option>
            <option>Em rota</option>
            <option>Concluído</option>
            <option>Cancelado</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((req) => (
          <div 
            key={req.id} 
            onClick={() => setSelectedRequest(req)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-lg">{req.protocol}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
                <span className="text-slate-400 text-sm">
                  {format(new Date(req.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {req.photo_url && <ImageIcon className="w-4 h-4 text-seurb-green" />}
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cidadão</p>
                <p className="text-slate-900 font-medium">{req.citizen_name}</p>
                <p className="text-slate-500 text-sm">{req.citizen_phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Serviço</p>
                <p className="text-slate-900 font-medium">{req.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço</p>
                <p className="text-slate-900 font-medium flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  {req.address}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma solicitação encontrada</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-900">{selectedRequest.protocol}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Informações da Solicitação
                      </h4>
                      <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Tipo de Serviço</p>
                          <p className="font-bold text-slate-900">{selectedRequest.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Data de Abertura</p>
                          <p className="font-medium text-slate-900">
                            {format(new Date(selectedRequest.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Detalhes</p>
                          <p className="text-slate-600 text-sm leading-relaxed">{selectedRequest.details || 'Nenhum detalhe adicional fornecido.'}</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Localização
                      </h4>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="text-slate-900 font-medium">{selectedRequest.address}</p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ações</h4>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => updateStatus(selectedRequest.id, 'Em análise')}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                          <Search className="w-4 h-4" /> Analisar
                        </button>
                        <button 
                          onClick={() => updateStatus(selectedRequest.id, 'Em rota')}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4" /> Despachar
                        </button>
                        <button 
                          onClick={() => updateStatus(selectedRequest.id, 'Concluído')}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Concluir
                        </button>
                        <button 
                          onClick={() => deleteRequest(selectedRequest.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Foto Enviada</h4>
                      <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 flex items-center justify-center relative group">
                        {selectedRequest.photo_url ? (
                          <img 
                            src={selectedRequest.photo_url} 
                            alt="Solicitação" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-8">
                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 text-sm">Nenhuma foto anexada a esta solicitação.</p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cidadão</h4>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <p className="font-bold text-slate-900">{selectedRequest.citizen_name}</p>
                        <p className="text-slate-500 text-sm">{selectedRequest.citizen_phone}</p>
                        <button className="mt-4 w-full py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                          Ver Histórico de Chat
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
