import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.ennes_POSTGRES_URL!);
    const { searchParams } = new URL(request.url);
    const anno = searchParams.get('anno');

    let entrate;
    if (anno) {
      entrate = await sql`SELECT * FROM entrate WHERE anno = ${parseInt(anno)} ORDER BY data DESC`;
    } else {
      entrate = await sql`SELECT * FROM entrate ORDER BY anno DESC, data DESC`;
    }

    // Converti i campi snake_case a camelCase
    const entrateMapped = entrate.map((e: any) => ({
      id: e.id,
      cliente: e.cliente,
      servizio: e.servizio,
      fatturato: parseFloat(e.fatturato),
      tipoPagamento: e.tipo_pagamento,
      categoria: e.categoria,
      macchinario: e.macchinario,
      info: e.info,
      data: e.data,
      mese: e.mese,
      anno: e.anno,
    }));

    return NextResponse.json(entrateMapped);
  } catch (error) {
    console.error('Errore GET entrate:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle entrate' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.ennes_POSTGRES_URL!);
    const body = await request.json();

    const { id, cliente, servizio, fatturato, tipoPagamento, categoria, macchinario, info, data, mese, anno } = body;

    console.log('Creazione entrata:', { id, cliente, servizio, fatturato, tipoPagamento, categoria, macchinario, info, data, mese, anno });

    await sql`
      INSERT INTO entrate (id, cliente, servizio, fatturato, tipo_pagamento, categoria, macchinario, info, data, mese, anno)
      VALUES (${id}, ${cliente}, ${servizio}, ${fatturato}, ${tipoPagamento}, ${categoria}, ${macchinario || null}, ${info || null}, ${data}, ${mese}, ${anno})
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Errore POST entrate:', error);
    console.error('Dettagli errore:', error.message, error.code);
    return NextResponse.json({ 
      error: 'Errore nella creazione dell\'entrata',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = neon(process.env.ennes_POSTGRES_URL!);
    const { searchParams } = new URL(request.url);
    const anno = searchParams.get('anno');
    const mese = searchParams.get('mese');

    if (!anno || !mese) {
      return NextResponse.json({ error: 'Anno e mese sono obbligatori' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM entrate 
      WHERE anno = ${parseInt(anno)} AND mese = ${mese}
    `;

    return NextResponse.json({ success: true, deleted: result.length });
  } catch (error) {
    console.error('Errore DELETE entrate:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione delle entrate' }, { status: 500 });
  }
}
