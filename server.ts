import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { supabase } from "./server_supabase.ts";
import { format } from "date-fns";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  app.use(express.json());

  // Auth
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (user && password === "admin123") {
      res.json(user);
    } else {
      res.status(401).json({ message: "Credenciais inválidas. Use a senha padrão admin123" });
    }
  });

  // Dashboard
  app.get("/api/dashboard", async (req, res) => {
    const { count: total } = await supabase.from("requests").select("*", { count: 'exact', head: true });
    const { count: pending } = await supabase.from("requests").select("*", { count: 'exact', head: true }).eq("status", "Pendente");
    const { count: inRoute } = await supabase.from("requests").select("*", { count: 'exact', head: true }).eq("status", "Em rota");
    const { count: completed } = await supabase.from("requests").select("*", { count: 'exact', head: true }).eq("status", "Concluído");
    
    res.json({
      total: total || 0,
      pending: pending || 0,
      inRoute: inRoute || 0,
      completed: completed || 0
    });
  });

  // Requests CRUD
  app.get("/api/requests", async (req, res) => {
    const { data: requests } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    res.json(requests || []);
  });

  app.patch("/api/requests/:id", async (req, res) => {
    const { status } = req.body;
    await supabase.from("requests").update({ status }).eq("id", req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/requests/:id", async (req, res) => {
    await supabase.from("requests").delete().eq("id", req.params.id);
    res.json({ success: true });
  });

  // Routes CRUD
  app.get("/api/routes", async (req, res) => {
    const { data: routes } = await supabase.from("routes").select("*");
    res.json(routes || []);
  });

  app.post("/api/routes", async (req, res) => {
    const { name, neighborhoods, days, hours, observations } = req.body;
    const { data } = await supabase
      .from("routes")
      .insert([{ name, neighborhoods, days: JSON.stringify(days), hours, observations }])
      .select()
      .single();
    res.json({ id: data?.id });
  });

  app.put("/api/routes/:id", async (req, res) => {
    const { name, neighborhoods, days, hours, observations } = req.body;
    await supabase
      .from("routes")
      .update({ name, neighborhoods, days: JSON.stringify(days), hours, observations })
      .eq("id", req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/routes/:id", async (req, res) => {
    await supabase.from("routes").delete().eq("id", req.params.id);
    res.json({ success: true });
  });

  // Ecopoints CRUD
  app.get("/api/ecopoints", async (req, res) => {
    const { data: ecopoints } = await supabase.from("ecopoints").select("*");
    res.json(ecopoints || []);
  });

  app.post("/api/ecopoints", async (req, res) => {
    const { name, address, hours, materials } = req.body;
    const { data } = await supabase
      .from("ecopoints")
      .insert([{ name, address, hours, materials }])
      .select()
      .single();
    res.json({ id: data?.id });
  });

  app.put("/api/ecopoints/:id", async (req, res) => {
    const { name, address, hours, materials } = req.body;
    await supabase
      .from("ecopoints")
      .update({ name, address, hours, materials })
      .eq("id", req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/ecopoints/:id", async (req, res) => {
    await supabase.from("ecopoints").delete().eq("id", req.params.id);
    res.json({ success: true });
  });

  // Users CRUD
  app.get("/api/users", async (req, res) => {
    const { data: users } = await supabase.from("users").select("*");
    res.json(users || []);
  });

  app.post("/api/users", async (req, res) => {
    const { name, email, role } = req.body;
    const { data } = await supabase
      .from("users")
      .insert([{ name, email, role }])
      .select()
      .single();
    res.json({ id: data?.id });
  });

  app.put("/api/users/:id", async (req, res) => {
    const { name, email, role } = req.body;
    await supabase
      .from("users")
      .update({ name, email, role })
      .eq("id", req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/users/:id", async (req, res) => {
    await supabase.from("users").delete().eq("id", req.params.id);
    res.json({ success: true });
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    const { data: settings } = await supabase.from("settings").select("*");
    const config: any = {};
    settings?.forEach((s: any) => config[s.key] = s.value);
    res.json(config);
  });

  app.post("/api/settings", async (req, res) => {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        await supabase.from("settings").upsert({ key, value });
      }
    }
    res.json({ success: true });
  });

  // Chat API
  app.get("/api/chats", async (req, res) => {
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select(`
        *,
        messages (
          content,
          created_at
        )
      `)
      .order("last_message_at", { ascending: false });
    
    // Transform to match the expected format (last_message, last_message_time)
    const formattedSessions = sessions?.map(s => {
      const lastMsg = s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1] : null;
      return {
        ...s,
        last_message: lastMsg?.content,
        last_message_time: lastMsg?.created_at
      };
    });

    res.json(formattedSessions || []);
  });

  app.get("/api/chats/:id/messages", async (req, res) => {
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", req.params.id)
      .order("created_at", { ascending: true });
    res.json(messages || []);
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    const { content, sender } = req.body;
    const sessionId = req.params.id;
    
    const { data: message } = await supabase
      .from("messages")
      .insert([{ session_id: sessionId, sender, content }])
      .select()
      .single();

    await supabase
      .from("chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId);
    
    io.to(`session_${sessionId}`).emit("new_message", message);
    
    res.json(message);
  });

  app.post("/api/chats/:id/status", async (req, res) => {
    const { status } = req.body;
    await supabase.from("chat_sessions").update({ status }).eq("id", req.params.id);
    res.json({ success: true });
  });

  // Mock WhatsApp Webhook
  app.post("/api/webhook/whatsapp", async (req, res) => {
    const { phone, message, name } = req.body;
    
    let { data: session } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("citizen_phone", phone)
      .single();

    if (!session) {
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert([{ citizen_phone: phone, citizen_name: name }])
        .select()
        .single();
      session = newSession;
    }

    // Save user message
    const { data: userMsg } = await supabase
      .from("messages")
      .insert([{ session_id: session.id, sender: 'citizen', content: message }])
      .select()
      .single();

    await supabase
      .from("chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", session.id);
    
    io.emit("chat_update");
    io.to(`session_${session.id}`).emit("new_message", userMsg);

    // Bot Logic if status is 'bot'
    if (session.status === 'bot') {
      const botResponse = await handleBotLogic(session, message);
      if (botResponse) {
        const { data: botMsg } = await supabase
          .from("messages")
          .insert([{ session_id: session.id, sender: 'bot', content: botResponse }])
          .select()
          .single();
        io.to(`session_${session.id}`).emit("new_message", botMsg);
      }
    }

    res.json({ success: true });
  });

  async function handleBotLogic(session: any, message: string) {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const isWorkingHours = day >= 1 && day <= 5 && hour >= 8 && hour < 15;

    const state = session.current_state;
    let response = "";
    let nextState = state;

    const { data: settingsList } = await supabase.from("settings").select("*");
    const config: any = {};
    settingsList?.forEach((s: any) => config[s.key] = s.value);

    // AI Enhanced Logic for complex queries or natural language
    if (message.length > 100 || message.toLowerCase().includes("ajuda") || message.toLowerCase().includes("problema")) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          config: { systemInstruction: config.bot_instructions || "Você é um assistente da SEURB Ananindeua." },
          contents: `Cidadão (${session.citizen_name || 'Desconhecido'}): ${message}`
        });
        return aiResponse.text;
      } catch (e) {
        console.error("Gemini Error:", e);
      }
    }

    const menuOptions = `1️⃣ Coleta de lixo domiciliar\n2️⃣ Coleta de entulho\n3️⃣ Limpeza de bueiros\n4️⃣ Ecopontos e reciclagem\n5️⃣ Denúncia de descarte irregular\n6️⃣ Acompanhar protocolo\n7️⃣ Comunicação de sinistro\n8️⃣ Conduta de servidor`;

    switch (state) {
      case 'START':
        if (!isWorkingHours) {
          response = config.off_hours_message || `👋 Bem-vindo ao atendimento virtual da Secretaria Municipal de Serviços Urbanos (SEURB) – Prefeitura de Ananindeua!\n\n⏰ Nosso atendimento é de segunda a sexta-feira (exceto feriados), de 8h às 15h.\n\n🙏 A SEURB agradece seu contato!`;
          nextState = 'START';
        } else {
          response = config.welcome_message || `👋 Bem-vindo ao atendimento virtual da Secretaria Municipal de Serviços Urbanos (SEURB) – Prefeitura de Ananindeua!\n\n⏰ Atendimento: segunda a sexta, 8h às 15h (exceto feriados).\n\n🙏 A SEURB agradece seu contato!\n\nPara uma melhor experiência, qual seu nome completo?`;
          nextState = 'AWAITING_NAME';
        }
        break;

      case 'AWAITING_NAME':
        await supabase.from("chat_sessions").update({ citizen_name: message, current_state: 'MAIN_MENU' }).eq("id", session.id);
        response = `✅ Legal, ${message}!\n\nEscolha uma opção abaixo:\n\n${menuOptions}`;
        nextState = 'MAIN_MENU';
        break;

      case 'MAIN_MENU':
        switch (message) {
          case '1':
            response = config.msg_coleta_lixo || `⚠️ Devido à alta demanda, o tempo de resposta pode variar. Agradecemos sua compreensão.\n\n📅 Confira os dias e horários da coleta em seu bairro: [link]\n\n📍 Por gentileza, informe o endereço completo:\n(Ex: Rua das Flores, 123 – Bairro Centro)`;
            nextState = 'LIXO_ADDRESS';
            break;
          case '2':
            response = config.msg_coleta_entulho || `⚠️ Devido à alta demanda, o tempo de resposta pode variar. Agradecemos sua compreensão.\n\n📍 Informe o endereço completo para coleta:\n(Ex: Av. Brasil, 456 – Bairro Jardim)`;
            nextState = 'ENTULHO_ADDRESS';
            break;
          case '3':
            response = config.msg_limpeza_bueiro || `⚠️ Devido à alta demanda, o tempo de resposta pode variar. Agradecemos sua compreensão.\n\n📌 Atendemos apenas bueiros entupidos na via pública que causem alagamento ou impeçam o escoamento da água.\n\n📍 Informe o endereço completo do bueiro:`;
            nextState = 'BUEIRO_ADDRESS';
            break;
          case '4':
            const { data: ecopoints } = await supabase.from("ecopoints").select("*");
            response = `♻️ Você está consultando os Pontos de Entrega Voluntária de Ananindeua!\n\n📌 São locais gratuitos para descartar resíduos que não são coletados na coleta domiciliar:\n• Entulho de construção (até 1m³)\n• Pneus\n• Móveis e eletroeletrônicos inservíveis\n• Podas de árvores (galhos, folhas)\n• Óleo de cozinha usado (em garrafa PET fechada)\n• Recicláveis (papel/papelão, plástico, metal, vidro)\n• Lâmpadas\n\n🗺️ Ecopontos disponíveis em Ananindeua:\n\n` + 
                       (ecopoints?.map(e => `📍 *${e.name}*\n• Endereço: ${e.address}\n• Horário: ${e.hours}\n• Aceita: ${e.materials}`).join('\n\n') || "") +
                       `\n\n🔁 Deseja voltar ao menu principal? (Sim/Não)`;
            nextState = 'BACK_TO_MENU';
            break;
          case '5':
            response = config.msg_denuncia || `🚨 Denúncia de descarte irregular de lixo/entulho\n\n📍 Informe o endereço exato onde ocorreu o descarte:`;
            nextState = 'DENUNCIA_ADDRESS';
            break;
          case '6':
            response = config.msg_protocolo || `🔍 Acompanhar Protocolo\n\nInforme o número do seu protocolo:`;
            nextState = 'TRACK_PROTOCOL';
            break;
          case '7':
            response = config.msg_sinistro || `Comunicação de Sinistro\n\nLocal da ocorrência:`;
            nextState = 'SINISTRO_LOCAL';
            break;
          case '8':
            response = config.msg_conduta || `Registro sobre Conduta de Servidor\n\nLocal da ocorrência:`;
            nextState = 'CONDUTA_LOCAL';
            break;
          default:
            response = `❌ Opção inválida. Escolha uma opção de 1 a 8:\n\n${menuOptions}`;
            nextState = 'MAIN_MENU';
        }
        break;

      // LIXO FLOW
      case 'LIXO_ADDRESS':
        await saveTemp(session.id, { address: message, type: 'Coleta de lixo domiciliar' });
        response = `❓ ${session.citizen_name}, há quanto tempo não passa o caminhão de lixo no seu endereço?`;
        nextState = 'LIXO_TIME';
        break;
      case 'LIXO_TIME':
        await updateTemp(session.id, { time: message });
        response = `📸 Nos encaminhe uma foto do acúmulo de lixo, por gentileza.\n(Isso agiliza o atendimento da equipe)`;
        nextState = 'LIXO_PHOTO';
        break;
      case 'LIXO_PHOTO':
        const lixoData = await getTemp(session.id);
        const lixoProtocol = await registerRequest(session, lixoData.type, lixoData.address, `Há quanto tempo: ${message}`);
        response = `✅ Solicitação registrada!\n\nProtocolo: ${lixoProtocol}\nEndereço: ${lixoData.address}\nServiço: ${lixoData.type}\n\n⏳ Prazo estimado: 24 a 48h úteis.\n\n🔁 Deseja algo mais? (Sim/Não)`;
        nextState = 'FINAL_CHECK';
        break;

      // ENTULHO FLOW
      case 'ENTULHO_ADDRESS':
        await saveTemp(session.id, { address: message, type: 'Coleta de entulho' });
        response = `📦 Qual o tipo e volume aproximado do entulho?\n(Ex: "restos de construção – 2 sacos", "móvel quebrado – sofá", "poda de árvore – 3 galhos")`;
        nextState = 'ENTULHO_VOLUME';
        break;
      case 'ENTULHO_VOLUME':
        await updateTemp(session.id, { volume: message });
        response = `📸 Envie uma foto do entulho para agilizarmos o atendimento? (Sim/Não)`;
        nextState = 'ENTULHO_PHOTO_ASK';
        break;
      case 'ENTULHO_PHOTO_ASK':
        if (message.toLowerCase().includes('sim')) {
          response = `Por favor, envie a foto agora:`;
          nextState = 'ENTULHO_PHOTO';
        } else {
          const entulhoData = await getTemp(session.id);
          const entulhoProtocol = await registerRequest(session, entulhoData.type, entulhoData.address, `Volume/Tipo: ${entulhoData.volume}`);
          response = `✅ Solicitação registrada!\n\nProtocolo: ${entulhoProtocol}\nEndereço: ${entulhoData.address}\nServiço: ${entulhoData.type}\n\n⏳ Prazo estimado: A coleta agendada acontecerá conforme rotina das equipes.\n\n🔁 Deseja algo mais? (Sim/Não)`;
          nextState = 'FINAL_CHECK';
        }
        break;
      case 'ENTULHO_PHOTO':
        const entulhoDataP = await getTemp(session.id);
        const entulhoProtocolP = await registerRequest(session, entulhoDataP.type, entulhoDataP.address, `Volume/Tipo: ${entulhoDataP.volume}`);
        response = `✅ Solicitação registrada!\n\nProtocolo: ${entulhoProtocolP}\nEndereço: ${entulhoDataP.address}\nServiço: ${entulhoDataP.type}\n\n⏳ Prazo estimado: A coleta agendada acontecerá conforme rotina das equipes.\n\n🔁 Deseja algo mais? (Sim/Não)`;
        nextState = 'FINAL_CHECK';
        break;

      // BUEIRO FLOW
      case 'BUEIRO_ADDRESS':
        await saveTemp(session.id, { address: message, type: 'Limpeza de bueiro' });
        response = `💧 Descreva a situação:\n(Ex: "água parada após chuva", "bueiro entupido com folhas", "alagamento na calçada")`;
        nextState = 'BUEIRO_DESC';
        break;
      case 'BUEIRO_DESC':
        await updateTemp(session.id, { description: message });
        response = `📸 Envie uma foto do bueiro entupido? (Sim/Não)`;
        nextState = 'BUEIRO_PHOTO_ASK';
        break;
      case 'BUEIRO_PHOTO_ASK':
        if (message.toLowerCase().includes('sim')) {
          response = `Por favor, envie a foto agora:`;
          nextState = 'BUEIRO_PHOTO';
        } else {
          const bueiroData = await getTemp(session.id);
          const bueiroProtocol = await registerRequest(session, bueiroData.type, bueiroData.address, bueiroData.description);
          response = `✅ Solicitação registrada!\n\nProtocolo: ${bueiroProtocol}\nEndereço: ${bueiroData.address}\nServiço: ${bueiroData.type}\n\n⏳ Prazo estimado: 24 a 72h.\n\n🔁 Deseja algo mais? (Sim/Não)`;
          nextState = 'FINAL_CHECK';
        }
        break;
      case 'BUEIRO_PHOTO':
        const bueiroDataP = await getTemp(session.id);
        const bueiroProtocolP = await registerRequest(session, bueiroDataP.type, bueiroDataP.address, bueiroDataP.description);
        response = `✅ Solicitação registrada!\n\nProtocolo: ${bueiroProtocolP}\nEndereço: ${bueiroDataP.address}\nServiço: ${bueiroDataP.type}\n\n⏳ Prazo estimado: 24 a 72h.\n\n🔁 Deseja algo mais? (Sim/Não)`;
        nextState = 'FINAL_CHECK';
        break;

      // DENUNCIA FLOW
      case 'DENUNCIA_ADDRESS':
        await saveTemp(session.id, { address: message, type: 'Denúncia de descarte irregular' });
        response = `📸 Envie uma foto do descarte irregular (com data/hora visível, se possível).`;
        nextState = 'DENUNCIA_PHOTO';
        break;
      case 'DENUNCIA_PHOTO':
        const denunciaData = await getTemp(session.id);
        const denunciaProtocol = await registerRequest(session, denunciaData.type, denunciaData.address, `Denúncia registrada.`);
        response = `✅ Denúncia registrada!\n\nProtocolo: ${denunciaProtocol}\nEndereço: ${denunciaData.address}\n\n🔁 Deseja algo mais? (Sim/Não)`;
        nextState = 'FINAL_CHECK';
        break;

      // SINISTRO FLOW
      case 'SINISTRO_LOCAL':
        await saveTemp(session.id, { address: message, type: 'Comunicação de Sinistro' });
        response = `Data e horário do ocorrido:`;
        nextState = 'SINISTRO_DATE';
        break;
      case 'SINISTRO_DATE':
        await updateTemp(session.id, { date: message });
        response = `Descreva detalhadamente o que aconteceu:`;
        nextState = 'SINISTRO_DESC';
        break;
      case 'SINISTRO_DESC':
        await updateTemp(session.id, { description: message });
        response = `Anexe fotos ou vídeos do ocorrido:`;
        nextState = 'SINISTRO_PHOTO';
        break;
      case 'SINISTRO_PHOTO':
        response = `Informe os dados para contato:`;
        nextState = 'SINISTRO_CONTACT';
        break;
      case 'SINISTRO_CONTACT':
        await updateTemp(session.id, { contact: message });
        response = `Se houver veículo envolvido, informe modelo, cor e placa:`;
        nextState = 'SINISTRO_VEHICLE';
        break;
      case 'SINISTRO_VEHICLE':
        const sinistroData = await getTemp(session.id);
        const sinistroProtocol = await registerRequest(session, sinistroData.type, sinistroData.address, `Data: ${sinistroData.date}\nDesc: ${sinistroData.description}\nContato: ${sinistroData.contact}\nVeículo: ${message}`);
        response = `✅ Solicitação registrada com sucesso.\n\nProtocolo: ${sinistroProtocol}\n\n🔁 Deseja algo mais? (Sim/Não)`;
        nextState = 'FINAL_CHECK';
        break;

      // CONDUTA FLOW
      case 'CONDUTA_LOCAL':
        await saveTemp(session.id, { address: message, type: 'Registro de Conduta de Servidor' });
        response = `Data do ocorrido:`;
        nextState = 'CONDUTA_DATE';
        break;
      case 'CONDUTA_DATE':
        await updateTemp(session.id, { date: message });
        response = `Nome do servidor (se souber):`;
        nextState = 'CONDUTA_NAME';
        break;
      case 'CONDUTA_NAME':
        await updateTemp(session.id, { server_name: message });
        response = `Descreva detalhadamente a situação:`;
        nextState = 'CONDUTA_DESC';
        break;
      case 'CONDUTA_DESC':
        const condutaData = await getTemp(session.id);
        const condutaProtocol = await registerRequest(session, condutaData.type, condutaData.address, `Data: ${condutaData.date}\nServidor: ${condutaData.server_name}\nDesc: ${message}`);
        response = `✅ Registro efetuado com sucesso.\n\nProtocolo: ${condutaProtocol}\n\n🔁 Deseja algo mais? (Sim/Não)`;
        nextState = 'FINAL_CHECK';
        break;

      case 'TRACK_PROTOCOL':
        const { data: req } = await supabase.from("requests").select("*").eq("protocol", message).single();
        if (req) {
          response = `🔍 Protocolo: ${req.protocol}\nStatus: ${req.status}\nTipo: ${req.type}\nData: ${format(new Date(req.created_at), 'dd/MM/yyyy')}\n\n🔁 Deseja algo mais? (Sim/Não)`;
        } else {
          response = `❌ Protocolo não encontrado. Verifique o número e tente novamente.\n\n🔁 Deseja algo mais? (Sim/Não)`;
        }
        nextState = 'FINAL_CHECK';
        break;

      case 'BACK_TO_MENU':
      case 'FINAL_CHECK':
        if (message.toLowerCase().includes('sim')) {
          response = `Escolha uma opção abaixo:\n\n${menuOptions}`;
          nextState = 'MAIN_MENU';
        } else {
          response = `🙏 A SEURB agradece seu contato! Tenha um ótimo dia.`;
          nextState = 'START';
        }
        break;
    }

    await supabase.from("chat_sessions").update({ current_state: nextState }).eq("id", session.id);
    return response;
  }

  // Helper functions for handleBotLogic
  async function saveTemp(sessionId: number, data: any) {
    await supabase.from("chat_sessions").update({ temp_data: JSON.stringify(data) }).eq("id", sessionId);
  }

  async function updateTemp(sessionId: number, newData: any) {
    const { data: session } = await supabase.from("chat_sessions").select("temp_data").eq("id", sessionId).single();
    const currentData = session?.temp_data ? JSON.parse(session.temp_data) : {};
    await supabase.from("chat_sessions").update({ temp_data: JSON.stringify({ ...currentData, ...newData }) }).eq("id", sessionId);
  }

  async function getTemp(sessionId: number) {
    const { data: session } = await supabase.from("chat_sessions").select("temp_data").eq("id", sessionId).single();
    return session?.temp_data ? JSON.parse(session.temp_data) : {};
  }

  async function registerRequest(session: any, type: string, address: string, details: string) {
    const protocol = `ANA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const samplePhotos = [
      'https://picsum.photos/seed/trash1/800/600',
      'https://picsum.photos/seed/trash2/800/600',
      'https://picsum.photos/seed/trash3/800/600'
    ];
    const photoUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];

    await supabase.from("requests").insert([{
      protocol,
      type,
      citizen_name: session.citizen_name,
      citizen_phone: session.citizen_phone,
      address,
      details,
      photo_url: photoUrl,
      status: 'Pendente'
    }]);
    return protocol;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  io.on("connection", (socket) => {
    socket.on("join_session", (sessionId) => {
      socket.join(`session_${sessionId}`);
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
