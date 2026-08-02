-- Migration: Criar Tabelas do Módulo e-Gabinete Parlamentar
-- Data: 2026-08-02

-- 1. Pessoas & Lideranças
CREATE TABLE IF NOT EXISTS gabinete_pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  nome VARCHAR(255) NOT NULL,
  apelido VARCHAR(100),
  cpf VARCHAR(20),
  rg VARCHAR(20),
  data_nascimento VARCHAR(20),
  profissao VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'ELEITOR',
  celular1 VARCHAR(30),
  celular2 VARCHAR(30),
  telefone_res VARCHAR(30),
  telefone_com VARCHAR(30),
  whatsapp BOOLEAN DEFAULT true,
  email VARCHAR(255),
  cep VARCHAR(20),
  logradouro VARCHAR(255),
  numero VARCHAR(30),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100) DEFAULT 'São Paulo',
  uf VARCHAR(2) DEFAULT 'SP',
  votos_estimados INTEGER DEFAULT 0,
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  observacoes TEXT,
  cadastrado_por VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Entidades Institucionais
CREATE TABLE IF NOT EXISTS gabinete_entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(30),
  tipo VARCHAR(100),
  responsavel VARCHAR(255),
  cargo_resp VARCHAR(100),
  telefone VARCHAR(30),
  email VARCHAR(255),
  cidade VARCHAR(100) DEFAULT 'São Paulo',
  uf VARCHAR(2) DEFAULT 'SP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Agenda de Compromissos Parlamentares
CREATE TABLE IF NOT EXISTS gabinete_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  compromisso TEXT NOT NULL,
  pauta_descritivo TEXT,
  local TEXT,
  link_maps TEXT,
  visibilidade VARCHAR(20) DEFAULT 'PUBLICO',
  status VARCHAR(20) DEFAULT 'CONFIRMADO',
  cor_destaque VARCHAR(20) DEFAULT '#005baa',
  assessor_responsavel VARCHAR(100),
  solicitado_por VARCHAR(100),
  alerta_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Solicitações de Audiência
CREATE TABLE IF NOT EXISTS gabinete_audiencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  personalidade VARCHAR(255) NOT NULL,
  pauta TEXT NOT NULL,
  data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
  assessor_responsavel VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Solicitada',
  cadastrado_por VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Atendimento de Demandas Eleitorais
CREATE TABLE IF NOT EXISTS gabinete_demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  processo VARCHAR(100) NOT NULL,
  prioridade VARCHAR(50) DEFAULT 'Normal',
  id_pessoa UUID REFERENCES gabinete_pessoas(id) ON DELETE SET NULL,
  id_entidade UUID REFERENCES gabinete_entidades(id) ON DELETE SET NULL,
  interessado_nome VARCHAR(255) NOT NULL,
  assunto TEXT NOT NULL,
  tipo_atendimento VARCHAR(100),
  destinatario_orgao VARCHAR(255),
  status VARCHAR(50) DEFAULT 'CADASTRADO',
  valor_estimado NUMERIC(15, 2) DEFAULT 0,
  assessor_responsavel VARCHAR(100),
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Emissão de Ofícios
CREATE TABLE IF NOT EXISTS gabinete_oficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  numero_oficio VARCHAR(100) NOT NULL,
  data_emissao DATE NOT NULL,
  interessado VARCHAR(255) NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  assunto TEXT NOT NULL,
  assessor_responsavel VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Enviado',
  arquivo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Registro de Ligações Recebidas
CREATE TABLE IF NOT EXISTS gabinete_ligacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  data_hora TIMESTAMPTZ DEFAULT NOW(),
  ficha INTEGER,
  nome_solicitante VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  pessoa_procurada VARCHAR(255),
  assunto TEXT NOT NULL,
  atendido_por VARCHAR(100),
  retorno_necessario BOOLEAN DEFAULT false,
  status_retorno VARCHAR(50) DEFAULT 'Sem retorno',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Registros de Visitas ao Gabinete
CREATE TABLE IF NOT EXISTS gabinete_visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  ficha INTEGER,
  data_horario TIMESTAMPTZ DEFAULT NOW(),
  tipo_visita VARCHAR(50) DEFAULT 'Recebida',
  lugar VARCHAR(255),
  id_pessoa UUID REFERENCES gabinete_pessoas(id) ON DELETE SET NULL,
  pessoa_entidade VARCHAR(255) NOT NULL,
  atendido_por VARCHAR(100),
  assessor VARCHAR(100),
  motivo VARCHAR(255),
  resumo_visita TEXT,
  status VARCHAR(50) DEFAULT 'Atendido',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Mural de Recados Internos
CREATE TABLE IF NOT EXISTS gabinete_recados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  data_recado TIMESTAMPTZ DEFAULT NOW(),
  de_quem VARCHAR(255) NOT NULL,
  para_quem VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  lido BOOLEAN DEFAULT false,
  prioridade VARCHAR(50) DEFAULT 'Normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance para e-Gabinete
CREATE INDEX IF NOT EXISTS idx_gabinete_pessoas_deputado ON gabinete_pessoas(id_deputado);
CREATE INDEX IF NOT EXISTS idx_gabinete_pessoas_categoria ON gabinete_pessoas(categoria);
CREATE INDEX IF NOT EXISTS idx_gabinete_agendas_data ON gabinete_agendas(data_inicio);
CREATE INDEX IF NOT EXISTS idx_gabinete_demandas_status ON gabinete_demandas(status);
CREATE INDEX IF NOT EXISTS idx_gabinete_oficios_numero ON gabinete_oficios(numero_oficio);
