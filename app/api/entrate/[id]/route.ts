import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.ENNES_URL!);

    const entrate = await sql`SELECT * FROM entrate WHERE id = ${id}`;

    if (entrate.length === 0) {
      return NextResponse.json({ error: 'Entrata non trovata' }, { status: 404 });
    }

    const e = entrate[0];
    const entrata = {
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
    };

    return NextResponse.json(entrata);
  } catch (error) {
    console.error('Errore GET entrata:', error);
    return NextResponse.json({ error: 'Errore nel recupero dell\'entrata' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.ENNES_URL!);
    const body = await request.json();

    const { cliente, servizio, fatturato, tipoPagamento, categoria, macchinario, info, data, mese, anno } = body;

    await sql`
      UPDATE entrate
      SET cliente = ${cliente},
          servizio = ${servizio},
          fatturato = ${fatturato},
          tipo_pagamento = ${tipoPagamento},
          categoria = ${categoria},
          macchinario = ${macchinario || null},
          info = ${info || null},
          data = ${data},
          mese = ${mese},
          anno = ${anno},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore PUT entrata:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento dell\'entrata' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.ENNES_URL!);

    await sql`DELETE FROM entrate WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore DELETE entrata:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione dell\'entrata' }, { status: 500 });
  }
}
