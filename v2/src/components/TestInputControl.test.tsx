import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestInputControl } from './TestInputControl'

describe('TestInputControl', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders categorical TSI options from the biochemical registry', () => {
    render(<TestInputControl testId="tsi" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /set TSI Slant\/Butt to A\/A \(gas\+\)/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /set TSI Slant\/Butt to K\/A H₂S/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^set TSI Slant\/Butt to K\/N$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^set TSI Slant\/Butt to K\/NC$/i })).toBeTruthy()
  })

  it('renders rapid urease options from the biochemical registry', () => {
    render(<TestInputControl testId="urease" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /set Urease to \+\+ \(rapid\)/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^set Urease to \+$/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /set Urease to −/i })).toBeTruthy()
  })

  it('renders hemolysis alpha, beta, and gamma categorical options', () => {
    render(<TestInputControl testId="hemolysis" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /set Hemolysis to β \(complete\)/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /set Hemolysis to α \(partial\/green\)/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /set Hemolysis to γ \(none\)/i })).toBeTruthy()
  })

  it('renders susceptibility tests as S/R options', () => {
    render(<TestInputControl testId="novobiocin" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: /set Novobiocin to S \(sensitive\)/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /set Novobiocin to R \(resistant\)/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^set Novobiocin to \+$/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /set Novobiocin to −/i })).toBeNull()
  })

  it('toggles selected values using registry option values', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TestInputControl testId="novobiocin" value="S (sensitive)" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /set Novobiocin to S \(sensitive\)/i }))
    expect(onChange).toHaveBeenCalledWith(null)

    await user.click(screen.getByRole('button', { name: /set Novobiocin to R \(resistant\)/i }))
    expect(onChange).toHaveBeenCalledWith('R (resistant)')
  })

  it('does not guess options when a registry entry is missing', () => {
    render(<TestInputControl testId="missing_test" onChange={() => {}} />)

    expect(screen.getByRole('status').textContent).toContain('Missing registry: missing_test')
  })
})
