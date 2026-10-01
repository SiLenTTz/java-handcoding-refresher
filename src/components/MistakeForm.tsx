import { useState } from 'react'
import { addMistake, MISTAKE_CATEGORIES, type MistakeCategory, type Mistake } from '../lib/progress'
import { trackById, type TrackId } from '../content'
import { Button } from './ui'

export function MistakeForm({
  track,
  chapterId,
  source = 'manual',
  prefill = '',
  onSaved,
}: {
  track: TrackId
  /** Chapter uid, e.g. `java/07`. Hides the chapter picker when set. */
  chapterId?: string
  source?: Mistake['source']
  prefill?: string
  onSaved?: () => void
}) {
  const chapters = trackById.get(track)!.chapters
  const [text, setText] = useState(prefill)
  const [category, setCategory] = useState<MistakeCategory>('API')
  const [chapter, setChapter] = useState(chapterId ?? chapters[0]?.uid ?? `${track}/01`)

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        addMistake({ chapterId: chapter, category, source, text: text.trim() })
        setText('')
        onSaved?.()
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Was lief falsch? Was ist die korrekte Denkweise?"
        rows={3}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {!chapterId && (
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
          >
            {chapters.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.id} {c.title}
              </option>
            ))}
          </select>
        )}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MistakeCategory)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
        >
          {MISTAKE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Button type="submit" variant="primary" disabled={!text.trim()}>
          Speichern
        </Button>
      </div>
    </form>
  )
}
