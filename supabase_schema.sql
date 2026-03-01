-- Supabase Schema Migration

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('manager', 'attendant')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  neighborhoods TEXT NOT NULL,
  days TEXT NOT NULL,
  hours TEXT NOT NULL,
  observations TEXT
);

-- Ecopoints Table
CREATE TABLE IF NOT EXISTS ecopoints (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  hours TEXT NOT NULL,
  materials TEXT NOT NULL
);

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  protocol TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  details TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  citizen_phone TEXT UNIQUE NOT NULL,
  citizen_name TEXT,
  status TEXT DEFAULT 'bot',
  current_state TEXT DEFAULT 'START',
  temp_data TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id BIGINT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT CHECK(sender IN ('citizen', 'bot', 'user')) NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Initial Data Seeding (Optional - can be run in SQL Editor)
-- INSERT INTO users (name, email, role) VALUES ('Tiago', 'tiago.angelica@gmail.com', 'manager');
-- INSERT INTO users (name, email, role) VALUES ('Ana Paula Gomes Mendonça', 'anpgmendonca@gmail.com', 'manager');

-- INSERT INTO settings (key, value) VALUES ('bot_name', 'SEURB Atendimento');
-- INSERT INTO settings (key, value) VALUES ('welcome_message', '👋 Bem-vindo ao atendimento virtual da Secretaria Municipal de Serviços Urbanos (SEURB) – Prefeitura de Ananindeua!');
-- INSERT INTO settings (key, value) VALUES ('bot_instructions', 'Você é o assistente virtual da SEURB Ananindeua. Siga rigorosamente o fluxo de atendimento definido. Seja educado e eficiente.');
-- INSERT INTO settings (key, value) VALUES ('menu_message', '✅ Legal, {name}!\n\nEscolha uma opção abaixo:\n\n1️⃣ Coleta de lixo domiciliar\n2️⃣ Coleta de entulho\n3️⃣ Limpeza de bueiros\n4️⃣ Ecopontos e reciclagem\n5️⃣ Denúncia de descarte irregular\n6️⃣ Acompanhar protocolo\n7️⃣ Comunicação de sinistro\n8️⃣ Conduta de servidor');
-- INSERT INTO settings (key, value) VALUES ('off_hours_message', '👋 Bem-vindo ao atendimento virtual da Secretaria Municipal de Serviços Urbanos (SEURB) – Prefeitura de Ananindeua!\n\n⏰ Nosso atendimento é de segunda a sexta-feira (exceto feriados), de 8h às 15h.\n\n🙏 A SEURB agradece seu contato!');
-- INSERT INTO settings (key, value) VALUES ('whatsapp_api_key', '');
-- INSERT INTO settings (key, value) VALUES ('whatsapp_webhook_url', '');
-- INSERT INTO settings (key, value) VALUES ('msg_coleta_lixo', '⚠️ Devido à alta demanda, o tempo de resposta pode variar. Agradecemos sua compreensão.\n\n📅 Confira os dias e horários da coleta em seu bairro: [link]\n\n📍 Por gentileza, informe o endereço completo:\n(Ex: Rua das Flores, 123 – Bairro Centro)');
-- INSERT INTO settings (key, value) VALUES ('msg_coleta_entulho', '⚠️ Devido à alta demanda, o tempo de resposta pode variar. Agradecemos sua compreensão.\n\n📍 Informe o endereço completo para coleta:\n(Ex: Av. Brasil, 456 – Bairro Jardim)');
-- INSERT INTO settings (key, value) VALUES ('msg_limpeza_bueiro', '⚠️ Devido à alta demanda, o tempo de resposta pode variar. Agradecemos sua compreensão.\n\n📌 Atendemos apenas bueiros entupidos na via pública que causem alagamento ou impeçam o escoamento da água.\n\n📍 Informe o endereço completo do bueiro:');
-- INSERT INTO settings (key, value) VALUES ('msg_denuncia', '🚨 Denúncia de descarte irregular de lixo/entulho\n\n📍 Informe o endereço exato onde ocorreu o descarte:');
-- INSERT INTO settings (key, value) VALUES ('msg_sinistro', 'Comunicação de Sinistro\n\nLocal da ocorrência:');
-- INSERT INTO settings (key, value) VALUES ('msg_protocolo', '🔍 Acompanhar Protocolo\n\nInforme o número do seu protocolo:');
-- INSERT INTO settings (key, value) VALUES ('msg_success', '✅ Solicitação registrada com sucesso!\n\nProtocolo: {protocol}\n\n🔁 Deseja algo mais? (Sim/Não)');
-- INSERT INTO settings (key, value) VALUES ('msg_conduta', 'Registro sobre Conduta de Servidor\n\nLocal da ocorrência:');
