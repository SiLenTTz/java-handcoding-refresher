import { useState } from 'react'
import { cheatsheets } from '../content'
import { Markdown } from '../components/Markdown'
import { Button } from '../components/ui'

export function CheatsheetsPage() {
  const [active, setActive] = useState(cheatsheets.find((c) => c.slug.includes('master'))?.slug ?? cheatsheets[0]?.slug)
  const sheet = cheatsheets.find((c) => c.slug === active)
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {cheatsheets.map((c) => (
          <Button key={c.slug} variant={c.slug === active ? 'primary' : 'secondary'} onClick={() => setActive(c.slug)}>
            {c.title}
          </Button>
        ))}
      </div>
      {sheet && <Markdown>{sheet.markdown}</Markdown>}
    </div>
  )
}
