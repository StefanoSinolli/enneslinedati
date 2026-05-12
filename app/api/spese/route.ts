import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.ennes_POSTGRES_URL!);
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
    const sql = neon(process.env.ennes_POSTGRES_URL!);
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
      DELETE FROM spese 
      WHERE anno = ${parseInt(anno)} AND mese = ${mese}
    `;

    return NextResponse.json({ success: true, deleted: result.length });
  } catch (error) {
    console.error('Errore DELETE spese:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione delle spese' }, { status: 500 });
  }
}
