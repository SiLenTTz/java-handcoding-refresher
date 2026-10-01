import type { Curriculum } from '../types'

const curriculum: Curriculum = {
  modules: {
    A: 'Rust Fundamentals',
    B: 'Typen & Traits',
    C: 'Idiome & Praxis',
  },
  chapters: [
    { id: '01', title: 'Rust Core', module: 'A', file: '01-rust-core.md' },
    { id: '02', title: 'Ownership & Borrowing', module: 'A', file: '02-ownership-borrowing.md' },
    { id: '03', title: 'Structs, Enums & Pattern Matching', module: 'B', file: '03-structs-enums-matching.md' },
    { id: '04', title: 'Vec, HashMap & Slices', module: 'A', file: '04-vec-hashmap-slices.md' },
    { id: '05', title: 'Option, Result & Fehlerbehandlung', module: 'B', file: '05-option-result.md' },
    { id: '06', title: 'Traits & Generics', module: 'B', file: '06-traits-generics.md' },
    { id: '07', title: 'Iteratoren & Closures', module: 'C', file: '07-iteratoren-closures.md' },
    { id: '08', title: 'Module, Tests & Idiome', module: 'C', file: '08-module-tests-idiome.md' },
  ],
}

export default curriculum
