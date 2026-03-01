import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  MessageSquare, 
  MapPin, 
  Route, 
  Recycle, 
  Users, 
  Settings,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ClipboardList, label: 'Solicitações por Chat Bot', path: '/solicitacoes' },
    { icon: MessageSquare, label: 'Atendimento', path: '/chat' },
    { icon: MapPin, label: 'Analisador de Mapa', path: '/mapa' },
    { icon: Route, label: 'Rotas de Coleta', path: '/rotas' },
    { icon: Recycle, label: 'Ecopontos', path: '/ecopontos' },
    { icon: Users, label: 'Usuários', path: '/usuarios' },
    { icon: Settings, label: 'Configurar Agente', path: '/configuracao' },
  ];

  const filteredMenu = user?.role === 'attendant' 
    ? menuItems.filter(item => ['Dashboard', 'Solicitações por Chat Bot', 'Atendimento'].includes(item.label))
    : menuItems;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-seurb-green p-2 rounded-lg">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">SEURB</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Prefeitura de Ananindeua</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-seurb-green/10 text-seurb-green" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-seurb-green flex items-center justify-center text-white font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role === 'manager' ? 'Gestor' : 'Atendente'}</p>
            </div>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Painel</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Versão 1.0.4
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
