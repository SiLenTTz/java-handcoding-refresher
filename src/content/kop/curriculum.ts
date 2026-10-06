import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Grundlagen',
    B: 'Bausteine',
    C: 'Praxis',
  },
  chapters: [
    { id: '01', title: 'KOP Grundlagen: Strompfad, Kontakt, Spule', module: 'A', file: '01-grundlagen-strompfad.md' },
    { id: '02', title: 'Reihe, Parallel & Verzweigung', module: 'A', file: '02-reihe-parallel-verzweigung.md' },
    { id: '03', title: 'Set, Reset & Flanken', module: 'B', file: '03-set-reset-flanken.md' },
    { id: '04', title: 'Timer & Zähler', module: 'B', file: '04-timer-zaehler.md' },
    { id: '05', title: 'Vergleicher, Mathe & MOVE', module: 'B', file: '05-vergleicher-mathe-move.md' },
    { id: '06', title: 'KOP ↔ SCL übersetzen', module: 'C', file: '06-kop-scl-uebersetzen.md' },
  ],
}

export default curriculum
