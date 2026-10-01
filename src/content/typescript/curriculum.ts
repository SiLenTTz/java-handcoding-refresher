import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Typsystem',
    B: 'Datenstrukturen & Funktionen',
    C: 'Design & Praxis',
  },
  chapters: [
    { id: '01', title: 'Typen & Narrowing', module: 'A', file: '01-typen-narrowing.md' },
    { id: '02', title: 'Arrays & Iteration', module: 'B', file: '02-arrays-iteration.md' },
    { id: '03', title: 'Objekte, Map & Set', module: 'B', file: '03-objekte-map-set.md' },
    { id: '04', title: 'Funktionen & Generics', module: 'B', file: '04-funktionen-generics.md' },
    { id: '05', title: 'Unions & Discriminated Unions', module: 'A', file: '05-unions.md' },
    { id: '06', title: 'Utility Types', module: 'A', file: '06-utility-types.md' },
    { id: '07', title: 'null, undefined & Fehlerbehandlung', module: 'C', file: '07-null-fehlerbehandlung.md' },
    { id: '08', title: 'Promises & async/await', module: 'C', file: '08-promises-async.md' },
  ],
}

export default curriculum
