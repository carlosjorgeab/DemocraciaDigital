import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionToken } from '@/lib/auth-crypto';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('democracia_token')?.value;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload?.sub) {
        // Clear session ID in database
        await supabaseAdmin
          .from('usuarios')
          .update({ current_session_id: null })
          .eq('id', payload.sub);
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear session cookies
    response.cookies.delete('democracia_token');
    response.cookies.delete('democracia_session_id');
    response.cookies.delete('democracia_logged_in');

    return response;
  } catch (err) {
    console.error('Erro na rota de logout:', err);
    const response = NextResponse.json({ success: true });
    response.cookies.delete('democracia_token');
    response.cookies.delete('democracia_session_id');
    response.cookies.delete('democracia_logged_in');
    return response;
  }
}
