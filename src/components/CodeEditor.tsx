import CodeMirror from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { useMemo } from 'react'

interface Props {
  value: string
  onChange?: (value: string) => void
  onRun?: () => void
  readOnly?: boolean
  minHeight?: string
}

/**
 * Java editor WITHOUT autocompletion – this is a handcoding trainer.
 * Cmd/Ctrl+Enter runs the code.
 */
export function CodeEditor({ value, onChange, onRun, readOnly = false, minHeight = 'clamp(240px,45vh,420px)' }: Props) {
  const extensions = useMemo(
    () => [
      java(),
      indentUnit.of('    '),
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
    [onRun],
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
