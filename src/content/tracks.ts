/** A language track: its own curriculum, docs and kata runner. */
export const TRACK_IDS = ['java', 'python', 'typescript', 'go', 'rust', 'csharp'] as const
export type TrackId = (typeof TRACK_IDS)[number]

export interface TrackMeta {
  id: TrackId
  label: string
  icon: string
  /** Shown on the track picker. */
  blurb: string
  /** Fenced-code language used when rendering snippets. */
  codeLang: string
  /** Names of the assertion helpers available in kata tests. */
  helpers: string
}

export const TRACKS: Record<TrackId, TrackMeta> = {
  java: {
    id: 'java',
    label: 'Java',
    icon: '☕',
    blurb: 'Java 21, Streams, Records und Spring Boot',
    codeLang: 'java',
    helpers: 'check, checkTrue, checkThrows',
  },
  python: {
    id: 'python',
    label: 'Python',
    icon: '🐍',
    blurb: 'Python 3.12, Comprehensions, Dataclasses und Idiome',
    codeLang: 'python',
    helpers: 'check, check_true, check_raises',
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    icon: '🟦',
    blurb: 'Typsystem, Narrowing, Generics und async/await',
    codeLang: 'typescript',
    helpers: 'check, checkTrue, checkThrows',
  },
  go: {
    id: 'go',
    label: 'Go',
    icon: '🐹',
    blurb: 'Slices, Interfaces, error-Handling und Goroutines',
    codeLang: 'go',
    helpers: 'check, checkTrue, checkErr, checkPanics',
  },
  rust: {
    id: 'rust',
    label: 'Rust',
    icon: '🦀',
    blurb: 'Ownership, Traits, Option/Result und Iteratoren',
    codeLang: 'rust',
    helpers: 'check, check_true, check_panics',
  },
  csharp: {
    id: 'csharp',
    label: 'C#',
    icon: '🟣',
    blurb: 'LINQ, Records, Generics und async/await',
    codeLang: 'csharp',
    helpers: 'Check, CheckTrue, CheckThrows<T>',
  },
}

export const trackList = TRACK_IDS.map((id) => TRACKS[id])

export const isTrackId = (value: string | undefined): value is TrackId =>
  !!value && (TRACK_IDS as readonly string[]).includes(value)
