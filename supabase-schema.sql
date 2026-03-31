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
  id_deputado UUID REFERENCES deputado(id),
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
  id_projeto UUID REFERENCES projetos(id),
  municipio VARCHAR(100)
);

-- Inserir dados de exemplo (opcional)
INSERT INTO partidos (sigla, nome) VALUES ('PT', 'Partido dos Trabalhadores');

-- Pegue o ID do partido inserido e substitua abaixo (ou use uma subquery)
INSERT INTO deputado (nome, id_partido, estado, foto_url) 
VALUES ('Carlos Silva', (SELECT id FROM partidos WHERE sigla = 'PT' LIMIT 1), 'SP', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDItoFVfGoACbJdm4Wi0cfBgir3kPMKpi_-Xd5dYrlEDHoUEkV0516q-xhwhO4CNXWak9bkrhI4WKOSGSanivISliO-DLf79qEtbopRryvM32I1w0S_TWHzXDRBGBh28awAqQYax5hHZsD9OsXFPbZSBIn41-wfzZ-GyIw1sviuqhHpBJmy74hVhpfgYyLLTIEMXyZlcSd2ZubedVQG76oGcTMohkgkKlIUv2aa0c3bKptcwfVR-KA6p8toS7_Ttro9Fa4_sfmlM1Ul');

INSERT INTO areas_tematicas (nome, cor) VALUES ('Saúde & Bem-estar', '#d80000'), ('Educação', '#ffcc00'), ('Infraestrutura', '#e2e2e2');

INSERT INTO projetos (descricao, municipio, id_deputado, valor_projeto, total_empenhado, total_executado, id_area_tematica, status)
VALUES 
('Complexo Hospitalar Sul', 'São Paulo - SP', (SELECT id FROM deputado WHERE nome = 'Carlos Silva' LIMIT 1), 1250000, 1250000, 937500, (SELECT id FROM areas_tematicas WHERE nome = 'Saúde & Bem-estar' LIMIT 1), 'Em Execução'),
('Reforma de Escola Estadual Central', 'Campinas - SP', (SELECT id FROM deputado WHERE nome = 'Carlos Silva' LIMIT 1), 890000, 890000, 400500, (SELECT id FROM areas_tematicas WHERE nome = 'Educação' LIMIT 1), 'Em Execução');
-- 6. Tabela de Unidade de Federação
CREATE TABLE unidade_federacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sigla VARCHAR(2) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL
);

-- 7. Tabela de Município
CREATE TABLE municipio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  id_uf UUID REFERENCES unidade_federacao(id),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  populacao INTEGER
);

-- Inserir UFs
INSERT INTO unidade_federacao (sigla, nome) VALUES
('AC', 'Acre'), ('AL', 'Alagoas'), ('AP', 'Amapá'), ('AM', 'Amazonas'),
('BA', 'Bahia'), ('CE', 'Ceará'), ('DF', 'Distrito Federal'), ('ES', 'Espírito Santo'),
('GO', 'Goiás'), ('MA', 'Maranhão'), ('MT', 'Mato Grosso'), ('MS', 'Mato Grosso do Sul'),
('MG', 'Minas Gerais'), ('PA', 'Pará'), ('PB', 'Paraíba'), ('PR', 'Paraná'),
('PE', 'Pernambuco'), ('PI', 'Piauí'), ('RJ', 'Rio de Janeiro'), ('RN', 'Rio Grande do Norte'),
('RS', 'Rio Grande do Sul'), ('RO', 'Rondônia'), ('RR', 'Roraima'), ('SC', 'Santa Catarina'),
('SP', 'São Paulo'), ('SE', 'Sergipe'), ('TO', 'Tocantins');

-- Inserir alguns municípios de exemplo
INSERT INTO municipio (nome, id_uf, latitude, longitude, populacao) VALUES
('São Paulo', (SELECT id FROM unidade_federacao WHERE sigla = 'SP'), -23.5505, -46.6333, 12325232),
('Rio de Janeiro', (SELECT id FROM unidade_federacao WHERE sigla = 'RJ'), -22.9068, -43.1729, 6747815),
('Brasília', (SELECT id FROM unidade_federacao WHERE sigla = 'DF'), -15.7942, -47.8822, 3055149),
('Salvador', (SELECT id FROM unidade_federacao WHERE sigla = 'BA'), -12.9714, -38.5014, 2886698),
('Fortaleza', (SELECT id FROM unidade_federacao WHERE sigla = 'CE'), -3.7172, -38.5433, 2686612),
('Belo Horizonte', (SELECT id FROM unidade_federacao WHERE sigla = 'MG'), -19.9167, -43.9345, 2521564),
('Manaus', (SELECT id FROM unidade_federacao WHERE sigla = 'AM'), -3.1190, -60.0217, 2219580),
('Curitiba', (SELECT id FROM unidade_federacao WHERE sigla = 'PR'), -25.4284, -49.2733, 1948626),
('Recife', (SELECT id FROM unidade_federacao WHERE sigla = 'PE'), -8.0476, -34.8770, 1653461),
('Goiânia', (SELECT id FROM unidade_federacao WHERE sigla = 'GO'), -16.6869, -49.2648, 1536097);
