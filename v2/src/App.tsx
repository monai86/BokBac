import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { Layout } from '@/components/Layout'
import { IdentifyPage } from '@/pages/IdentifyPage'
import { AboutPage } from '@/pages/AboutPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { SpeciesDetailPage } from '@/pages/SpeciesDetailPage'
import { SpecimenPage } from '@/pages/SpecimenPage'
import { TestsReferencePage } from '@/pages/TestsReferencePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { CasesPage } from '@/pages/CasesPage'
import { TestSuitesPage } from '@/pages/TestSuitesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<IdentifyPage />} />
            <Route path="specimen" element={<SpecimenPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/:speciesId" element={<SpeciesDetailPage />} />
            <Route path="reference" element={<TestsReferencePage />} />
            <Route path="suites" element={<TestSuitesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
