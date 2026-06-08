import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LibraryPage } from './LibraryPage'

describe('LibraryPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('filters species by search query and links to detail pages', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Staphylococcus aureus')).toBeTruthy()

    await user.type(screen.getByPlaceholderText(/ค้นหาชื่อเชื้อ/i), 'pseudomonas')

    expect(screen.queryByText('Staphylococcus aureus')).toBeNull()
    const pseudomonas = screen.getByRole('link', { name: /pseudomonas aeruginosa/i })
    expect(pseudomonas.getAttribute('href')).toBe('/library/pseudomonas_aeruginosa')
  })

  it('filters by selected group', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /vibrionaceae/i }))

    expect(screen.getByText(/vibrio cholerae/i)).toBeTruthy()
    expect(screen.queryByText('Escherichia coli')).toBeNull()
  })
})
