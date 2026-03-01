import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, Bot, Shield, MoreVertical, Search, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Chat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io();
    
    const loadSessions = () => {
      window.fetch('/api/chats')
        .then(res => res.json())
        .then(setSessions);
    };

    loadSessions();
    
    socketRef.current.on('chat_update', loadSessions);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeSession) {
      window.fetch(`/api/chats/${activeSession.id}/messages`)
        .then(res => res.json())
        .then(setMessages);
      
      socketRef.current?.emit('join_session', activeSession.id);
      socketRef.current?.on('new_message', (msg) => {
        if (msg.session_id === activeSession.id) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }
    return () => {
      socketRef.current?.off('new_message');
    };
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    const res = await window.fetch(`/api/chats/${activeSession.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, sender: 'user' })
    });

    if (res.ok) {
      setNewMessage('');
      // If user sends a message, take control from bot
      if (activeSession.status === 'bot') {
        await window.fetch(`/api/chats/${activeSession.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'human' })
        });
        setActiveSession({ ...activeSession, status: 'human' });
      }
    }
  };

  const toggleStatus = async () => {
    if (!activeSession) return;
    const newStatus = activeSession.status === 'bot' ? 'human' : 'bot';
    await window.fetch(`/api/chats/${activeSession.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    setActiveSession({ ...activeSession, status: newStatus });
  };

  return (
    <div className="h-full flex gap-6">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 mb-4">WhatsApp</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar conversas..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={async () => {
              const phone = `919${Math.floor(10000000 + Math.random() * 90000000)}`;
              await window.fetch('/api/webhook/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message: 'Olá', name: 'Cidadão Teste' })
              });
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3 h-3" />
            Simular Nova Conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${
                activeSession?.id === session.id ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{session.citizen_name || session.citizen_phone}</h4>
                  <span className="text-[10px] text-slate-400">
                    {session.last_message_time ? format(new Date(session.last_message_time), 'HH:mm') : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{session.last_message || 'Sem mensagens'}</p>
              </div>
              {session.status === 'bot' && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" title="Bot Ativo"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        {activeSession ? (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{activeSession.citizen_name || activeSession.citizen_phone}</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-slate-500">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleStatus}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeSession.status === 'bot' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {activeSession.status === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {activeSession.status === 'bot' ? 'Bot Ativo' : 'Controle Humano'}
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'citizen' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'citizen' 
                      ? 'bg-white border border-slate-200 text-slate-900 rounded-tl-none' 
                      : msg.sender === 'bot'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tr-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] font-bold uppercase tracking-wider">
                      {msg.sender === 'bot' && <Bot className="w-3 h-3" />}
                      {msg.sender === 'user' && <Shield className="w-3 h-3" />}
                      {msg.sender === 'citizen' ? 'Cidadão' : msg.sender === 'bot' ? 'Bot' : 'Atendente'}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className="text-[10px] mt-1 opacity-50 text-right">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-seurb-green/20"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-seurb-green hover:bg-seurb-green-dark text-white p-3 rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <MessageSquare className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">WhatsApp</h3>
            <p className="max-w-xs">Selecione uma conversa para começar o atendimento e visualizar o histórico de mensagens.</p>
          </div>
        )}
      </div>
    </div>
  );
}
