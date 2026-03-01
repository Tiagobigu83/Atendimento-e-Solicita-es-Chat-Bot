import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Clock, 
  Truck, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, inRoute: 0, completed: 0 });

  useEffect(() => {
    window.fetch('/api/dashboard')
      .then(res => res.json())
      .then(setStats);
  }, []);

  const cards = [
    { label: 'Total de Solicitações', value: stats.total, icon: ClipboardList, color: 'bg-blue-500', light: 'bg-blue-50' },
    { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'bg-amber-500', light: 'bg-amber-50' },
    { label: 'Em Rota', value: stats.inRoute, icon: Truck, color: 'bg-indigo-500', light: 'bg-indigo-50' },
    { label: 'Concluídas', value: stats.completed, icon: CheckCircle2, color: 'bg-emerald-500', light: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Visão geral das solicitações de serviços urbanos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.label}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.light} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                Hoje <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{card.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Bem-vindo ao Sistema SEURB</h3>
        <p className="text-slate-600 mb-6">Sistema de gerenciamento de serviços urbanos da Secretaria Municipal de Serviços Urbanos de Ananindeua.</p>
        
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Funcionalidades:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Atendimento automatizado via WhatsApp',
              'Gestão de solicitações de coleta de lixo, entulho e bueiros',
              'Cadastro de rotas e horários de coleta por bairro',
              'Controle de Ecopontos e pontos de reciclagem'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center py-8">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <span className="text-emerald-500">💚</span>
          Juntos por uma Ananindeua mais limpa e sustentável
        </div>
      </div>
    </div>
  );
}
