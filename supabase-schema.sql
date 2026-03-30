-- Schema para o app Democracia Digital

-- 1. Tabela de Partidos
CREATE TABLE partidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sigla VARCHAR(10) NOT NULL,
  nome VARCHAR(100) NOT NULL
);

-- 2. Tabela de Deputados
CREATE TABLE deputado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  id_partido UUID REFERENCES partidos(id),
  estado VARCHAR(2) NOT NULL,
  foto_url TEXT
);

-- 3. Tabela de Áreas Temáticas
CREATE TABLE areas_tematicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  cor VARCHAR(20)
);

-- 4. Tabela de Projetos
CREATE TABLE projetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao TEXT NOT NULL,
  municipio VARCHAR(100),
  valor_projeto NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_empenhado NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_executado NUMERIC(15, 2) NOT NULL DEFAULT 0,
  id_area_tematica UUID REFERENCES areas_tematicas(id),
  status VARCHAR(50) DEFAULT 'Em Execução'
);

-- 5. Tabela de Orçamentos
CREATE TABLE orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_deputado UUID REFERENCES deputado(id),
  data DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- DESPESA, RECEITA, EMPENHO, PAGAMENTO, ETC
  descricao TEXT,
  valor NUMERIC(15, 2) NOT NULL,
  id_projeto UUID REFERENCES projetos(id)
);

-- Inserir dados de exemplo (opcional)
INSERT INTO partidos (sigla, nome) VALUES ('PT', 'Partido dos Trabalhadores');

-- Pegue o ID do partido inserido e substitua abaixo (ou use uma subquery)
INSERT INTO deputado (nome, id_partido, estado, foto_url) 
VALUES ('Carlos Silva', (SELECT id FROM partidos WHERE sigla = 'PT' LIMIT 1), 'SP', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDItoFVfGoACbJdm4Wi0cfBgir3kPMKpi_-Xd5dYrlEDHoUEkV0516q-xhwhO4CNXWak9bkrhI4WKOSGSanivISliO-DLf79qEtbopRryvM32I1w0S_TWHzXDRBGBh28awAqQYax5hHZsD9OsXFPbZSBIn41-wfzZ-GyIw1sviuqhHpBJmy74hVhpfgYyLLTIEMXyZlcSd2ZubedVQG76oGcTMohkgkKlIUv2aa0c3bKptcwfVR-KA6p8toS7_Ttro9Fa4_sfmlM1Ul');

INSERT INTO areas_tematicas (nome, cor) VALUES ('Saúde & Bem-estar', '#d80000'), ('Educação', '#ffcc00'), ('Infraestrutura', '#e2e2e2');

INSERT INTO projetos (descricao, municipio, valor_projeto, total_empenhado, total_executado, id_area_tematica, status)
VALUES 
('Complexo Hospitalar Sul', 'São Paulo - SP', 1250000, 1250000, 937500, (SELECT id FROM areas_tematicas WHERE nome = 'Saúde & Bem-estar' LIMIT 1), 'Em Execução'),
('Reforma de Escola Estadual Central', 'Campinas - SP', 890000, 890000, 400500, (SELECT id FROM areas_tematicas WHERE nome = 'Educação' LIMIT 1), 'Em Execução'),
('Saneamento Básico Rural - Lote 04', 'Ribeirão Preto - SP', 2100000, 2100000, 315000, (SELECT id FROM areas_tematicas WHERE nome = 'Infraestrutura' LIMIT 1), 'Em Licitação');
