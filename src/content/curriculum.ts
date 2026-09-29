export interface ChapterMeta {
  id: string
  title: string
  module: 'A' | 'B' | 'C' | 'D'
  /** markdown file name in docs/chapters */
  file: string
}

export const MODULES = {
  A: 'Java Fundamentals',
  B: 'Software Design',
  C: 'Spring Backend',
  D: 'Engineering Practice',
} as const

export const CHAPTERS: ChapterMeta[] = [
  { id: '01', title: 'Java Core', module: 'A', file: '01-java-core.md' },
  { id: '02', title: 'Collections', module: 'A', file: '02-collections.md' },
  { id: '03', title: 'Map', module: 'A', file: '03-map.md' },
  { id: '04', title: 'Streams Basics', module: 'A', file: '04-streams-basics.md' },
  { id: '05', title: 'Streams Advanced', module: 'A', file: '05-streams-advanced.md' },
  { id: '06', title: 'Optional', module: 'A', file: '06-optional.md' },
  { id: '07', title: 'Records & Immutability', module: 'A', file: '07-records-immutability.md' },
  { id: '08', title: 'DTO / Entity / Mapper', module: 'A', file: '08-dto-entity-mapper.md' },
  { id: '09', title: 'OOP', module: 'B', file: '09-oop.md' },
  { id: '10', title: 'SOLID', module: 'B', file: '10-solid.md' },
  { id: '11', title: 'Generics', module: 'B', file: '11-generics.md' },
  { id: '12', title: 'Lambdas & Functional Interfaces', module: 'B', file: '12-lambdas-functional-interfaces.md' },
  { id: '13', title: 'Exceptions', module: 'B', file: '13-exceptions.md' },
  { id: '14', title: 'Clean Code', module: 'B', file: '14-clean-code.md' },
  { id: '15', title: 'Design Patterns', module: 'B', file: '15-design-patterns.md' },
  { id: '16', title: 'Spring Dependency Injection', module: 'C', file: '16-spring-dependency-injection.md' },
  { id: '17', title: 'Controller / Service / Repository', module: 'C', file: '17-controller-service-repository.md' },
  { id: '18', title: 'Spring Data', module: 'C', file: '18-spring-data.md' },
  { id: '19', title: 'Page / Slice / Pageable', module: 'C', file: '19-page-slice-pageable.md' },
  { id: '20', title: 'JPA & Transactions', module: 'C', file: '20-jpa-transactions.md' },
  { id: '21', title: 'JPA Performance', module: 'C', file: '21-jpa-performance.md' },
  { id: '22', title: 'Testing', module: 'D', file: '22-testing.md' },
  { id: '23', title: 'Refactoring', module: 'D', file: '23-refactoring.md' },
  { id: '24', title: 'Architecture Exercise', module: 'D', file: '24-architecture-exercise.md' },
  { id: '25', title: 'Final Exam Guide', module: 'D', file: '25-final-exam-guide.md' },
]
