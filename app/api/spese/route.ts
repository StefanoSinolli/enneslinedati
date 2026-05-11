import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.ENNES_DATABASE_URL!);
    const { searchParams } = new URL(request.url);
    const anno = searchParams.get('anno');

    let spese;
    if (anno) {
      spese = await sql`SELECT * FROM spese WHERE anno = ${parseInt(anno)} ORDER BY mese, descrizione`;
    } else {
      spese = await sql`SELECT * FROM spese ORDER BY anno DESC, mese, descrizione`;
    }

    // Converti i campi snake_case a camelCase
    const speseMapped = spese.map((s: any) => ({
      id: s.id,
      descrizione: s.descrizione,
      importo: parseFloat(s.importo),
      daPagare: parseFloat(s.da_pagare),
      pagato: parseFloat(s.pagato),
      scadenza: s.scadenza,
      mese: s.mese,
      anno: s.anno,
    }));

    return NextResponse.json(speseMapped);
  } catch (error) {
    console.error('Errore GET spese:', error);
    return NextResponse.json({ error: 'Errore nel recupero delle spese' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.ENNES_DATABASE_URL!);
    const body = await request.json();

    const { id, descrizione, importo, daPagare, pagato, scadenza, mese, anno } = body;

    await sql`
      INSERT INTO spese (id, descrizione, importo, da_pagare, pagato, scadenza, mese, anno)
      VALUES (${id}, ${descrizione}, ${importo}, ${daPagare}, ${pagato}, ${scadenza || null}, ${mese}, ${anno})
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Errore POST spese:', error);
    return NextResponse.json({ error: 'Errore nella creazione della spesa' }, { status: 500 });
  }
}
