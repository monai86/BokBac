import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SpeciesDetailPage } from './SpeciesDetailPage'

describe('SpeciesDetailPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders detailed clinical and biochemical information for a species', () => {
    render(
      <MemoryRouter initialEntries={['/library/s_aureus']}>
        <Routes>
          <Route path="/library/:speciesId" element={<SpeciesDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Staphylococcus aureus' })).toBeTruthy()
    expect(screen.getByText(/skin infections/i)).toBeTruthy()
    expect(screen.getByText('Biochemical Profile')).toBeTruthy()
    expect(screen.getByText('Coagulase')).toBeTruthy()
    expect(screen.getByText(/golden-yellow/i)).toBeTruthy()
  })
})
