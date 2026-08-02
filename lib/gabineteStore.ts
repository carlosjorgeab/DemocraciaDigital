// Store and API Services for Gabinete Parlamentar (e-Gabinete)
import { supabase } from '@/lib/supabase';

export type CategoriaPessoa = 'LIDERANCA' | 'ELEITOR' | 'AUTORIDADE' | 'SERVIDOR' | 'IMPRENSA' | 'OUTRO';

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
