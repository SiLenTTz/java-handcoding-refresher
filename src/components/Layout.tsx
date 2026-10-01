import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { isTrackId, trackList, type TrackId } from '../content'
import { exportProgress, importProgress, setActiveTrack, useProgress } from '../lib/progress'
import { dueCards } from '../lib/stats'
import { streak, today } from '../lib/dates'

const NAV = [
  { to: '', label: 'Dashboard', icon: '🏠' },
  { to: 'review', label: 'Wiederholen', icon: '🧠' },
  { to: 'katas', label: 'Katas', icon: '⌨️' },
  { to: 'exam', label: 'Prüfung', icon: '🎓' },
  { to: 'mistakes', label: 'Fehlerlog', icon: '📓' },
  { to: 'playground', label: 'Playground', icon: '🧪' },
  { to: 'cheatsheets', label: 'Cheatsheets', icon: '📄' },
]

export function Layout() {
  const progress = useProgress()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const fileInput = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const track: TrackId = isTrackId(params.track) ? params.track : (progress.activeTrack as TrackId)
  const active = trackList.find((t) => t.id === track) ?? trackList[0]
  const dueCount = dueCards(progress, track).length
  const openMistakes = progress.mistakes.filter((m) => !m.resolved && m.chapterId.startsWith(`${track}/`)).length
  const days = streak(progress.activeDays)
  const base = `/t/${track}`

  useEffect(() => setMenuOpen(false), [location.pathname, location.search])

  useEffect(() => {
    if (isTrackId(params.track)) setActiveTrack(params.track)
  }, [params.track])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => void (document.body.style.overflow = '')
  }, [menuOpen])

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `handcoding-progress-${today()}.json`
    a.click()
  }

  const upload = async (file: File) => {
    try {
      importProgress(await file.text())
    } catch {
      alert('Datei konnte nicht gelesen werden.')
    }
  }

  return (
    <div className="flex min-h-screen">
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-4 pt-[max(1rem,env(safe-area-inset-top))] transition-transform lg:sticky lg:z-auto lg:w-60 lg:translate-x-0 lg:pt-4 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <NavLink to="/tracks" className="mb-4 flex items-center gap-2 px-2">
          <span className="text-2xl">⌨️</span>
          <div className="leading-tight">
            <div className="font-bold">Handcoding</div>
            <div className="text-xs text-zinc-500">Refresher</div>
          </div>
        </NavLink>

        <label className="mb-4 block px-1">
          <span className="sr-only">Sprache wählen</span>
          <select
            value={track}
            onChange={(e) => navigate(`/t/${e.target.value}`)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
          >
            {trackList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to ? `${base}/${n.to}` : base}
              end={n.to === ''}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition lg:py-2 ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`
              }
            >
              <span>{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.to === 'review' && dueCount > 0 && (
                <span className="rounded-full bg-orange-500 px-1.5 text-xs font-bold text-zinc-950">{dueCount}</span>
              )}
              {n.to === 'mistakes' && openMistakes > 0 && (
                <span className="rounded-full bg-zinc-700 px-1.5 text-xs">{openMistakes}</span>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/tracks"
            className={({ isActive }) =>
              `mt-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition lg:py-2 ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`
            }
          >
            <span>🌍</span>
            <span className="flex-1">Alle Sprachen</span>
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-lg border border-zinc-800 p-3 text-center">
            <div className="text-2xl">{days > 0 ? '🔥' : '💤'}</div>
            <div className="text-sm font-semibold">
              {days} Tag{days === 1 ? '' : 'e'} Streak
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={download} className="flex-1 rounded-md border border-zinc-800 py-2 text-zinc-400 hover:text-zinc-200">
              Export
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className="flex-1 rounded-md border border-zinc-800 py-2 text-zinc-400 hover:text-zinc-200"
            >
              Import
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/95 px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menü öffnen"
            className="rounded-lg px-3 py-2 text-xl text-zinc-300 hover:bg-zinc-900"
          >
            ☰
          </button>
          <NavLink to={base} className="flex min-w-0 items-center gap-2 font-bold">
            <span>{active.icon}</span>
            <span className="truncate">{active.label}</span>
          </NavLink>
          <div className="ml-auto flex items-center gap-2 pr-1 text-sm text-zinc-400">
            {dueCount > 0 && (
              <NavLink to={`${base}/review`} className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-zinc-950">
                {dueCount} fällig
              </NavLink>
            )}
            <span className="whitespace-nowrap">
              {days > 0 ? '🔥' : '💤'} {days}
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
