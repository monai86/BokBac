import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { IdentifyPage } from '@/pages/IdentifyPage'
import { AboutPage } from '@/pages/AboutPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<IdentifyPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
