import { useState, useEffect } from 'react';
import { Settings, Save, Bot, MessageSquare, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Config() {
  const [settings, setSettings] = useState<any>({
    bot_name: '',
    welcome_message: '',
    bot_instructions: '',
    menu_message: '',
    off_hours_message: '',
    whatsapp_api_key: '',
    whatsapp_webhook_url: '',
    msg_coleta_lixo: '',
    msg_coleta_entulho: '',
    msg_limpeza_bueiro: '',
    msg_denuncia: '',
    msg_sinistro: '',
    msg_protocolo: '',
    msg_success: '',
    msg_conduta: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'script' | 'ai'>('general');

  useEffect(() => {
    window.fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings((prev: any) => ({ ...prev, ...data })));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await window.fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaving(false);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2",
        activeTab === id 
          ? "border-seurb-green text-seurb-green bg-seurb-green/5" 
          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h2>
          <p className="text-slate-500">Gerencie o comportamento e as integrações do chatbot</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-seurb-green hover:bg-seurb-green-dark text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-seurb-green/20"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200">
          <TabButton id="general" label="Geral & Integração" icon={Settings} />
          <TabButton id="script" label="Roteiro de Atendimento" icon={MessageSquare} />
          <TabButton id="ai" label="Inteligência Artificial" icon={Bot} />
        </div>

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Identidade</h3>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nome do Bot</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                    value={settings.bot_name || ''}
                    onChange={(e) => setSettings({ ...settings, bot_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">WhatsApp</h3>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">API Key</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                    value={settings.whatsapp_api_key || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                    placeholder="••••••••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Webhook URL</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs"
                    value={window.location.origin + '/api/webhook/whatsapp'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Verify Token (Meta Dashboard)</label>
                  <input 
                    type="text" 
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs font-mono"
                    value="seurb_ananindeua_token"
                  />
                  <p className="text-[10px] text-slate-400">Use este token ao configurar o Webhook no painel do Meta for Developers.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Mensagens Iniciais</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Boas-vindas (Comercial)</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 transition-all resize-none"
                      value={settings.welcome_message || ''}
                      onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Fora de Horário</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 transition-all resize-none"
                      value={settings.off_hours_message || ''}
                      onChange={(e) => setSettings({ ...settings, off_hours_message: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Menu Principal</label>
                    <textarea 
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 transition-all resize-none font-mono text-sm"
                      value={settings.menu_message || ''}
                      onChange={(e) => setSettings({ ...settings, menu_message: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Respostas do Menu</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">1. Coleta de Lixo</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_coleta_lixo || ''}
                        onChange={(e) => setSettings({ ...settings, msg_coleta_lixo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">2. Coleta de Entulho</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_coleta_entulho || ''}
                        onChange={(e) => setSettings({ ...settings, msg_coleta_entulho: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">3. Limpeza de Bueiro</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_limpeza_bueiro || ''}
                        onChange={(e) => setSettings({ ...settings, msg_limpeza_bueiro: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">5. Denúncia</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_denuncia || ''}
                        onChange={(e) => setSettings({ ...settings, msg_denuncia: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">6. Protocolo</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_protocolo || ''}
                        onChange={(e) => setSettings({ ...settings, msg_protocolo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">7. Sinistro</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_sinistro || ''}
                        onChange={(e) => setSettings({ ...settings, msg_sinistro: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">8. Conduta de Servidor</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_conduta || ''}
                        onChange={(e) => setSettings({ ...settings, msg_conduta: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Sucesso (Final)</label>
                      <textarea 
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        value={settings.msg_success || ''}
                        onChange={(e) => setSettings({ ...settings, msg_success: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Instruções da IA (Gemini)</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Prompt do Sistema</label>
                <textarea 
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20 transition-all resize-none font-mono text-sm"
                  value={settings.bot_instructions || ''}
                  onChange={(e) => setSettings({ ...settings, bot_instructions: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
