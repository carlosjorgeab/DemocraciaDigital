-- Migration: e-Gabinete Module Initialization
-- Create Enums
CREATE TYPE "CategoriaPessoa" AS ENUM ('LIDERANCA', 'ELEITOR', 'AUTORIDADE', 'SERVIDOR', 'IMPRENSA', 'OUTRO');
CREATE TYPE "TipoVisibilidadeAgenda" AS ENUM ('PUBLICO', 'RESERVADO', 'PESSOAL');
CREATE TYPE "StatusAgenda" AS ENUM ('CONFIRMADO', 'PENDENTE', 'CANCELADO', 'REALIZADO');
CREATE TYPE "StatusDemanda" AS ENUM ('CADASTRADO', 'EM_ANDAMENTO', 'ENCAMINHADO', 'ATENDIDO', 'ATENDIDO_PARCIALMENTE', 'CANCELADO', 'NAO_ATENDIDO');

-- 1. Gabinete Pessoas (Contatos & Lideranças)
CREATE TABLE IF NOT EXISTS gabinete_pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    apelido VARCHAR(100),
    cpf VARCHAR(14),
    rg VARCHAR(20),
    data_nascimento DATE,
    profissao VARCHAR(100),
    categoria "CategoriaPessoa" DEFAULT 'ELEITOR',
    celular1 VARCHAR(20),
    celular2 VARCHAR(20),
    telefone_res VARCHAR(20),
    telefone_com VARCHAR(20),
    whatsapp BOOLEAN DEFAULT true,
    email VARCHAR(255),
    cep VARCHAR(10),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    votos_estimados INT DEFAULT 0,
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    observacoes TEXT,
    cadastrado_por VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gabinete Entidades (ONGs, Prefeituras, Associações)
CREATE TABLE IF NOT EXISTS gabinete_entidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18),
    tipo VARCHAR(100) DEFAULT 'Associação',
    responsavel VARCHAR(255),
    cargo_resp VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    cidade VARCHAR(100),
    uf VARCHAR(2)
);

-- 3. Gabinete Agenda de Compromissos
CREATE TABLE IF NOT EXISTS gabinete_agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    compromisso VARCHAR(255) NOT NULL,
    pauta_descritivo TEXT,
    local VARCHAR(255),
    link_maps TEXT,
    visibilidade "TipoVisibilidadeAgenda" DEFAULT 'PUBLICO',
    status "StatusAgenda" DEFAULT 'PENDENTE',
    cor_destaque VARCHAR(20) DEFAULT '#005baa',
    assessor_responsavel VARCHAR(100),
    solicitado_por VARCHAR(100),
    alerta_sms BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Gabinete Solicitação de Audiências
CREATE TABLE IF NOT EXISTS gabinete_audiencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    personalidade VARCHAR(255) NOT NULL,
    pauta TEXT NOT NULL,
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assessor_responsavel VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Solicitada',
    cadastrado_por VARCHAR(100)
);

-- 5. Gabinete Atendimento / Demandas
CREATE TABLE IF NOT EXISTS gabinete_demandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    processo VARCHAR(50) NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'Normal',
    id_pessoa UUID REFERENCES gabinete_pessoas(id) ON DELETE SET NULL,
    id_entidade UUID REFERENCES gabinete_entidades(id) ON DELETE SET NULL,
    interessado_nome VARCHAR(255) NOT NULL,
    assunto TEXT NOT NULL,
    tipo_atendimento VARCHAR(100) NOT NULL,
    destinatario_orgao VARCHAR(255),
    status "StatusDemanda" DEFAULT 'CADASTRADO',
    valor_estimado NUMERIC(15,2) DEFAULT 0.00,
    assessor_responsavel VARCHAR(100),
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Gabinete Ofícios
CREATE TABLE IF NOT EXISTS gabinete_oficios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    numero_oficio VARCHAR(50) NOT NULL,
    data_emissao DATE NOT NULL,
    interessado VARCHAR(255) NOT NULL,
    destinatario VARCHAR(255) NOT NULL,
    assunto TEXT NOT NULL,
    assessor_responsavel VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Enviado',
    arquivo_url TEXT
);

-- 7. Gabinete Ligações Recebidas
CREATE TABLE IF NOT EXISTS gabinete_ligacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ficha SERIAL,
    nome_solicitante VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    pessoa_procurada VARCHAR(100) NOT NULL,
    assunto TEXT NOT NULL,
    atendido_por VARCHAR(100) NOT NULL,
    retorno_necessario BOOLEAN DEFAULT true,
    status_retorno VARCHAR(50) DEFAULT 'Sem retorno'
);

-- 8. Gabinete Registro de Visitas
CREATE TABLE IF NOT EXISTS gabinete_visitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    ficha SERIAL,
    data_horario TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tipo_visita VARCHAR(50) DEFAULT 'Recebida',
    lugar VARCHAR(100) DEFAULT 'Gabinete parlamentar',
    id_pessoa UUID REFERENCES gabinete_pessoas(id) ON DELETE SET NULL,
    pessoa_entidade VARCHAR(255) NOT NULL,
    atendido_por VARCHAR(100) NOT NULL,
    assessor VARCHAR(100) NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    resumo_visita TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Atendido'
);

-- 9. Gabinete Recados
CREATE TABLE IF NOT EXISTS gabinete_recados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_deputado UUID NOT NULL REFERENCES deputado(id) ON DELETE CASCADE,
    data_recado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    de_quem VARCHAR(100) NOT NULL,
    para_quem VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    lido BOOLEAN DEFAULT false,
    prioridade VARCHAR(20) DEFAULT 'Normal'
);
