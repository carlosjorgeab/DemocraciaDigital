-- Migration: Criar Tabela gabinete_eventos e Inserir Eventos, Aniversários e Efemérides Persistidos
-- Data: 2026-08-03

CREATE TABLE IF NOT EXISTS gabinete_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_deputado TEXT NOT NULL DEFAULT 'default',
  tipo VARCHAR(50) NOT NULL, -- 'CIDADE', 'EVENTO_ESTADUAL', 'EVENTO_NACIONAL', 'INTERNACIONAL', 'PERSONALIDADE', 'PESSOA'
  titulo VARCHAR(255) NOT NULL,
  data VARCHAR(20) NOT NULL, -- 'MM-DD' ou 'YYYY-MM-DD'
  descricao TEXT,
  local_ou_estado VARCHAR(100),
  celular VARCHAR(30),
  nome_pessoa VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gabinete_eventos_deputado ON gabinete_eventos(id_deputado);
CREATE INDEX IF NOT EXISTS idx_gabinete_eventos_tipo ON gabinete_eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_gabinete_eventos_data ON gabinete_eventos(data);

-- Popular Eventos Comemorativos, Aniversários Municipais, Estaduais, Nacionais e Personalidades
INSERT INTO gabinete_eventos (id_deputado, tipo, titulo, data, descricao, local_ou_estado) VALUES
-- Cidades do Estado do Parlamentar (Paraná - PR)
('default', 'CIDADE', 'Aniversário de Curitiba', '03-29', 'Aniversário de Fundação da Capital do Estado do Paraná (1693)', 'Curitiba - PR'),
('default', 'CIDADE', 'Aniversário de Londrina', '12-10', 'Emancipação Política do Município de Londrina', 'Londrina - PR'),
('default', 'CIDADE', 'Aniversário de Maringá', '05-10', 'Aniversário da Cidade Canção', 'Maringá - PR'),
('default', 'CIDADE', 'Aniversário de Cascavel', '11-14', 'Fundação do Município de Cascavel', 'Cascavel - PR'),
('default', 'CIDADE', 'Aniversário de Ponta Grossa', '09-15', 'Aniversário dos Campos Gerais', 'Ponta Grossa - PR'),
('default', 'CIDADE', 'Aniversário de Foz do Iguaçu', '06-10', 'Emancipação de Foz do Iguaçu', 'Foz do Iguaçu - PR'),
('default', 'CIDADE', 'Aniversário de São José dos Pinhais', '01-08', 'Aniversário de Emancipação do Município', 'São José dos Pinhais - PR'),
('default', 'CIDADE', 'Aniversário de Guarapuava', '12-09', 'Aniversário do Município de Guarapuava', 'Guarapuava - PR'),
('default', 'CIDADE', 'Aniversário de Toledo', '12-14', 'Emancipação Política do Município de Toledo', 'Toledo - PR'),
('default', 'CIDADE', 'Aniversário de Paranaguá', '07-29', 'Aniversário da Cidade Mãe do Paraná (1648)', 'Paranaguá - PR'),
('default', 'CIDADE', 'Aniversário de Pato Branco', '12-14', 'Emancipação do Município de Pato Branco', 'Pato Branco - PR'),
('default', 'CIDADE', 'Aniversário de Francisco Beltrão', '11-25', 'Aniversário do Município de Francisco Beltrão', 'Francisco Beltrão - PR'),
('default', 'CIDADE', 'Aniversário de Umuarama', '06-26', 'Aniversário da Capital da Amizade', 'Umuarama - PR'),
('default', 'CIDADE', 'Aniversário de Campo Mourão', '10-10', 'Emancipação Política de Campo Mourão', 'Campo Mourão - PR'),
('default', 'CIDADE', 'Aniversário de Apucarana', '01-28', 'Aniversário da Cidade do Boné', 'Apucarana - PR'),
('default', 'CIDADE', 'Aniversário de Paranavaí', '12-14', 'Emancipação do Município de Paranavaí', 'Paranavaí - PR'),
('default', 'CIDADE', 'Aniversário de Castro', '03-18', 'Aniversário do Município de Castro', 'Castro - PR'),
('default', 'CIDADE', 'Aniversário de Cianorte', '07-26', 'Aniversário da Capital do Vestuário', 'Cianorte - PR'),
('default', 'CIDADE', 'Aniversário de Telêmaco Borba', '03-21', 'Emancipação de Telêmaco Borba', 'Telêmaco Borba - PR'),
('default', 'CIDADE', 'Aniversário de Araucária', '02-11', 'Emancipação do Município de Araucária', 'Araucária - PR'),
('default', 'CIDADE', 'Aniversário de Campo Largo', '02-23', 'Aniversário da Capital da Louça', 'Campo Largo - PR'),
('default', 'CIDADE', 'Aniversário de Pinhais', '03-20', 'Emancipação do Município de Pinhais', 'Pinhais - PR'),
('default', 'CIDADE', 'Aniversário de Colombo', '02-05', 'Aniversário do Município de Colombo', 'Colombo - PR'),

