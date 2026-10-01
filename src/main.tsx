import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { ChapterPage } from './pages/ChapterPage'
import { KataPage } from './pages/KataPage'
import { KatasPage } from './pages/KatasPage'
import { ReviewPage } from './pages/ReviewPage'
import { ExamPage } from './pages/ExamPage'
import { MistakesPage } from './pages/MistakesPage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import { CheatsheetsPage } from './pages/CheatsheetsPage'
import { TracksPage } from './pages/TracksPage'
import { ScrollToTop } from './components/ScrollToTop'
import { loadProgress } from './lib/progress'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to={`/t/${loadProgress().activeTrack}`} replace />} />
          <Route path="tracks" element={<TracksPage />} />
          <Route path="t/:track">
            <Route index element={<Dashboard />} />
            <Route path="chapter/:id" element={<ChapterPage />} />
            <Route path="kata/:chapterId/:kataId" element={<KataPage />} />
            <Route path="katas" element={<KatasPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="mistakes" element={<MistakesPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="cheatsheets" element={<CheatsheetsPage />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
