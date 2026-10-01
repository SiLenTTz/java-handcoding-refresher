import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'C# Fundamentals',
    B: 'Typen & Design',
    C: 'Praxis',
  },
  chapters: [
    { id: '01', title: 'C# Core & Nullable Types', module: 'A', file: '01-csharp-core.md' },
    { id: '02', title: 'Collections', module: 'A', file: '02-collections.md' },
    { id: '03', title: 'LINQ', module: 'A', file: '03-linq.md' },
    { id: '04', title: 'Klassen, Records & Structs', module: 'B', file: '04-klassen-records-structs.md' },
    { id: '05', title: 'Interfaces & Polymorphie', module: 'B', file: '05-interfaces-polymorphie.md' },
    { id: '06', title: 'Exceptions & IDisposable', module: 'C', file: '06-exceptions-idisposable.md' },
    { id: '07', title: 'Generics, Delegates & Lambdas', module: 'B', file: '07-generics-delegates.md' },
    { id: '08', title: 'async/await & Idiome', module: 'C', file: '08-async-idiome.md' },
  ],
}

export default curriculum
