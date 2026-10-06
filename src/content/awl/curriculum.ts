import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Grundlagen',
    B: 'Verknüpfung & Speicher',
    C: 'Bausteine & Praxis',
  },
  chapters: [
    { id: '01', title: 'AWL Grundlagen & VKE', module: 'A', file: '01-grundlagen-vke.md' },
    { id: '02', title: 'Verknüpfungen & Klammern', module: 'B', file: '02-verknuepfungen-klammern.md' },
    { id: '03', title: 'Speicher & Flanken', module: 'B', file: '03-speicher-flanken.md' },
    { id: '04', title: 'Laden, Transferieren & Akkus', module: 'A', file: '04-laden-transferieren-akkus.md' },
    { id: '05', title: 'Sprünge & Bausteinaufrufe', module: 'C', file: '05-spruenge-bausteinaufrufe.md' },
    { id: '06', title: 'Timer, Zähler & Praxis', module: 'C', file: '06-timer-zaehler-praxis.md' },
  ],
}

export default curriculum
