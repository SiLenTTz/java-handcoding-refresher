import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Grundlagen',
    B: 'Bausteine',
    C: 'Praxis',
  },
  chapters: [
    { id: '01', title: 'FUP Grundlagen: Boxen & Signalfluss', module: 'A', file: '01-grundlagen-boxen.md' },
    { id: '02', title: 'Logische Boxen & Negation', module: 'A', file: '02-logische-boxen-negation.md' },
    { id: '03', title: 'Speicher & Flanken (SR, RS, P_TRIG)', module: 'B', file: '03-speicher-flanken.md' },
    { id: '04', title: 'Timer & Zähler', module: 'B', file: '04-timer-zaehler.md' },
    { id: '05', title: 'Vergleich, Arithmetik & MOVE', module: 'B', file: '05-vergleich-arithmetik-move.md' },
    { id: '06', title: 'FUP ↔ SCL übersetzen', module: 'C', file: '06-fup-scl-uebersetzen.md' },
  ],
}

export default curriculum
