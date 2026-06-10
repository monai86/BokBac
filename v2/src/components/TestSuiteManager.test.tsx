import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useIdentifyStore } from '@/store/identifyStore'
import { TestSuiteManager } from './TestSuiteManager'

describe('TestSuiteManager import validation', () => {
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
  })

  it('shows an inline validation report for invalid suite JSON', async () => {
    const user = userEvent.setup()
    render(<TestSuiteManager />)

    const file = new File(['{ not json'], 'broken-suite.json', { type: 'application/json' })
    const input = screen.getByLabelText(/นำเข้า/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/ไม่สามารถอ่านไฟล์ JSON ได้/i)).toBeTruthy()
    })
    expect(useIdentifyStore.getState().customSuites).toEqual([])
  })

  it('reports missing or invalid test IDs without crashing or importing', async () => {
    const user = userEvent.setup()
    render(<TestSuiteManager />)

    const suite = {
      id: 'custom_bad_import',
      name: 'Bad Import Suite',
      group: 'enterobacterales',
      tests: [{ testId: 'not_a_real_test', required: true, order: 1 }],
    }
    const file = new File([JSON.stringify(suite)], 'bad-import-suite.json', {
      type: 'application/json',
    })
    const input = screen.getByLabelText(/นำเข้า/i)
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/not_a_real_test/i)).toBeTruthy()
    })
    expect(screen.getByText(/Test ID ที่ไม่มีในระบบ/i)).toBeTruthy()
    expect(useIdentifyStore.getState().customSuites).toEqual([])
  })
})
