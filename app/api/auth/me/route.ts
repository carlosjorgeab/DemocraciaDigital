import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionToken } from '@/lib/auth-crypto';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('democracia_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch fresh user data
    const { data: userRecord, error } = await supabaseAdmin
      .from('usuarios')
      .select('*, perfil:perfis(nome, permissoes)')
      .eq('id', payload.sub)
      .single();

    if (error || !userRecord) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userData = {
      id: userRecord.id,
      email: userRecord.email,
      id_perfil: userRecord.id_perfil,
      id_deputado: userRecord.id_deputado,
      is_admin: Boolean(userRecord.is_admin),
      exibir_calendario: userRecord.exibir_calendario ?? true,
      perfil: userRecord.perfil,
    };

    return NextResponse.json({
      user: userData,
      sessionId: payload.sessionId || null,
    });
  } catch (err) {
    console.error('Erro na rota /api/auth/me:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
