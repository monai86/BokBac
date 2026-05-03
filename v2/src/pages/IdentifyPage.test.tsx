import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useIdentifyStore } from '@/store/identifyStore'
import { IdentifyPage } from './IdentifyPage'

describe('IdentifyPage reset flow', () => {
  beforeEach(() => {
    useIdentifyStore.setState({
      group: 'enterobacterales',
      answers: {},
      results: [],
      savedCases: [],
    })
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps ranked results visible after users reset their answers', async () => {
    const user = userEvent.setup()
    render(<IdentifyPage />)

    await waitFor(() => {
      expect(screen.queryByText('กำลังคำนวณ…')).toBeNull()
    })

    expect(screen.getAllByText('Escherichia coli').length).toBeGreaterThan(0)
    expect(screen.getByText('Why this result is leading')).toBeTruthy()
    expect(screen.getByText(/prevalence priors/i)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /set oxidase to \+/i }))
    expect(screen.getByText(/1 answer considered/i)).toBeTruthy()
    expect(screen.getByText('Test-by-test evidence')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(screen.queryByText('กำลังคำนวณ…')).toBeNull()
    expect(screen.getAllByText('Escherichia coli').length).toBeGreaterThan(0)
    expect(screen.getByText('Why this result is leading')).toBeTruthy()
    expect(screen.getByText(/prevalence priors/i)).toBeTruthy()
  })

  it('saves, reloads, and deletes a local case from the workflow', async () => {
    const user = userEvent.setup()
    render(<IdentifyPage />)

    await waitFor(() => {
      expect(screen.queryByText('กำลังคำนวณ…')).toBeNull()
    })

    await user.click(screen.getByRole('button', { name: /set oxidase to \+/i }))
    await user.click(screen.getByRole('button', { name: /save current identification case/i }))

    expect(screen.getByRole('button', { name: /load saved case/i })).toBeTruthy()

    const titleInput = screen.getByLabelText('Case title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Teaching oxidase case')

    const tagsInput = screen.getByPlaceholderText(/tags:/i)
    await user.type(tagsInput, 'teaching, qc')

    await user.type(screen.getByPlaceholderText(/search cases/i), 'teaching')
    expect(screen.getByDisplayValue('Teaching oxidase case')).toBeTruthy()
    expect(screen.getByRole('link', { name: /export json/i })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(useIdentifyStore.getState().answers).toEqual({})

    await user.click(screen.getByRole('button', { name: /load saved case/i }))
    expect(useIdentifyStore.getState().answers).toEqual({ Oxidase: '+' })

    await user.click(screen.getByRole('button', { name: /delete saved case/i }))
    expect(screen.getByText('No saved cases yet.')).toBeTruthy()
  })
})
