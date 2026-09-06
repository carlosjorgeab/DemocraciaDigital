import {
  Pessoa,
  Entidade,
  AgendaCompromisso,
  SolicitacaoAudiencia,
  AtendimentoDemanda,
  Oficio,
  LigacaoRecebida,
  RegistroVisita,
  EventoComemorativo,
} from '@/lib/gabineteStore';
import { LogAuditoria } from '@/lib/auditLogStore';

export const initialEventos: EventoComemorativo[] = [
  { id: 'ev-curitiba', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Curitiba', data: '03-29', descricao: 'Aniversário de Fundação da Capital do Estado do Paraná (1693)', local_ou_estado: 'Curitiba - PR' },
  { id: 'ev-londrina', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Londrina', data: '12-10', descricao: 'Emancipação Política do Município de Londrina', local_ou_estado: 'Londrina - PR' },
  { id: 'ev-maringa', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Maringá', data: '05-10', descricao: 'Aniversário da Cidade Canção', local_ou_estado: 'Maringá - PR' },
  { id: 'ev-cascavel', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Cascavel', data: '11-14', descricao: 'Fundação do Município de Cascavel', local_ou_estado: 'Cascavel - PR' },
  { id: 'ev-pontagrossa', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Ponta Grossa', data: '09-15', descricao: 'Aniversário dos Campos Gerais', local_ou_estado: 'Ponta Grossa - PR' },
  { id: 'ev-sp', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de São Paulo', data: '01-25', descricao: 'Fundação da Cidade de São Paulo (1554)', local_ou_estado: 'São Paulo - SP' },
  { id: 'ev-poa', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Porto Alegre', data: '03-26', descricao: 'Aniversário da Capital Gaúcha', local_ou_estado: 'Porto Alegre - RS' },
  { id: 'ev-brasilia', id_deputado: 'default', tipo: 'CIDADE', titulo: 'Aniversário de Brasília', data: '04-21', descricao: 'Inauguração da Capital Federal do Brasil (1960)', local_ou_estado: 'Brasília - DF' },
  { id: 'ev-tiradentes', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia de Tiradentes', data: '04-21', descricao: 'Homenagem ao Patrono da Nação e da Inconfidência Mineira', local_ou_estado: 'Nacional' },
  { id: 'ev-trabalhador', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Dia do Trabalhador', data: '05-01', descricao: 'Dia Internacional do Trabalho', local_ou_estado: 'Nacional' },
  { id: 'ev-independencia', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Independência do Brasil (Dia da Pátria)', data: '09-07', descricao: 'Proclamação da Independência em 1822', local_ou_estado: 'Nacional' },
  { id: 'ev-proclamacao', id_deputado: 'default', tipo: 'EVENTO_NACIONAL', titulo: 'Proclamação da República', data: '11-15', descricao: 'Proclamação da República Brasileira em 1889', local_ou_estado: 'Nacional' },
];

export const initialDemandas: AtendimentoDemanda[] = [];
export const initialAudiencias: SolicitacaoAudiencia[] = [];
export const initialAgendas: AgendaCompromisso[] = [];
export const initialVisitas: RegistroVisita[] = [];
export const initialLigacoes: LigacaoRecebida[] = [];
export const initialOficios: Oficio[] = [];
export const initialPessoas: Pessoa[] = [];
export const initialEntidades: Entidade[] = [];
export const initialLogs: LogAuditoria[] = [];
