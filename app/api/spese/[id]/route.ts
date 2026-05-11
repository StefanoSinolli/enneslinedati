import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const spese = await sql`SELECT * FROM spese WHERE id = ${id}`;

    if (spese.length === 0) {
      return NextResponse.json({ error: 'Spesa non trovata' }, { status: 404 });
    }

    const s = spese[0];
    const spesa = {
      id: s.id,
      descrizione: s.descrizione,
      importo: parseFloat(s.importo),
      daPagare: parseFloat(s.da_pagare),
      pagato: parseFloat(s.pagato),
      scadenza: s.scadenza,
      mese: s.mese,
      anno: s.anno,
    };

    return NextResponse.json(spesa);
  } catch (error) {
    console.error('Errore GET spesa:', error);
    return NextResponse.json({ error: 'Errore nel recupero della spesa' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();

    const { descrizione, importo, daPagare, pagato, scadenza, mese, anno } = body;

    await sql`
      UPDATE spese
      SET descrizione = ${descrizione},
          importo = ${importo},
          da_pagare = ${daPagare},
          pagato = ${pagato},
          scadenza = ${scadenza || null},
          mese = ${mese},
          anno = ${anno},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore PUT spesa:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento della spesa' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    await sql`DELETE FROM spese WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore DELETE spesa:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione della spesa' }, { status: 500 });
  }
}