-- Grandes Capitais e Cidades Brasileiras
('default', 'CIDADE', 'Aniversário de São Paulo', '01-25', 'Fundação da Cidade de São Paulo (1554)', 'São Paulo - SP'),
('default', 'CIDADE', 'Aniversário de Porto Alegre', '03-26', 'Aniversário da Capital Gaúcha', 'Porto Alegre - RS'),
('default', 'CIDADE', 'Aniversário de Florianópolis', '03-23', 'Aniversário da Capital Catarinense', 'Florianópolis - SC'),
('default', 'CIDADE', 'Aniversário do Rio de Janeiro', '03-01', 'Fundação da Cidade Maravilhosa (1565)', 'Rio de Janeiro - RJ'),
('default', 'CIDADE', 'Aniversário de Brasília', '04-21', 'Inauguração da Capital Federal do Brasil (1960)', 'Brasília - DF'),
('default', 'CIDADE', 'Aniversário de Belo Horizonte', '12-12', 'Aniversário da Capital Mineira', 'Belo Horizonte - MG'),
('default', 'CIDADE', 'Aniversário de Salvador', '03-29', 'Fundação da Primeira Capital do Brasil (1549)', 'Salvador - BA'),

-- Eventos Importantes no Estado do Deputado e Outros Estados
('default', 'EVENTO_ESTADUAL', 'Emancipação Política do Paraná', '12-19', 'Criação da Província do Paraná em 1853 (Desmembramento de SP)', 'Paraná'),
('default', 'EVENTO_ESTADUAL', 'Show Rural Coopavel', '02-05', 'Maior Feira Tecnológica Agropecuária da América Latina', 'Cascavel - PR'),
('default', 'EVENTO_ESTADUAL', 'ExpoLondrina', '04-05', 'Exposição Feira Agropecuária e Industrial de Londrina', 'Londrina - PR'),
('default', 'EVENTO_ESTADUAL', 'Expoingá', '05-09', 'Grande Exposição Feira Agropecuária e Industrial de Maringá', 'Maringá - PR'),
('default', 'EVENTO_ESTADUAL', 'Dia do Colono e do Motorista', '07-25', 'Homenagem aos Colonos e Motoristas do Estado', 'Paraná / Região Sul'),
('default', 'EVENTO_ESTADUAL', 'Dia do Agricultor Paranaense', '07-28', 'Valorização da Produção Agrícola no Estado do Paraná', 'Paraná'),
('default', 'EVENTO_ESTADUAL', 'Dia do Policial Militar e Civil do PR', '04-21', 'Homenagem aos Integrantes da Segurança Pública Estadual', 'Paraná'),
('default', 'EVENTO_ESTADUAL', 'Revolução Farroupilha (Data Magna do RS)', '09-20', 'Celebração da Cultura Gaúcha e História do Rio Grande do Sul', 'Rio Grande do Sul'),
('default', 'EVENTO_ESTADUAL', 'Revolução Constitucionalista de 1932', '07-09', 'Data Magna do Estado de São Paulo', 'São Paulo'),

