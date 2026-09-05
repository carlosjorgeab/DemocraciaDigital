import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionToken, hashPassword } from '@/lib/auth-crypto';

async function checkPermission(request: NextRequest): Promise<{ authorized: boolean; errorResponse?: NextResponse }> {
  const token = request.cookies.get('democracia_token')?.value;
  if (!token) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    };
  }

  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 }),
    };
  }

  if (payload.isAdmin) {
    return { authorized: true };
  }

  // Check user permission
  const { data: userRecord } = await supabaseAdmin
    .from('usuarios')
    .select('is_admin, perfil:perfis(permissoes)')
    .eq('id', payload.sub)
    .single();

  const permissions: string[] = (userRecord as any)?.perfil?.permissoes || [];
  if (userRecord?.is_admin || permissions.includes('/usuarios')) {
    return { authorized: true };
  }

  return {
    authorized: false,
    errorResponse: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }),
  };
}

export async function POST(request: NextRequest) {
  const auth = await checkPermission(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await request.json();
    const { email, senha, id_perfil, id_deputado, is_admin, exibir_calendario } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios para novo usuário' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(senha);

    const userData: any = {
      email: email.trim(),
      senha: hashedPassword,
      id_perfil: is_admin ? null : id_perfil || null,
      id_deputado: is_admin ? null : id_deputado || null,
      is_admin: Boolean(is_admin),
      exibir_calendario: exibir_calendario ?? true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .insert([userData])
      .select('id, email, id_perfil, id_deputado, is_admin, exibir_calendario')
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message.includes('unique') ? 'E-mail já cadastrado no sistema' : 'Erro ao criar usuário' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error('Erro ao criar usuário:', err);
    return NextResponse.json({ error: 'Erro interno ao criar usuário' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkPermission(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const body = await request.json();
    const { id, email, senha, id_perfil, id_deputado, is_admin, exibir_calendario } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const userData: any = {
      email: email ? email.trim() : undefined,
      id_perfil: is_admin ? null : id_perfil || null,
      id_deputado: is_admin ? null : id_deputado || null,
      is_admin: Boolean(is_admin),
      exibir_calendario: exibir_calendario ?? true,
    };

    if (senha && senha.trim() !== '') {
      userData.senha = await hashPassword(senha.trim());
    }

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(userData)
      .eq('id', id)
      .select('id, email, id_perfil, id_deputado, is_admin, exibir_calendario')
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message.includes('unique') ? 'E-mail já cadastrado no sistema' : 'Erro ao atualizar usuário' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error('Erro ao atualizar usuário:', err);
    return NextResponse.json({ error: 'Erro interno ao atualizar usuário' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await checkPermission(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Check if user is the main admin
    const { data: targetUser } = await supabaseAdmin
      .from('usuarios')
      .select('email')
      .eq('id', id)
      .single();

    if (targetUser?.email === 'admin') {
      return NextResponse.json({ error: 'Não é permitido excluir o usuário admin principal' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('usuarios').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao excluir usuário:', err);
    return NextResponse.json({ error: 'Erro interno ao excluir usuário' }, { status: 500 });
  }
}
