// Store and API Services for Gabinete Parlamentar (e-Gabinete)
import { supabase } from '@/lib/supabase';

export type CategoriaPessoa = 'LIDERANCA' | 'ELEITOR' | 'AUTORIDADE' | 'SERVIDOR' | 'ASSESSOR' | 'IMPRENSA' | 'OUTRO';

export const initialTiposAtendimento: string[] = [
  'Saúde',
  'Ação de saúde',
  'Asfaltamento / Obras',
  'Educação',
  'Segurança',
  'Habitação',
  'Agricultura & Meio Ambiente',
  'Assistência Social',
  'Esporte & Cultura',
  'Emenda Parlamentar',
  'Outro'
];

export type Pessoa = {
  id: string;
  id_deputado: string;
  nome: string;
  apelido?: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
  profissao?: string;
  categoria: CategoriaPessoa;
  celular1?: string;
  celular2?: string;
  telefone_res?: string;
  telefone_com?: string;
  whatsapp?: boolean;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  votos_estimados?: number;
  instagram?: string;
  facebook?: string;
  observacoes?: string;
  cadastrado_por?: string;
  created_at?: string;
};

export type Entidade = {
  id: string;
  id_deputado: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  tipo: string;
  responsavel?: string;
  cargo_resp?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
};

export type AgendaCompromisso = {
  id: string;
  id_deputado: string;
  data_inicio: string;
  data_fim: string;
  compromisso: string;
  pauta_descritivo?: string;
  local?: string;
  link_maps?: string;
  visibilidade: 'PUBLICO' | 'RESERVADO' | 'PESSOAL';
  status: 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'REALIZADO';
  cor_destaque?: string;
  assessor_responsavel?: string;
  solicitado_por?: string;
  alerta_sms?: boolean;
  created_at?: string;
};

export type SolicitacaoAudiencia = {
  id: string;
  id_deputado: string;
  personalidade: string;
  pauta: string;
  data_solicitacao: string;
  assessor_responsavel?: string;
  status: string;
  cadastrado_por?: string;
};

export type AtendimentoDemanda = {
  id: string;
  id_deputado: string;
  processo: string;
  prioridade: string;
  id_pessoa?: string;
  id_entidade?: string;
  interessado_nome: string;
  assunto: string;
  tipo_atendimento: string;
  destinatario_orgao?: string;
  status: 'CADASTRADO' | 'EM_ANDAMENTO' | 'ENCAMINHADO' | 'ATENDIDO' | 'ATENDIDO_PARCIALMENTE' | 'CANCELADO' | 'NAO_ATENDIDO';
  valor_estimado?: number;
  assessor_responsavel?: string;
  data_abertura: string;
};

export type Oficio = {
  id: string;
  id_deputado: string;
  numero_oficio: string;
  data_emissao: string;
  interessado: string;
  destinatario: string;
  assunto: string;
  assessor_responsavel?: string;
  status: string;
  arquivo_url?: string;
};

export type LigacaoRecebida = {
  id: string;
  id_deputado: string;
  data_hora: string;
  ficha?: number;
  nome_solicitante: string;
  telefone: string;
  pessoa_procurada: string;
  assunto: string;
  atendido_por: string;
  retorno_necessario: boolean;
  status_retorno: string;
};

export type RegistroVisita = {
  id: string;
  id_deputado: string;
  ficha?: number;
  data_horario: string;
  tipo_visita: string;
  lugar: string;
  id_pessoa?: string;
  pessoa_entidade: string;
  atendido_por: string;
  assessor: string;
  motivo: string;
  resumo_visita: string;
  status: string;
};

export type Recado = {
  id: string;
  id_deputado: string;
  data_recado: string;
  de_quem: string;
  para_quem: string;
  mensagem: string;
  lido: boolean;
  prioridade: string;
};

