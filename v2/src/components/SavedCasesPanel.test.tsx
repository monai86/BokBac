import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIdentifyStore } from '@/store/identifyStore'
import { SavedCasesPanel } from './SavedCasesPanel'
import type { SavedCase } from '@/lib/types'

function savedCase(overrides: Partial<SavedCase> = {}): SavedCase {
  return {
    id: 'saved-case-1',
    createdAt: new Date('2026-01-02T03:04:05Z').toISOString(),
    title: 'Saved E. coli case',
    tags: [],
    group: 'enterobacterales',
    answers: { indole: '+' },
    suiteId: 'enterobacterales_default',
    suiteName: 'Enterobacterales Suite',
    topSpecies: 'Escherichia coli',
    topPct: 62,
    ...overrides,
  }
}

describe('SavedCasesPanel', () => {
  beforeEach(() => {
    useIdentifyStore.setState({
      group: 'enterobacterales',
      answers: {},
      results: [],
      savedCases: [],
      customSuites: [],
      activeSuiteId: 'enterobacterales_default',
    })
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads a saved case with an existing suite without showing a warning', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    useIdentifyStore.setState({ savedCases: [savedCase()] })

    render(<SavedCasesPanel />)

    await user.click(screen.getByRole('button', { name: /load saved case escherichia coli/i }))

    expect(screen.queryByRole('alert')).toBeNull()
    expect(alertSpy).not.toHaveBeenCalled()
    expect(useIdentifyStore.getState().answers).toEqual({ indole: '+' })
    expect(useIdentifyStore.getState().activeSuiteId).toBe('enterobacterales_default')
  })

  it('shows an inline warning and still loads with fallback when a saved suite is missing', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    useIdentifyStore.setState({
      savedCases: [
        savedCase({
          suiteId: 'removed_teaching_suite',
          suiteName: 'Removed Teaching Suite',
        }),
      ],
    })

    render(<SavedCasesPanel />)

    await user.click(screen.getByRole('button', { name: /load saved case escherichia coli/i }))

    const warning = screen.getByRole('alert')
    expect(warning.textContent).toContain('Saved case suite is no longer available')
    expect(warning.textContent).toContain('Removed Teaching Suite')
    expect(warning.textContent).toContain('Enterobacterales Suite')
    expect(warning.textContent).toContain('Results may not be perfectly reproducible')
    expect(alertSpy).not.toHaveBeenCalled()
    expect(useIdentifyStore.getState().answers).toEqual({ indole: '+' })
    expect(useIdentifyStore.getState().activeSuiteId).toBe('enterobacterales_default')

    await user.click(screen.getByRole('button', { name: /dismiss missing suite warning/i }))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
