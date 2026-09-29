import { NavLink, Outlet } from 'react-router-dom'
import { useRef } from 'react'
import { allFlashcards } from '../content'
import { exportProgress, importProgress, isDue, useProgress } from '../lib/progress'
import { streak, today } from '../lib/dates'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/review', label: 'Wiederholen', icon: '🧠' },
  { to: '/katas', label: 'Katas', icon: '⌨️' },
  { to: '/exam', label: 'Prüfung', icon: '🎓' },
  { to: '/mistakes', label: 'Fehlerlog', icon: '📓' },
  { to: '/playground', label: 'Playground', icon: '🧪' },
  { to: '/cheatsheets', label: 'Cheatsheets', icon: '📄' },
]

export function Layout() {
  const progress = useProgress()
  const fileInput = useRef<HTMLInputElement>(null)
  const dueCount = allFlashcards.filter((c) => progress.cards[c.key] && isDue(progress.cards[c.key])).length
  const openMistakes = progress.mistakes.filter((m) => !m.resolved).length
  const days = streak(progress.activeDays)

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `java-refresher-progress-${today()}.json`
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
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
        <NavLink to="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="text-2xl">☕</span>
          <div className="leading-tight">
            <div className="font-bold">Java Refresher</div>
            <div className="text-xs text-zinc-500">Handcoding Trainer</div>
          </div>
        </NavLink>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`
              }
            >
              <span>{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.to === '/review' && dueCount > 0 && (
                <span className="rounded-full bg-orange-500 px-1.5 text-xs font-bold text-zinc-950">{dueCount}</span>
              )}
              {n.to === '/mistakes' && openMistakes > 0 && (
                <span className="rounded-full bg-zinc-700 px-1.5 text-xs">{openMistakes}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="rounded-lg border border-zinc-800 p-3 text-center">
            <div className="text-2xl">{days > 0 ? '🔥' : '💤'}</div>
            <div className="text-sm font-semibold">{days} Tag{days === 1 ? '' : 'e'} Streak</div>
          </div>
          <div className="flex gap-2 text-xs">
            <button onClick={download} className="flex-1 rounded-md border border-zinc-800 py-1.5 text-zinc-400 hover:text-zinc-200">
              Export
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className="flex-1 rounded-md border border-zinc-800 py-1.5 text-zinc-400 hover:text-zinc-200"
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
      <main className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
