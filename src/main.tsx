import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
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
import { ScrollToTop } from './components/ScrollToTop'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
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
      </Routes>
    </HashRouter>
  </StrictMode>,
)
