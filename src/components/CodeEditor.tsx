import CodeMirror from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { go } from '@codemirror/lang-go'
import { rust } from '@codemirror/lang-rust'
import { StreamLanguage } from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'
import { pascal } from '@codemirror/legacy-modes/mode/pascal'
import { simpleMode } from '@codemirror/legacy-modes/mode/simple-mode'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { Prec, type Extension } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { useMemo } from 'react'
import type { TrackId } from '../content/tracks'

/** Siemens AWL / IEC instruction list: operations, operands like E0.0 or DB1.DBX0.0, constants. */
const awl = simpleMode({
  start: [
    { regex: /\/\/.*/, token: 'comment' },
    { regex: /\(\*/, token: 'comment', next: 'comment' },
    { regex: /\b(?:UN|ON|XN|U|O|X|NOT|SET|CLR|SAVE|FP|FN|S|R|L|T|SPA|SPBNB|SPBN|SPB|CALL|UC|CC|BEA|BEB|BE|NOP|TAK|PUSH|POP|SI|SV|SE|SS|SA|ZV|ZR)\b/i, token: 'keyword' },
    { regex: /#[A-Za-z_]\w*|"[^"]*"/, token: 'variableName' },
    { regex: /\bDB\d+\.DB[XBWD]\s*\d+(?:\.\d+)?|\b[EIAQM][BWD]?\s*\d+(?:\.\d+)?|\b[TZC]\s*\d+\b/i, token: 'variableName.special' },
    { regex: /\b(?:TRUE|FALSE)\b/i, token: 'atom' },
    { regex: /\b(?:16#[0-9A-Fa-f]+|2#[01_]+|\w+#[\w.]+|\d+(?:\.\d+)?)\b/, token: 'number' },
    { regex: /[=()]/, token: 'operator' },
  ],
  comment: [
    { regex: /.*?\*\)/, token: 'comment', next: 'start' },
    { regex: /.*/, token: 'comment' },
  ],
  languageData: { commentTokens: { line: '//', block: { open: '(*', close: '*)' } } },
})

/** FUP and KOP are drawn as ASCII diagrams – highlighting them would only add noise. */
const MODES: Record<TrackId, (() => Extension) | null> = {
  java,
  python,
  typescript: () => javascript({ typescript: true }),
  go,
  rust,
  csharp: () => StreamLanguage.define(csharp),
  scl: () => StreamLanguage.define(pascal),
  awl: () => StreamLanguage.define(awl),
  fup: null,
  kop: null,
}

/** Go and Rust use tabs / 4 spaces, the rest of the tracks 4 or 2 spaces. */
const INDENT: Record<TrackId, string> = {
  java: '    ',
  python: '    ',
  typescript: '  ',
  go: '\t',
  rust: '    ',
  csharp: '    ',
  scl: '    ',
  awl: '      ',
  fup: '  ',
  kop: '  ',
}

interface Props {
  value: string
  language: TrackId
  onChange?: (value: string) => void
  onRun?: () => void
  readOnly?: boolean
  minHeight?: string
}

/**
 * Editor WITHOUT autocompletion – this is a handcoding trainer.
 * Cmd/Ctrl+Enter runs the code.
 */
export function CodeEditor({
  value,
  language,
  onChange,
  onRun,
  readOnly = false,
  minHeight = 'clamp(240px,45vh,420px)',
}: Props) {
  const extensions = useMemo(() => {
    const mode = MODES[language]
    return [
      ...(mode ? [mode()] : []),
      indentUnit.of(INDENT[language]),
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onRun?.()
              return true
            },
          },
        ]),
      ),
    ]
  }, [onRun, language])

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <CodeMirror
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        editable={!readOnly}
        theme={oneDark}
        extensions={extensions}
        minHeight={minHeight}
        basicSetup={{
          autocompletion: false,
          closeBrackets: true,
          highlightActiveLine: !readOnly,
          foldGutter: false,
          tabSize: 4,
        }}
      />
    </div>
  )
}
