import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { IdentifyPage } from '@/pages/IdentifyPage'
import { AboutPage } from '@/pages/AboutPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { SpeciesDetailPage } from '@/pages/SpeciesDetailPage'
import { SpecimenPage } from '@/pages/SpecimenPage'
import { TestsReferencePage } from '@/pages/TestsReferencePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<IdentifyPage />} />
          <Route path="specimen" element={<SpecimenPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="library/:speciesId" element={<SpeciesDetailPage />} />
          <Route path="reference" element={<TestsReferencePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
