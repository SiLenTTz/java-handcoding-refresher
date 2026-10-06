/** A language track: its own curriculum, docs and kata runner. */
export const TRACK_IDS = ['java', 'python', 'typescript', 'go', 'rust', 'csharp', 'scl', 'awl', 'fup', 'kop'] as const
export type TrackId = (typeof TRACK_IDS)[number]

export interface TrackMeta {
  id: TrackId
  label: string
  icon: string
  /** Shown on the track picker. */
  blurb: string
  /** Fenced-code language used when rendering snippets. */
  codeLang: string
  /**
   * False when no toolchain can execute the code locally – SPS languages have no
   * CLI compiler, and FUP/KOP are graphical. Their katas are write & compare.
   */
  runnable: boolean
  /** Names of the assertion helpers available in kata tests. */
  helpers?: string
}

export const TRACKS: Record<TrackId, TrackMeta> = {
  java: {
    id: 'java',
    label: 'Java',
    icon: '☕',
    blurb: 'Java 21, Streams, Records und Spring Boot',
    codeLang: 'java',
    runnable: true,
    helpers: 'check, checkTrue, checkThrows',
  },
  python: {
    id: 'python',
    label: 'Python',
    icon: '🐍',
    blurb: 'Python 3.12, Comprehensions, Dataclasses und Idiome',
    codeLang: 'python',
    runnable: true,
    helpers: 'check, check_true, check_raises',
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    icon: '🟦',
    blurb: 'Typsystem, Narrowing, Generics und async/await',
    codeLang: 'typescript',
    runnable: true,
    helpers: 'check, checkTrue, checkThrows',
  },
  go: {
    id: 'go',
    label: 'Go',
    icon: '🐹',
    blurb: 'Slices, Interfaces, error-Handling und Goroutines',
    codeLang: 'go',
    runnable: true,
    helpers: 'check, checkTrue, checkErr, checkPanics',
  },
  rust: {
    id: 'rust',
    label: 'Rust',
    icon: '🦀',
    blurb: 'Ownership, Traits, Option/Result und Iteratoren',
    codeLang: 'rust',
    runnable: true,
    helpers: 'check, check_true, check_panics',
  },
  csharp: {
    id: 'csharp',
    label: 'C#',
    icon: '🟣',
    blurb: 'LINQ, Records, Generics und async/await',
    codeLang: 'csharp',
    runnable: true,
    helpers: 'Check, CheckTrue, CheckThrows<T>',
  },
  scl: {
    id: 'scl',
    label: 'SCL / ST',
    icon: '🏭',
    blurb: 'Structured Text nach IEC 61131-3: Bausteine, CASE, Schleifen',
    codeLang: 'pascal',
    runnable: false,
  },
  awl: {
    id: 'awl',
    label: 'AWL / STL',
    icon: '📜',
    blurb: 'Anweisungsliste: VKE, Akkus, Speicher- und Sprungbefehle',
    codeLang: 'text',
    runnable: false,
  },
  fup: {
    id: 'fup',
    label: 'FUP / FBD',
    icon: '🔳',
    blurb: 'Funktionsplan: Boxen, Signalfluss, Speicher und Timer',
    codeLang: 'text',
    runnable: false,
  },
  kop: {
    id: 'kop',
    label: 'KOP / LD',
    icon: '🪧',
    blurb: 'Kontaktplan: Strompfade, Kontakte, Spulen, Vergleicher',
    codeLang: 'text',
    runnable: false,
  },
}

export const trackList = TRACK_IDS.map((id) => TRACKS[id])

export const isTrackId = (value: string | undefined): value is TrackId =>
  !!value && (TRACK_IDS as readonly string[]).includes(value)
