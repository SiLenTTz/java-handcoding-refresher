import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Sprachgrundlagen',
    B: 'Steuerfluss',
    C: 'Bausteine & Praxis',
  },
  chapters: [
    { id: '01', title: 'SCL Grundlagen & Datentypen', module: 'A', file: '01-grundlagen-datentypen.md' },
    { id: '02', title: 'Operatoren & Ausdrücke', module: 'A', file: '02-operatoren-ausdruecke.md' },
    { id: '03', title: 'IF & CASE', module: 'B', file: '03-if-case.md' },
    { id: '04', title: 'Schleifen', module: 'B', file: '04-schleifen.md' },
    { id: '05', title: 'FC, FB & Instanz-DB', module: 'C', file: '05-fc-fb-instanz-db.md' },
    { id: '06', title: 'Arrays, Structs & Timer', module: 'C', file: '06-arrays-structs-timer.md' },
  ],
}

export default curriculum
