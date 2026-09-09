import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id_deputado = searchParams.get('id_deputado');

    if (!id_deputado) {
      return NextResponse.json({ error: 'id_deputado é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('gabinete_agendas')
      .select('*')
      .eq('id_deputado', id_deputado)
      .order('data_inicio', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendas:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro na API de agendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_deputado, ...agendaData } = body;

    if (!id_deputado) {
      return NextResponse.json({ error: 'id_deputado é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('gabinete_agendas')
      .insert([{
        ...agendaData,
        id_deputado,
        uf: agendaData.uf ? agendaData.uf.substring(0, 2).toUpperCase() : null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar agenda:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro na API de agendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
