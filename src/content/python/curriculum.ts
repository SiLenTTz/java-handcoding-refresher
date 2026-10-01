import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Python Fundamentals',
    B: 'Datenstrukturen & Idiome',
    C: 'Design & Praxis',
  },
  chapters: [
    { id: '01', title: 'Python Core', module: 'A', file: '01-python-core.md' },
    { id: '02', title: 'Listen, Tupel & Sets', module: 'A', file: '02-listen-tupel-sets.md' },
    { id: '03', title: 'Dicts', module: 'A', file: '03-dicts.md' },
    { id: '04', title: 'Comprehensions & Generatoren', module: 'B', file: '04-comprehensions-generatoren.md' },
    { id: '05', title: 'Funktionen & Closures', module: 'B', file: '05-funktionen-closures.md' },
    { id: '06', title: 'Dataclasses & Typing', module: 'B', file: '06-dataclasses-typing.md' },
    { id: '07', title: 'Fehlerbehandlung & Kontextmanager', module: 'C', file: '07-fehler-kontextmanager.md' },
    { id: '08', title: 'Idiome & Testing', module: 'C', file: '08-idiome-testing.md' },
  ],
}

export default curriculum
