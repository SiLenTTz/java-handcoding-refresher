import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Go Fundamentals',
    B: 'Typen & Interfaces',
    C: 'Nebenläufigkeit & Praxis',
  },
  chapters: [
    { id: '01', title: 'Go Core', module: 'A', file: '01-go-core.md' },
    { id: '02', title: 'Slices & Maps', module: 'A', file: '02-slices-maps.md' },
    { id: '03', title: 'Structs & Methoden', module: 'B', file: '03-structs-methoden.md' },
    { id: '04', title: 'Interfaces & Embedding', module: 'B', file: '04-interfaces-embedding.md' },
    { id: '05', title: 'Fehlerbehandlung', module: 'B', file: '05-fehlerbehandlung.md' },
    { id: '06', title: 'Funktionen, Closures & defer', module: 'A', file: '06-funktionen-defer.md' },
    { id: '07', title: 'Goroutines & Channels', module: 'C', file: '07-goroutines-channels.md' },
    { id: '08', title: 'Packages, Idiome & Testing', module: 'C', file: '08-packages-testing.md' },
  ],
}

export default curriculum