export type TipoEventoComemorativo =
  | 'CIDADE'
  | 'EVENTO_ESTADUAL'
  | 'EVENTO_NACIONAL'
  | 'INTERNACIONAL'
  | 'PERSONALIDADE'
  | 'PESSOA';

export type EventoComemorativo = {
  id: string;
  id_deputado: string;
  tipo: TipoEventoComemorativo;
  titulo: string;
  data: string; // 'MM-DD' ou 'YYYY-MM-DD'
  descricao?: string;
  local_ou_estado?: string;
  celular?: string;
  nome_pessoa?: string;
  created_at?: string;
};

// Initial Eventos for Gabinete
export const initialEventos: EventoComemorativo[] = [
  // Cidades do Estado do Parlamentar (Paraná - PR)
  { id: 'ev-curitiba', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Curitiba', data: '03-29', descricao: 'Aniversário de Fundação da Capital do Estado do Paraná (1693)', local_ou_estado: 'Curitiba - PR' },
  { id: 'ev-londrina', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Londrina', data: '12-10', descricao: 'Emancipação Política do Município de Londrina', local_ou_estado: 'Londrina - PR' },
  { id: 'ev-maringa', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Maringá', data: '05-10', descricao: 'Aniversário da Cidade Canção', local_ou_estado: 'Maringá - PR' },
  { id: 'ev-cascavel', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Cascavel', data: '11-14', descricao: 'Fundação do Município de Cascavel', local_ou_estado: 'Cascavel - PR' },
  { id: 'ev-pontagrossa', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Ponta Grossa', data: '09-15', descricao: 'Aniversário dos Campos Gerais', local_ou_estado: 'Ponta Grossa - PR' },
  { id: 'ev-foz', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Foz do Iguaçu', data: '06-10', descricao: 'Emancipação de Foz do Iguaçu', local_ou_estado: 'Foz do Iguaçu - PR' },
  { id: 'ev-sjp', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de São José dos Pinhais', data: '01-08', descricao: 'Aniversário de Emancipação do Município', local_ou_estado: 'São José dos Pinhais - PR' },
  { id: 'ev-guarapuava', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Guarapuava', data: '12-09', descricao: 'Aniversário do Município de Guarapuava', local_ou_estado: 'Guarapuava - PR' },
  { id: 'ev-toledo', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Toledo', data: '12-14', descricao: 'Emancipação Política do Município de Toledo', local_ou_estado: 'Toledo - PR' },
  { id: 'ev-paranagua', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Paranaguá', data: '07-29', descricao: 'Aniversário da Cidade Mãe do Paraná (1648)', local_ou_estado: 'Paranaguá - PR' },
  { id: 'ev-patobranco', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Pato Branco', data: '12-14', descricao: 'Emancipação do Município de Pato Branco', local_ou_estado: 'Pato Branco - PR' },
  { id: 'ev-franciscobeltrao', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Francisco Beltrão', data: '11-25', descricao: 'Aniversário do Município de Francisco Beltrão', local_ou_estado: 'Francisco Beltrão - PR' },
  { id: 'ev-umuarama', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Umuarama', data: '06-26', descricao: 'Aniversário da Capital da Amizade', local_ou_estado: 'Umuarama - PR' },
  { id: 'ev-campomourao', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Campo Mourão', data: '10-10', descricao: 'Emancipação Política de Campo Mourão', local_ou_estado: 'Campo Mourão - PR' },

  // Capitais
  { id: 'ev-sp', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de São Paulo', data: '01-25', descricao: 'Fundação da Cidade de São Paulo (1554)', local_ou_estado: 'São Paulo - SP' },
  { id: 'ev-poa', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Porto Alegre', data: '03-26', descricao: 'Aniversário da Capital Gaúcha', local_ou_estado: 'Porto Alegre - RS' },
  { id: 'ev-florianopolis', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Florianópolis', data: '03-23', descricao: 'Aniversário da Capital Catarinense', local_ou_estado: 'Florianópolis - SC' },
  { id: 'ev-rj', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário do Rio de Janeiro', data: '03-01', descricao: 'Fundação da Cidade Maravilhosa (1565)', local_ou_estado: 'Rio de Janeiro - RJ' },
  { id: 'ev-brasilia', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Brasília', data: '04-21', descricao: 'Inauguração da Capital Federal do Brasil (1960)', local_ou_estado: 'Brasília - DF' },

  // Eventos Estaduais
  { id: 'ev-pr-emancipacao', id_deputado: 'default', tipo: 'EVENTO_ESTADUAL', titulo: 'Emancipação Política do Paraná', data: '12-19', descricao: 'Criação da Província do Paraná em 1853 (Desmembramento de SP)', local_ou_estado: 'Paraná' },
  { id: 'ev-showrural', id_deputado: 'default', tipo: 'EVENTO_ESTADUAL', titulo: 'Show Rural Coopavel', data: '02-05', descricao: 'Maior Feira Tecnológica Agropecuária da América Latina', local_ou_estado: 'Cascavel - PR' },
  { id: 'ev-expolondrina', id_deputado: 'default', tipo: 'EVENTO_ESTADUAL', titulo: 'ExpoLondrina', data: '04-05', descricao: 'Exposição Feira Agropecuária e Industrial de Londrina', local_ou_estado: 'Londrina - PR' },
  { id: 'ev-expoinga', id_deputado: 'default', tipo: 'EVENTO_ESTADUAL', titulo: 'Expoingá', data: '05-09', descricao: 'Grande Exposição Feira Agropecuária e Industrial de Maringá', local_ou_estado: 'Maringá - PR' },
  { id: 'ev-colonomotorista', id_deputado: 'default', tipo: 'EVENTO_ESTADUAL', titulo: 'Dia do Colono e do Motorista', data: '07-25', descricao: 'Homenagem aos Colonos e Motoristas do Estado', local_ou_estado: 'Paraná / Região Sul' },
  { id: 'ev-agricultor-pr', id_deputado: 'default', tipo: 'EVENTO_ESTADUAL', titulo: 'Dia do Agricultor Paranaense', data: '07-28', descricao: 'Valorização da Produção Agrícola no Estado do Paraná', local_ou_estado: 'Paraná' },

  // Eventos Nacionais
  { id: 'ev-tiradentes', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia de Tiradentes', data: '04-21', descricao: 'Homenagem ao Patrono da Nação e da Inconfidência Mineira', local_ou_estado: 'Nacional' },
  { id: 'ev-trabalhador', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia do Trabalhador', data: '05-01', descricao: 'Dia Internacional do Trabalho', local_ou_estado: 'Nacional' },
  { id: 'ev-independencia', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Independência do Brasil (Dia da Pátria)', data: '09-07', descricao: 'Proclamação da Independência em 1822', local_ou_estado: 'Nacional' },
  { id: 'ev-proclamacao', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Proclamação da República', data: '11-15', descricao: 'Proclamação da República Brasileira em 1889', local_ou_estado: 'Nacional' },
  { id: 'ev-consciencia', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia da Consciência Negra', data: '11-20', descricao: 'Homenagem a Zumbi dos Palmares e Igualdade Racial', local_ou_estado: 'Nacional' },
  { id: 'ev-bandeira', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia da Bandeira Nacional', data: '11-19', descricao: 'Comemoração da Bandeira do Brasil', local_ou_estado: 'Nacional' },
  { id: 'ev-professor', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia do Professor', data: '10-15', descricao: 'Valorização dos Educadores e do Magistério', local_ou_estado: 'Nacional' },
  { id: 'ev-democracia', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia da Democracia Brasileira', data: '10-25', descricao: 'Valorização do Estado Democrático de Direito', local_ou_estado: 'Nacional' },

  // Internacionais
  { id: 'ev-mulher', id_deputado: 'default', tipo: 'INTERNACIONAL', titulo: 'Dia Internacional da Mulher', data: '03-08', descricao: 'Celebração das Conquistas Sociais e Políticas das Mulheres', local_ou_estado: 'Global' },
  { id: 'ev-saude', id_deputado: 'default', tipo: 'INTERNACIONAL', titulo: 'Dia Mundial da Saúde', data: '04-07', descricao: 'Promovido pela Organização Mundial da Saúde (OMS)', local_ou_estado: 'Global' },
  { id: 'ev-meioambiente', id_deputado: 'default', tipo: 'INTERNACIONAL', titulo: 'Dia Mundial do Meio Ambiente', data: '06-05', descricao: 'Preservação Ambiental e Sustentabilidade Global', local_ou_estado: 'Global' },
  { id: 'ev-direitoshumanos', id_deputado: 'default', tipo: 'INTERNACIONAL', titulo: 'Dia Universal dos Direitos Humanos', data: '12-10', descricao: 'Declaração Universal dos Direitos Humanos', local_ou_estado: 'Global' },

  // Personalidades
  { id: 'ev-santosdumont', id_deputado: 'default', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Santos Dumont', data: '07-20', descricao: 'Pai da Aviação e Patrono da Aeronáutica Brasileira', local_ou_estado: 'Brasil' },
  { id: 'ev-senna', id_deputado: 'default', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Ayrton Senna', data: '03-21', descricao: 'Tricampeão Mundial de Fórmula 1 e Ídolo Nacional', local_ou_estado: 'Brasil' },
  { id: 'ev-machado', id_deputado: 'default', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Machado de Assis', data: '06-21', descricao: 'Maior Escritor da Literatura Brasileira', local_ou_estado: 'Brasil' },
  { id: 'ev-freire', id_deputado: 'default', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Paulo Freire', data: '09-19', descricao: 'Patrono da Educação Brasileira', local_ou_estado: 'Brasil' },
  { id: 'ev-pele', id_deputado: 'default', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Pelé', data: '10-23', descricao: 'Rei do Futebol e Atleta do Século XX', local_ou_estado: 'Brasil' },
  { id: 'ev-niemeyer', id_deputado: 'default', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Oscar Niemeyer', data: '12-15', descricao: 'Arquiteto de Renome Internacional e Criador de Brasília', local_ou_estado: 'Brasil' },
];

// Initial Sample Data for Gabinete
export const initialDemandas: AtendimentoDemanda[] = [
  {
    id: 'dem-01',
    id_deputado: 'default',
    processo: '28145/2023',
    prioridade: 'Alta',
    interessado_nome: 'Marcelo Lopes Guaraldo',
    assunto: 'Requer informação sobre tal projeto de infraestrutura de saúde',
    tipo_atendimento: 'Saúde',
    destinatario_orgao: 'Secretaria Estadual de Saúde - São Paulo',
    status: 'EM_ANDAMENTO',
    valor_estimado: 150000.00,
    assessor_responsavel: 'Marcelo Guaraldo',
    data_abertura: '2023-12-15T10:00:00Z',
  },
  {
    id: 'dem-02',
    id_deputado: 'default',
    processo: '28144/2023',
    prioridade: 'Urgente',
    interessado_nome: 'Eliscristiny De Lima e Silva',
    assunto: 'Pede exame de sangue e encaminhamento para alta complexidade',
    tipo_atendimento: 'Ação de saúde',
    destinatario_orgao: 'Hospital das Clínicas',
    status: 'EM_ANDAMENTO',
    valor_estimado: 0.00,
    assessor_responsavel: 'Saulo Vieira',
    data_abertura: '2023-12-14T14:30:00Z',
  },
  {
    id: 'dem-03',
    id_deputado: 'default',
    processo: '28142/2023',
    prioridade: 'Normal',
    interessado_nome: 'Ricardo Ribeiro',
    assunto: 'Exame de raio x e agendamento ortopédico no município',
    tipo_atendimento: 'Saúde',
    destinatario_orgao: 'UBS Central - Jardim Nayara',
    status: 'ENCAMINHADO',
    valor_estimado: 0.00,
    assessor_responsavel: 'Marcelo Guaraldo',
    data_abertura: '2023-12-10T11:15:00Z',
  },
  {
    id: 'dem-04',
    id_deputado: 'default',
    processo: '28141/2023',
    prioridade: 'Normal',
    interessado_nome: 'Saulo Vieira',
    assunto: 'Análise de segurança pública no bairro e ronda escolar',
    tipo_atendimento: 'Segurança',
    destinatario_orgao: 'Secretaria Estadual de Segurança Pública',
    status: 'ATENDIDO',
    valor_estimado: 0.00,
    assessor_responsavel: 'Marcelo Guaraldo',
    data_abertura: '2023-11-28T09:00:00Z',
  },
  {
    id: 'dem-05',
    id_deputado: 'default',
    processo: '28050/2016',
    prioridade: 'Normal',
    interessado_nome: 'Associação de Cuidados das Crianças',
    assunto: 'Apoio para reformas estruturais na creche comunitária',
    tipo_atendimento: 'Obras',
    destinatario_orgao: 'Secretaria de Obras & Habitação',
    status: 'ATENDIDO_PARCIALMENTE',
    valor_estimado: 50000.00,
    assessor_responsavel: 'Nathalia Carvalho',
    data_abertura: '2023-10-05T16:00:00Z',
  }
];

export const initialAudiencias: SolicitacaoAudiencia[] = [
  {
    id: 'aud-01',
    id_deputado: 'default',
    personalidade: 'Elifas Gurgel, Secretário de Radiodifusão',
    pauta: 'Tratar dos três processos de rádio comunitária que estão sob acompanhamento neste gabinete.',
    data_solicitacao: '2023-11-09T00:00:00Z',
    assessor_responsavel: 'Nathalia Carvalho',
    status: 'Solicitada',
    cadastrado_por: 'Nathalia Carvalho',
  },
  {
    id: 'aud-02',
    id_deputado: 'default',
    personalidade: 'Ministra da Agricultura',
    pauta: 'Deputado solicitou agenda para tratar sobre a crise no setor leiteiro no Rio Grande do Sul. Pediu que o MAPA confirme com antecedência mínima de uma semana.',
    data_solicitacao: '2023-09-11T00:00:00Z',
    assessor_responsavel: 'Nathalia Carvalho',
    status: 'Aguardando',
    cadastrado_por: 'Nathalia Carvalho',
  },
  {
    id: 'aud-03',
    id_deputado: 'default',
    personalidade: 'PRESIDENTE TRIBUNAL DE CONTAS',
    pauta: 'REUNIÃO GOVERNADOR e alinhamento de fiscalização de investimentos regionais.',
    data_solicitacao: '2023-06-06T00:00:00Z',
    assessor_responsavel: 'Junior Rocha',
    status: 'Agendada',
    cadastrado_por: 'Junior Rocha',
  }
];

export const initialAgendas: AgendaCompromisso[] = [
  {
    id: 'ag-01',
    id_deputado: 'default',
    data_inicio: '2023-12-15T09:00:00Z',
    data_fim: '2023-12-15T10:30:00Z',
    compromisso: 'Reunião com a assessoria parlamentar',
    pauta_descritivo: 'Pauta do recesso e plantão de janeiro no gabinete regional e na capital.',
    local: 'Av. Paulista, 1636, São Paulo - SP',
    link_maps: 'https://maps.google.com/?q=Av.+Paulista,+1636',
    visibilidade: 'PUBLICO',
    status: 'CONFIRMADO',
    cor_destaque: '#005baa',
    assessor_responsavel: 'Marcelo Guaraldo',
    solicitado_por: 'Marcelo Guaraldo',
    alerta_sms: true,
  },
  {
    id: 'ag-02',
    id_deputado: 'default',
    data_inicio: '2023-12-15T11:35:00Z',
    data_fim: '2023-12-15T12:30:00Z',
    compromisso: 'Reunião com a associação comercial',
    pauta_descritivo: 'Apresentação de pleito para incentivos fiscais do comércio local.',
    local: 'Av. Paulista, 1636, São Paulo - SP',
    link_maps: 'https://maps.google.com/?q=Av.+Paulista,+1636',
    visibilidade: 'PUBLICO',
    status: 'CONFIRMADO',
    cor_destaque: '#00a859',
    assessor_responsavel: 'Nathalia Carvalho',
    solicitado_por: 'Presidente da Associação',
    alerta_sms: false,
  },
  {
    id: 'ag-03',
    id_deputado: 'default',
    data_inicio: '2023-12-15T13:25:00Z',
    data_fim: '2023-12-15T14:30:00Z',
    compromisso: 'Almoço de trabalho com lideranças comunitárias',
    pauta_descritivo: 'Discussão das demandas prioritárias da zona sul.',
    local: 'Av. Paulista, 1636, São Paulo - SP',
    link_maps: 'https://maps.google.com/?q=Av.+Paulista,+1636',
    visibilidade: 'PUBLICO',
    status: 'PENDENTE',
    cor_destaque: '#f59e0b',
    assessor_responsavel: 'Marcelo Guaraldo',
    solicitado_por: 'Marcelo Guaraldo',
  },
  {
    id: 'ag-04',
    id_deputado: 'default',
    data_inicio: '2023-12-15T15:50:00Z',
    data_fim: '2023-12-15T17:00:00Z',
    compromisso: 'Votação do Orçamento na Assembleia',
    pauta_descritivo: 'Sessão extraordinária para votação final do orçamento anual.',
    local: 'Plenário João Deodato',
    link_maps: 'https://maps.google.com',
    visibilidade: 'PUBLICO',
    status: 'CONFIRMADO',
    cor_destaque: '#d97706',
    assessor_responsavel: 'Marcelo Guaraldo',
    solicitado_por: 'Liderança de Governo',
  }
];

export const initialVisitas: RegistroVisita[] = [
  {
    id: 'vis-72',
    id_deputado: 'default',
    ficha: 72,
    data_horario: '2023-08-23T14:18:00Z',
    tipo_visita: 'Recebida',
    lugar: 'Gabinete parlamentar',
    pessoa_entidade: 'Eliscristiny De Lima e Silva',
    atendido_por: 'Marcelo',
    assessor: 'Marcelo Guaraldo',
    motivo: 'Cortesia',
    resumo_visita: 'Veio fazer uma visita e apresentar demandas do bairro Santa Luzia.',
    status: 'Atendido',
  },
  {
    id: 'vis-71',
    id_deputado: 'default',
    ficha: 71,
    data_horario: '2023-05-29T11:02:00Z',
    tipo_visita: 'Recebida',
    lugar: 'Aracaju',
    pessoa_entidade: 'Saulo Vieira',
    atendido_por: 'Marcelo',
    assessor: 'Saulo Vieira',
    motivo: 'Treinamento',
    resumo_visita: 'Visita para treinamento e alinhamento de assessoria regional.',
    status: 'Atendido',
  },
  {
    id: 'vis-70',
    id_deputado: 'default',
    ficha: 70,
    data_horario: '2023-04-25T10:00:00Z',
    tipo_visita: 'Recebida',
    lugar: 'Rio Branco',
    pessoa_entidade: 'Jiza Lopes Cezar',
    atendido_por: 'Marcelo',
    assessor: 'Marcelo Guaraldo',
    motivo: 'Apresentação',
    resumo_visita: 'Apresentação de novos projetos culturais comunitários.',
    status: 'Atendido',
  },
  {
    id: 'vis-68',
    id_deputado: 'default',
    ficha: 68,
    data_horario: '2023-04-05T15:30:00Z',
    tipo_visita: 'Efetuada',
    lugar: 'São Paulo',
    pessoa_entidade: 'Associação de cuidados das crianças - (São Paulo)',
    atendido_por: 'pelo próprio',
    assessor: 'Marcelo Guaraldo',
    motivo: 'Cortesia',
    resumo_visita: 'Padre Júlio Lancellotti contestou a justificativa do prefeito para retirar barracas de pessoas que vivem nas calçadas do Centro da cidade.',
    status: 'Atendido',
  }
];

export const initialLigacoes: LigacaoRecebida[] = [
  {
    id: 'lig-01',
    id_deputado: 'default',
    data_hora: '2023-02-24T13:01:00Z',
    ficha: 82570,
    nome_solicitante: 'NICOLAS',
    telefone: '(15) 99800-9944',
    pessoa_procurada: 'Giovana',
    assunto: 'Solicita retorno urgente sobre o repasse da saúde.',
    atendido_por: 'Giovana',
    retorno_necessario: true,
    status_retorno: 'Sem retorno',
  },
  {
    id: 'lig-02',
    id_deputado: 'default',
    data_hora: '2022-03-21T12:30:00Z',
    ficha: 82569,
    nome_solicitante: 'Marcelo',
    telefone: '(11) 94755-3985',
    pessoa_procurada: 'Marcelo',
    assunto: 'Assunto particular de agenda.',
    atendido_por: 'Marcelo Guaraldo',
    retorno_necessario: false,
    status_retorno: 'Sem retorno',
  },
  {
    id: 'lig-03',
    id_deputado: 'default',
    data_hora: '2022-03-21T11:41:00Z',
    ficha: 82568,
    nome_solicitante: 'Thaynná Lopes Oliveira',
    telefone: '(11) 94847-5757',
    pessoa_procurada: 'manoel da silva',
    assunto: 'Dúvidas sobre emenda da área de educação.',
    atendido_por: 'Marcelo Guaraldo',
    retorno_necessario: true,
    status_retorno: 'Sem retorno',
  }
];

export const initialOficios: Oficio[] = [
  {
    id: 'ofi-01',
    id_deputado: 'default',
    numero_oficio: 'OF 001/2023',
    data_emissao: '2023-02-03',
    interessado: 'Driele Campos Seixas',
    destinatario: 'Secretaria Municipal de Saúde - São Paulo',
    assunto: 'Agendamento de consulta especializada e tomografia',
    assessor_responsavel: 'Marcelo Guaraldo',
    status: 'Enviado',
  },
  {
    id: 'ofi-02',
    id_deputado: 'default',
    numero_oficio: 'OF 221/2022',
    data_emissao: '2022-03-21',
    interessado: 'Fernanda Lopes Santos de Jesus',
    destinatario: 'Conselho Estadual de Educação - CEE - São Paulo',
    assunto: 'Matrícula no 1º grau de ensino fundamental',
    assessor_responsavel: 'Adriana',
    status: 'Atendido',
  },
  {
    id: 'ofi-03',
    id_deputado: 'default',
    numero_oficio: 'OF 220/2021',
    data_emissao: '2021-06-02',
    interessado: 'EURICLES DA SILVA MARIANO',
    destinatario: 'Defesa Civil - São Caetano do Sul',
    assunto: 'Apoio a equipamentos de combate e prevenção de enchente',
    assessor_responsavel: 'Marcelo Guaraldo',
    status: 'Em andamento',
  }
];

export const initialPessoas: Pessoa[] = [
  {
    id: 'pes-assessor-01',
    id_deputado: 'default',
    nome: 'Marcelo Guaraldo',
    apelido: 'Guaraldo',
    profissao: 'Chefe de Gabinete',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    celular1: '(11) 98765-4321',
    telefone_com: '(11) 3385-8000',
    categoria: 'ASSESSOR',
    votos_estimados: 0,
    email: 'marcelo.guaraldo@gabinete.leg.br',
    cadastrado_por: 'Administrador',
  },
  {
    id: 'pes-assessor-02',
    id_deputado: 'default',
    nome: 'Nathalia Carvalho',
    apelido: 'Nathalia',
    profissao: 'Assessora Parlamentar',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    uf: 'SP',
    celular1: '(11) 97654-3210',
    telefone_com: '(11) 3385-8001',
    categoria: 'ASSESSOR',
    votos_estimados: 0,
    email: 'nathalia.carvalho@gabinete.leg.br',
    cadastrado_por: 'Administrador',
  },
  {
    id: 'pes-assessor-03',
    id_deputado: 'default',
    nome: 'Saulo Vieira',
    apelido: 'Saulo',
    profissao: 'Assessor Político e Regional',
    bairro: 'Moema',
    cidade: 'São Paulo',
    uf: 'SP',
    celular1: '(11) 96543-2109',
    categoria: 'ASSESSOR',
    votos_estimados: 0,
    email: 'saulo.vieira@gabinete.leg.br',
    cadastrado_por: 'Administrador',
  },
  {
    id: 'pes-01',
    id_deputado: 'default',
    nome: 'Ada Maria Silva',
    apelido: 'Dona Ada',
    bairro: 'Jardim Santa Margarida',
    cidade: 'São Paulo',
    uf: 'SP',
    celular1: '(11) 99703-7674',
    telefone_res: '(11) 5555-1234',
    categoria: 'LIDERANCA',
    votos_estimados: 120,
    cpf: '123.456.789-00',
    email: 'ada.silva@email.com',
    cadastrado_por: 'Marcelo Guaraldo',
  },
  {
    id: 'pes-02',
    id_deputado: 'default',
    nome: 'Alfredo Borges Sampaio',
    apelido: 'Dr. Alfredo',
    bairro: 'Itaim Bibi',
    cidade: 'São Paulo',
    uf: 'SP',
    celular1: '(11) 99999-88888',
    categoria: 'AUTORIDADE',
    votos_estimados: 500,
    cadastrado_por: 'Marcelo Guaraldo',
  },
  {
    id: 'pes-03',
    id_deputado: 'default',
    nome: 'AMADEU MARÇO',
    bairro: 'CIDADE PATRIARCA',
    cidade: 'São Paulo',
    uf: 'SP',
    celular1: '(11) 7777-77777',
    categoria: 'ELEITOR',
    votos_estimados: 15,
    cadastrado_por: 'Saulo Vieira',
  }
];

export const initialEntidades: Entidade[] = [
  {
    id: 'ent-01',
    id_deputado: 'default',
    razao_social: 'ASSOCIAÇÃO DE CUIDADOS DAS CRIANÇAS',
    nome_fantasia: 'Creche Vila Gustavo',
    cnpj: '12.345.678/0001-90',
    tipo: 'Associação Comunitária',
    responsavel: 'Padre Júlio',
    cargo_resp: 'Coordenador',
    telefone: '(11) 2222-3333',
    email: 'contato@crechevilagustavo.org',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  {
    id: 'ent-02',
    id_deputado: 'default',
    razao_social: 'SANTA CASA DE MISERICORDIA DE ASSIS',
    nome_fantasia: 'Hospital Santa Casa',
    cnpj: '98.765.432/0001-10',
    tipo: 'Hospital / Entidade de Saúde',
    responsavel: 'Dr. Roberto',
    cargo_resp: 'Diretor Clínico',
    telefone: '(18) 3322-1100',
    email: 'diretoria@santacasaassis.org.br',
    cidade: 'Assis',
    uf: 'SP',
  }
];
