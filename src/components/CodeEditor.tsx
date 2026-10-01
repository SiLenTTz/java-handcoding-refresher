import CodeMirror from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { go } from '@codemirror/lang-go'
import { rust } from '@codemirror/lang-rust'
import { StreamLanguage } from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { Prec, type Extension } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { useMemo } from 'react'
import type { TrackId } from '../content/tracks'

const MODES: Record<TrackId, () => Extension> = {
  java,
  python,
  typescript: () => javascript({ typescript: true }),
  go,
  rust,
  csharp: () => StreamLanguage.define(csharp),
}

/** Go and Rust use tabs / 4 spaces, the rest of the tracks 4 or 2 spaces. */
const INDENT: Record<TrackId, string> = {
  java: '    ',
  python: '    ',
  typescript: '  ',
  go: '\t',
  rust: '    ',
  csharp: '    ',
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
  const extensions = useMemo(
    () => [
      MODES[language](),
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
    ],
    [onRun, language],
  )

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
