import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyPassword, hashPassword, createSessionToken } from '@/lib/auth-crypto';
import { generateUUID } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim();

    // Query user by email (case-insensitive)
    const { data: userRecord, error: fetchError } = await supabaseAdmin
      .from('usuarios')
      .select('*, perfil:perfis(nome, permissoes)')
      .ilike('email', cleanEmail)
      .single();

    if (fetchError || !userRecord) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (userRecord.ativo === false) {
      return NextResponse.json(
        { error: 'Usuário inativo. Entre em contato com o administrador do sistema.' },
        { status: 403 }
      );
    }

    // Verify password (supports PBKDF2 hashes as well as legacy plaintext)
    const { valid, needsRehash } = await verifyPassword(senha, userRecord.senha || '');

    if (!valid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Seamlessly upgrade legacy plaintext password to PBKDF2 hash
    if (needsRehash) {
      const newHash = await hashPassword(senha);
      await supabaseAdmin
        .from('usuarios')
        .update({ senha: newHash })
        .eq('id', userRecord.id);
    }

    const sessionId = generateUUID();

    // Update session tracking in database
    await supabaseAdmin
      .from('usuarios')
      .update({
        current_session_id: sessionId,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', userRecord.id);

    const userData = {
      id: userRecord.id,
      email: userRecord.email,
      id_perfil: userRecord.id_perfil,
      id_deputado: userRecord.id_deputado,
      is_admin: Boolean(userRecord.is_admin),
      exibir_calendario: userRecord.exibir_calendario ?? true,
      perfil: userRecord.perfil,
    };

    // Create secure signed session token
    const token = await createSessionToken({
      sub: userRecord.id,
      email: userRecord.email,
      isAdmin: Boolean(userRecord.is_admin),
      idDeputado: userRecord.id_deputado,
      sessionId,
    });

    const response = NextResponse.json({
      success: true,
      user: userData,
      sessionId,
    });

    // Set secure HttpOnly cookie for session
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = 7 * 24 * 60 * 60; // 7 days

    response.cookies.set('democracia_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    response.cookies.set('democracia_session_id', sessionId, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    // Set a lightweight cookie so frontend can check auth state immediately
    response.cookies.set('democracia_logged_in', '1', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err: any) {
    console.error('Erro na rota de login:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar login' },
      { status: 500 }
    );
  }
}
