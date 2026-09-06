import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/lib/utils';

export type TipoAcaoLog = 
  | 'CRIACAO' 
  | 'EDICAO' 
  | 'EXCLUSAO' 
  | 'STATUS' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'EXPORTACAO' 
  | 'ACESSO';

export type EntidadeLog = 
  | 'DEMANDA' 
  | 'AUDIENCIA' 
  | 'AGENDA' 
  | 'EMENDA' 
  | 'PROJETO' 
  | 'EDITAL' 
  | 'USUARIO' 
  | 'PERFIL' 
  | 'PESSOA' 
  | 'OFICIO' 
  | 'CONFIGURACAO';

export type LogAuditoria = {
  id: string;
  id_deputado?: string | null;
  usuario_id?: string | null;
  usuario_nome: string;
  usuario_email: string;
  usuario_cargo?: string | null;
  acao: TipoAcaoLog;
  entidade: EntidadeLog;
  entidade_id?: string | null;
  descricao: string;
  detalhes?: {
    campo_alterado?: string;
    valor_anterior?: any;
    valor_novo?: any;
    dados_completos?: any;
    ip?: string;
    navegador?: string;
    [key: string]: any;
  };
  severidade?: 'NORMAL' | 'IMPORTANTE' | 'CRITICA';
  created_at: string;
};

const STORAGE_KEY = 'democracia_audit_logs_v1';

/**
 * Recupera logs armazenados localmente e sincronizados
 */
export function getStoredLogs(): LogAuditoria[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler logs de auditoria:', e);
    return [];
  }
}

/**
 * Registra uma ação de auditoria crítica no sistema (quem alterou, o que e quando)
 */
export async function logActivity(params: {
  id_deputado?: string | null;
  usuario_nome?: string;
  usuario_email?: string;
  usuario_cargo?: string;
  acao: TipoAcaoLog;
  entidade: EntidadeLog;
  entidade_id?: string;
  descricao: string;
  detalhes?: Record<string, any>;
  severidade?: 'NORMAL' | 'IMPORTANTE' | 'CRITICA';
}): Promise<LogAuditoria> {
  let userEmail = params.usuario_email;
  let userName = params.usuario_nome;

  // Auto-fill current user from local storage if omitted
  if (typeof window !== 'undefined' && (!userEmail || !userName)) {
    try {
      const stored = localStorage.getItem('democracia_user');
      if (stored) {
        const u = JSON.parse(stored);
        userEmail = userEmail || u.email || 'usuario@democracia.leg.br';
        userName = userName || u.perfil?.nome || u.email?.split('@')[0] || 'Usuário Gabinete';
      }
    } catch (_) {}
  }

  const logEntry: LogAuditoria = {
    id: generateUUID(),
    id_deputado: params.id_deputado || null,
    usuario_email: userEmail || 'sistema@democraciadigital.leg.br',
    usuario_nome: userName || 'Sistema',
    usuario_cargo: params.usuario_cargo || 'Usuário',
    acao: params.acao,
    entidade: params.entidade,
    entidade_id: params.entidade_id || null,
    descricao: params.descricao,
    detalhes: params.detalhes,
    severidade: params.severidade || (params.acao === 'EXCLUSAO' || params.acao === 'EDICAO' ? 'IMPORTANTE' : 'NORMAL'),
    created_at: new Date().toISOString(),
  };

  // 1. Store in Local Storage for fast instant UI response
  if (typeof window !== 'undefined') {
    try {
      const existing = getStoredLogs();
      const updated = [logEntry, ...existing].slice(0, 500); // keep last 500 logs
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Dispatch custom event for real-time reactivity in UI components
      window.dispatchEvent(new CustomEvent('dd-new-audit-log', { detail: logEntry }));
    } catch (e) {
      console.error('Falha ao salvar log localmente:', e);
    }
  }

  // 2. Persist to Supabase logs_auditoria table if available
  try {
    supabase
      .from('logs_auditoria')
      .insert({
        id: logEntry.id,
        id_deputado: logEntry.id_deputado,
        usuario_email: logEntry.usuario_email,
        usuario_nome: logEntry.usuario_nome,
        usuario_cargo: logEntry.usuario_cargo,
        acao: logEntry.acao,
        entidade: logEntry.entidade,
        entidade_id: logEntry.entidade_id,
        descricao: logEntry.descricao,
        detalhes: logEntry.detalhes,
        severidade: logEntry.severidade,
        created_at: logEntry.created_at,
      })
      .then(({ error }) => {
        if (error) {
          console.warn('Tabela logs_auditoria no Supabase:', error.message);
        }
      });
  } catch (err) {
    console.warn('Erro ao enviar log para o Supabase:', err);
  }

  return logEntry;
}

/**
 * Busca logs com filtros avançados e paginação
 */
export async function fetchAuditLogs(options?: {
  id_deputado?: string;
  acao?: string;
  entidade?: string;
  termo?: string;
  limit?: number;
}): Promise<LogAuditoria[]> {
  try {
    let query = supabase.from('logs_auditoria').select('*').order('created_at', { ascending: false });
    
    if (options?.id_deputado) {
      query = query.eq('id_deputado', options.id_deputado);
    }
    if (options?.acao && options.acao !== 'TODAS') {
      query = query.eq('acao', options.acao);
    }
    if (options?.entidade && options.entidade !== 'TODAS') {
      query = query.eq('entidade', options.entidade);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as LogAuditoria[];
    }
  } catch (e) {
    console.warn('Usando armazenamento de logs em fallback:', e);
  }

  // Fallback to local storage
  let logs = getStoredLogs();
  if (options?.id_deputado) {
    logs = logs.filter(l => l.id_deputado === options.id_deputado);
  }
  if (options?.acao && options.acao !== 'TODAS') {
    logs = logs.filter(l => l.acao === options.acao);
  }
  if (options?.entidade && options.entidade !== 'TODAS') {
    logs = logs.filter(l => l.entidade === options.entidade);
  }
  if (options?.termo) {
    const t = options.termo.toLowerCase();
    logs = logs.filter(l => 
      l.descricao.toLowerCase().includes(t) || 
      l.usuario_nome.toLowerCase().includes(t) || 
      l.usuario_email.toLowerCase().includes(t)
    );
  }
  return logs;
}
