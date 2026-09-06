// Store and Type Definitions for Gabinete Parlamentar (e-Gabinete)

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
