# Gestionale Ennesline 💅✨

Gestionale moderno per il centro estetica Ennesline, sviluppato con Next.js, TypeScript e Tailwind CSS.

## 🚀 Avvio Rapido

Il server è già attivo su **http://localhost:3000**

Per riavviarlo in futuro:
```bash
cd /Applications/MAMP/htdocs/ennesline/gestionale
npm run dev
```

## 📋 Funzionalità Implementate

### 1. Dashboard
- **Statistiche annuali**: Entrate totali, Spese totali, Saldo, Numero clienti
- **Grafici interattivi**:
  - Entrate vs Spese mensili (grafico a barre)
  - Distribuzione entrate per categoria (grafico a torta)
  - Distribuzione per tipo di pagamento (grafico a torta)
- **Selezione anno**: 2024, 2025, 2026

### 2. Importazione CSV
- **Importazione multipla**: Carica tutti i file CSV di un anno in una volta
- **Importazione singola**: Carica file specifici per mese/anno
- **Auto-riconoscimento**: Il sistema legge automaticamente mese e anno dal nome del file
- **Gestione duplicati**: Evita duplicazioni durante l'importazione
- **Utility**: Cancellazione di tutti i dati

### 3. Storage Dati
- **LocalStorage**: I dati vengono salvati nel browser (nessun bisogno di database esterno)
- **Persistenza**: I dati rimangono anche chiudendo il browser

## 📦 Come Importare i Tuoi Dati CSV

1. Vai su **http://localhost:3000/importa**
2. Usa "Importazione Multipla" per caricare tutti i file CSV contemporaneamente
3. Oppure usa "Importazione Singola" per caricare file specifici

### Formato File Supportato
I tuoi file CSV esistenti sono già nel formato corretto:
- `GENNAIO 2024-GENNAIO 2024.csv`
- `FEBBRAIO 2024-FEBBRAIO 2024.csv`
- etc.

Il sistema riconosce automaticamente:
- **Colonne Spese**: SPESE, DA PAGARE, PAGATO, SCADENZA
- **Colonne Entrate**: ENTRATE, FATTURATO, TIPO PAGAMENTO, SERVIZIO, MACCHINARI, Info

## 🎨 Tecnologie Utilizzate

- **Framework**: Next.js 16 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **Grafici**: Recharts
- **Icone**: Lucide React
- **CSV Parser**: PapaParse
- **Utility Date**: date-fns

## 📊 Struttura Dati

### Spesa
```typescript
{
  id: string
  descrizione: string
  importo: number
  daPagare: number
  pagato: number
  scadenza?: string
  mese: string
  anno: number
}
```

### Entrata
```typescript
{
  id: string
  cliente: string
  servizio: string
  fatturato: number
  tipoPagamento: 'B' | 'C' | 'N' | '-' // Bancomat, Contanti, Altro
  categoria: 'E' | 'M' | 'P' // Estetica, Macchinari, Prodotti
  macchinario?: 'L' | 'RF' | 'C' | 'PRESSO' // Laser, Radiofrequenza, Cellutrim
  info?: string
  data: string
  mese: string
  anno: number
}
```

## 🔜 Prossimi Sviluppi (Opzionali)

Se vorrai aggiungere altre funzionalità, possiamo implementare:

- 📄 Pagine dedicate per visualizzare lista completa di Spese ed Entrate
- 📝 Moduli per aggiungere/modificare spese ed entrate manualmente
- 📅 Vista calendario con appuntamenti
- 👥 Anagrafica clienti
- 📈 Report mensili/annuali esportabili in PDF
- 🔔 Notifiche per scadenze pagamenti
- 💾 Backup e ripristino dati
- ☁️ Sincronizzazione cloud (Supabase)

## 🚢 Deploy su Vercel (Gratuito)

Quando sarai pronto per mettere online il gestionale:

1. Crea un repository GitHub
2. Push del codice
3. Connetti a Vercel
4. Deploy automatico!

## 📱 Responsive Design

Il gestionale funziona perfettamente su:
- 💻 Desktop
- 📱 Tablet
- 📱 Smartphone

## 🎯 Note Importanti

- I dati sono salvati nel **localStorage del browser**
- Usa sempre lo **stesso browser** per accedere ai dati
- Fai backup periodici esportando i dati
- Per produzione, considera di passare a un database cloud (Supabase)

---

**Sviluppato con ❤️ per Ennesline**
