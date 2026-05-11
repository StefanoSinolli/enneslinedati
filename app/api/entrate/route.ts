import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
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
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();

    const { id, cliente, servizio, fatturato, tipoPagamento, categoria, macchinario, info, data, mese, anno } = body;

    await sql`
      INSERT INTO entrate (id, cliente, servizio, fatturato, tipo_pagamento, categoria, macchinario, info, data, mese, anno)
      VALUES (${id}, ${cliente}, ${servizio}, ${fatturato}, ${tipoPagamento}, ${categoria}, ${macchinario || null}, ${info || null}, ${data}, ${mese}, ${anno})
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Errore POST entrate:', error);
    return NextResponse.json({ error: 'Errore nella creazione dell\'entrata' }, { status: 500 });
  }
}
