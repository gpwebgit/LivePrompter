export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.4',
    date: '27 aprile 2026',
    changes: [
      'Editor: controllo dimensione sostituito con spinner ▼ valore ▲ — range 0.5×–2.0×, step 0.1×, con campo editabile direttamente (conferma con Invio)',
    ],
  },
  {
    version: '1.2.3',
    date: '27 aprile 2026',
    changes: [
      'Fix editor: il rendering Live ora appare correttamente — il ResizeObserver si attaccava prima che il brano fosse caricato (liveAreaRef null), ora aspetta che song sia disponibile',
    ],
  },
  {
    version: '1.2.2',
    date: '27 aprile 2026',
    changes: [
      'Editor: selezione sempre preservata dopo aver applicato un marcatore — la selezione si sposta sull\'intero blocco inserito, pronta per una successiva modifica',
      'Editor: applicare un colore o una dimensione su testo già formattato sostituisce il marcatore esistente invece di annidarne uno nuovo',
    ],
  },
  {
    version: '1.2.1',
    date: '27 aprile 2026',
    changes: [
      'Editor brani: rendering Live sempre visibile affianco alla textarea — nessun toggle modalità, le modifiche si vedono in tempo reale',
      'Layout adattivo: portrait = Live sopra / testo sotto; landscape = Live a sinistra (58%) / testo a destra (42%)',
      'Navigazione pagine senza contatore: solo ‹ › (come la modalità Live, senza "2/3")',
      'Export rinominato: il file scaricato si chiama nomeoriginale_edit.txt',
      'Libreria: reader Play aggiornato — nessun contatore, solo ‹ ›',
    ],
  },
  {
    version: '1.2.0',
    date: '27 aprile 2026',
    changes: [
      'Libreria brani: pulsante "Apri libreria" in Impostazioni — lista A-Z con Play (anteprima live), Modifica (matita) ed Elimina (con conferma)',
      'Editor brani: nuova schermata /editor/:id con textarea nativa, toolbar colori (9 configurati + picker libero) e dimensioni (0.7× 0.8× 1.2× 1.5× 2×)',
      'Applica colore e dimensione alla selezione con marcatori [COLOR=#hex]...[/COLOR] e [SIZE=n]...[/SIZE]',
      'Anteprima live identica alla schermata Live (stesso paginator, stesso font, navigazione pagine)',
      'Esporta brano come .txt con marcatori inclusi — reimportabile dal normale import',
      'Nuovi marcatori riconosciuti anche nel Live screen: colore e dimensione personalizzati per singole parole o frasi',
    ],
  },
  {
    version: '1.1.6',
    date: '27 aprile 2026',
    changes: [
      'Preview riga successiva: il gap prima della riga di anteprima rispetta la struttura originale del testo — nessun gap se la riga continua la stessa strofa/ritornello, gap normale se inizia un nuovo blocco',
    ],
  },
  {
    version: '1.1.5',
    date: '27 aprile 2026',
    changes: [
      'Fix gap tra sezioni dello stesso tipo: ritornelli multipli ([r]...[r]...) ora mostrano la spaziatura corretta tra i blocchi anche nella paginazione riga per riga',
    ],
  },
  {
    version: '1.1.4',
    date: '27 aprile 2026',
    changes: [
      'Fix cliff edge paginazione: se il fitting orizzontale scende sotto il font minimo, il paginator non esclude più la riga — usa FONT_MIN e lascia che TextLine gestisca il clamp per la singola riga troppo lunga',
      'Risultato: pagine consistenti indipendentemente da piccole variazioni della larghezza schermo',
    ],
  },
  {
    version: '1.1.3',
    date: '27 aprile 2026',
    changes: [
      'Paginazione riga per riga: le sezioni (strofa/ritornello) possono essere spezzate tra pagine — ogni riga porta con sé il proprio colore',
      'Pagine sempre piene: nessuno spazio vuoto inutile, il testo occupa tutto lo spazio disponibile',
    ],
  },
  {
    version: '1.1.2',
    date: '27 aprile 2026',
    changes: [
      'Preview riga successiva: animazione di respirazione lenta (2.5s, ease-in-out, opacity 0.20→0.45→0.20) per dare senso di anticipazione — "nella prossima pagina arriva questo"',
    ],
  },
  {
    version: '1.1.1',
    date: '27 aprile 2026',
    changes: [
      'Preview riga successiva: la prima riga della pagina successiva appare in fondo alla pagina corrente con opacità ridotta (35%), riempiendo visivamente lo spazio vuoto e anticipando il contenuto imminente',
      'La preview non compare sull\'ultima pagina di ogni canzone',
    ],
  },
  {
    version: '1.1.0',
    date: '27 aprile 2026',
    changes: [
      'Fix paginazione: il font viene ridotto gradualmente finché il contenuto entra verticalmente — prima si fermava se il font orizzontale dava un\'altezza troppo grande, ora riduce iterativamente fino a FONT_MIN',
      'Risultato: molte più sezioni per pagina, quasi nessuno spazio vuoto inutile',
    ],
  },
  {
    version: '1.0.9',
    date: '27 aprile 2026',
    changes: [
      'Paginator completamente riallineato con il renderer: usa calcPageFontBase (fitting orizzontale reale) per decidere se le sezioni entrano, invece del font teorico verticale',
      'Rimosse le costanti di calcolo ridondanti; l\'altezza verificata è quella che verrà effettivamente renderizzata',
      'Riduzione del margine di sicurezza a 10% (era 18%) grazie alla maggiore accuratezza del calcolo',
    ],
  },
  {
    version: '1.0.8',
    date: '27 aprile 2026',
    changes: [
      'Corretto bug critico: il greedy fill non si fermava mai perché findFontForPage restituiva sempre almeno FONT_MIN anche quando il contenuto non entrava fisicamente — ora restituisce null e il fill si ferma correttamente, avviando una nuova pagina',
      'Il testo non viene più tagliato invisibilmente: le sezioni che non entrano vanno alla pagina successiva della stessa canzone',
    ],
  },
  {
    version: '1.0.7',
    date: '27 aprile 2026',
    changes: [
      'Corretto overflow verticale: margine di sicurezza alzato (82%) per garantire che il testo non venga mai tagliato in basso',
    ],
  },
  {
    version: '1.0.6',
    date: '27 aprile 2026',
    changes: [
      'Paginazione completamente riscritta: algoritmo greedy fill senza limite predefinito di sezioni per pagina',
      'Le sezioni vengono aggiunte alla pagina finché il font rimane leggibile (≥ 22sp). Nessun altro tetto.',
      'Risultato: molte meno pagine, testo distribuito in modo più intelligente, quasi niente spazio vuoto inutile',
    ],
  },
  {
    version: '1.0.5',
    date: '27 aprile 2026',
    changes: [
      'Paginazione più intelligente: optimization pass post-distribuzione che sposta sezioni dalla pagina successiva a quella corrente quando c\'è spazio verticale disponibile',
      'Riduzione del numero totale di pagine per canzone; meno pagine = meno salti col pedale',
      'Lo spazio nero sotto il testo viene ora sfruttato aggiungendo la sezione successiva se ci sta',
    ],
  },
  {
    version: '1.0.4',
    date: '27 aprile 2026',
    changes: [
      'Font omogeneo per pagina: tutte le righe usano lo stesso font size basato sulla riga più lunga (differenza massima 20% dalla base)',
      'Eliminata la variazione aggressiva di font tra righe corte e righe lunghe nella stessa pagina',
    ],
  },
  {
    version: '1.0.3',
    date: '27 aprile 2026',
    changes: [
      'Marcatori [R], [S], [/S] ora case-insensitive: [r], [s], [/s] e qualsiasi combinazione maiuscolo/minuscolo funzionano correttamente',
    ],
  },
  {
    version: '1.0.2',
    date: '27 aprile 2026',
    changes: [
      'Anteprima schermata live completa nelle Impostazioni: titolo, strofe, ritornello, testo speciale, orologio e barra si aggiornano in tempo reale al cambio colore',
      'Pulsante "Sovrascrivi tutti" nel dialogo di importazione per gestire più conflitti in un colpo solo',
      'Formato versione aggiornato a X.Y.Z',
    ],
  },
  {
    version: '1.0.1',
    date: '27 aprile 2026',
    changes: [
      'Footer con versione e changelog su tutte le schermate di gestione',
      'Corretto matching apostrofi nel pannello "Incolla lista" (apostrofo curvo, dritto e varianti Unicode)',
      'UI responsive: contenuto centrato con max-width in modalità landscape',
      'Pulsante "‹" nella schermata Live ora porta alla Home',
      'Logo LivePrompter aggiunto in cima alla Home',
      'Icona impostazioni ripristinata nella Home',
      'Color picker si apre vicino al quadratino di colore nelle Impostazioni',
    ],
  },
  {
    version: '1.0.0',
    date: '27 aprile 2026',
    changes: [
      'Prima release: PWA teleprompter per musicisti dal vivo, 100% offline',
      '4 schermate: Home scalette, Editor scaletta, Teleprompter Live, Impostazioni',
      'Paginazione adattiva per orientamento: portrait (min 2 sezioni/pagina), landscape (min 1 sezione/pagina)',
      'Font ottimizzato per pagina: massimizza la leggibilità in base al contenuto di ogni pagina',
      'Riduzione automatica font per righe troppo lunghe — mai a-capo involontari',
      'Supporto pedale Bluetooth PageDown/PageUp per navigazione pagine',
      'Wake Lock API: schermo sempre acceso durante la performance',
      'Ricalcolo paginazione in tempo reale al ridimensionamento/rotazione schermo',
      'Testo al volo: ricerca e lettura brani dalla libreria senza interrompere la scaletta',
      'Incolla lista: crea scaletta incollando i titoli uno per riga',
      'Importazione brani da file .txt con avviso per file RTF non compatibili',
      '9 colori live configurabili con anteprima in tempo reale',
      'Marcatori [R] ritornello (giallo), [S]...[/S] testo speciale (viola)',
      'Drag & drop per riordinare i brani nella scaletta',
    ],
  },
]
