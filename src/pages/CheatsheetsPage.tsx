import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { cheatsheets, isTrackId, trackById, type TrackId } from '../content'
import { Markdown } from '../components/Markdown'
import { Button, Card, PageHeader } from '../components/ui'

export function CheatsheetsPage() {
  const { track = '' } = useParams()
  if (!isTrackId(track)) return <Navigate to="/tracks" replace />
  // Remount per track so the selected sheet always belongs to the current language.
  return <CheatsheetsView key={track} track={track} />
}

function CheatsheetsView({ track }: { track: TrackId }) {
  const trackData = trackById.get(track)!
  const sheets = cheatsheets.filter((c) => c.track === track)
  const [active, setActive] = useState(sheets.find((c) => c.slug.includes('master'))?.slug ?? sheets[0]?.slug)
  const sheet = sheets.find((c) => c.slug === active)

  if (sheets.length === 0) {
    return (
      <div>
        <PageHeader title={`${trackData.icon} Cheatsheets`} />
        <Card className="space-y-3 text-zinc-400">
          <p>Für {trackData.label} gibt es noch keine Cheatsheets.</p>
          <Link to="/tracks">
            <Button className="w-full sm:w-auto">🌍 Andere Sprache wählen</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {sheets.map((c) => (
          <Button key={c.slug} variant={c.slug === active ? 'primary' : 'secondary'} onClick={() => setActive(c.slug)}>
            {c.title}
          </Button>
        ))}
      </div>
      {sheet && <Markdown>{sheet.markdown}</Markdown>}
    </div>
  )
}