-- Eventos e Efemérides a Nível Nacional
('default', 'EVENTO_NACIONAL', 'Confraternização Universal (Ano Novo)', '01-01', 'Início do Ano Civil e Dia Mundial da Paz', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia da Constituição Federal', '03-25', 'Promulgação da Primeira Constituição Brasileira (1824)', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia dos Povos Indígenas', '04-19', 'Homenagem às Culturas e Direitos Indígenas do Brasil', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia de Tiradentes', '04-21', 'Patrono da Nação e Herói da Inconfidência Mineira', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Trabalhador', '05-01', 'Dia Internacional das Lutas dos Trabalhadores', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia da Liberdade de Imprensa', '06-07', 'Valorização da Liberdade de Expressão e Jornalismo', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Advogado e dos Cursos Jurídicos', '08-11', 'Criação das Primeiras Faculdades de Direito no Brasil', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Soldado', '08-25', 'Homenagem ao Nascimento do Marechal Duque de Caxias', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Independência do Brasil (Dia da Pátria)', '09-07', 'Proclamação da Independência em 1822', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia da Árvore', '09-21', 'Preservação Ambiental e Conscientização Ecológica', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia das Crianças e N. Sra. Aparecida', '10-12', 'Padroeira do Brasil e Celebração da Infância', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Professor', '10-15', 'Valorização dos Educadores e do Magistério', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Médico', '10-18', 'Homenagem aos Profissionais de Saúde', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia da Democracia Brasileira', '10-25', 'Valorização do Estado Democrático de Direito', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Servidor Público', '10-28', 'Homenagem ao Funcionalismo Público Brasileiro', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia de Finados', '02-11', 'Dia de Homenagem aos Entes Queridos', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Proclamação da República', '11-15', 'Proclamação da República Brasileira em 1889', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia da Bandeira Nacional', '11-19', 'Celebração da Bandeira do Brasil', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia Nacional da Consciência Negra', '11-20', 'Homenagem a Zumbi dos Palmares e Igualdade Racial', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Dia do Marinheiro', '12-13', 'Homenagem ao Nascimento do Patrono da Marinha (Joaquim Marques Lisboa)', 'Nacional'),
('default', 'EVENTO_NACIONAL', 'Natal', '12-25', 'Celebração Natalina Global e Fraternidade', 'Nacional'),

-- Eventos Internacionais
('default', 'INTERNACIONAL', 'Dia Internacional da Mulher', '03-08', 'Celebração das Conquistas Sociais e Políticas das Mulheres', 'Global'),
('default', 'INTERNACIONAL', 'Dia Mundial da Saúde', '04-07', 'Promovido pela Organização Mundial da Saúde (OMS)', 'Global'),
('default', 'INTERNACIONAL', 'Dia Mundial do Meio Ambiente', '06-05', 'Preservação Ambiental e Sustentabilidade Global', 'Global'),
('default', 'INTERNACIONAL', 'Dia Internacional da Paz', '09-21', 'Promovido pelas Nações Unidas (ONU)', 'Global'),
('default', 'INTERNACIONAL', 'Dia Universal dos Direitos Humanos', '12-10', 'Declaração Universal dos Direitos Humanos (ONU)', 'Global'),

-- Personalidades Históricas e Culturais
('default', 'PERSONALIDADE', 'Nascimento de Ayrton Senna', '03-21', 'Tricampeão Mundial de Fórmula 1 e Ídolo Nacional', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Getúlio Vargas', '04-19', 'Ex-Presidente do Brasil e Criador da CLT', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Machado de Assis', '06-21', 'Maior Escritor da Literatura Brasileira', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Santos Dumont', '07-20', 'Pai da Aviação e Patrono da Aeronáutica Brasileira', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Princesa Isabel', '07-29', 'Signatária da Lei Áurea que Aboliu a Escravidão no Brasil', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Tarsila do Amaral', '09-01', 'Uma das Maiores Artistas do Modernismo Brasileiro', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Juscelino Kubitschek', '09-12', 'Ex-Presidente do Brasil e Construtor de Brasília', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Paulo Freire', '09-19', 'Patrono da Educação Brasileira e Educador Mundial', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Pelé', '10-23', 'Rei do Futebol e Atleta do Século XX', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Carlos Drummond de Andrade', '10-31', 'Um dos Maiores Poetas da Língua Portuguesa', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Rui Barbosa', '11-05', 'Jurista, Político e Águia de Haia', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Cecília Meireles', '11-07', 'Grande Poetisa e Escritora Brasileira', 'Brasil'),
('default', 'PERSONALIDADE', 'Nascimento de Oscar Niemeyer', '12-15', 'Arquiteto de Renome Internacional e Criador de Brasília', 'Brasil')
ON CONFLICT DO NOTHING;
