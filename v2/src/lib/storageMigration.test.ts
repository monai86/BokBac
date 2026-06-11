import { describe, it, expect, beforeEach } from 'vitest'
import { migrateLocalStorage } from './storageMigration'

describe('localStorage migration helper', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('correctly migrates all legacy keys to new keys when new keys do not exist', () => {
    // 1. Set old legacy values
    window.localStorage.setItem('microbial-world:v4:guest-mode', 'true')
    window.localStorage.setItem('microbial-world:v4:saved-cases', '[{"id":"case-1"}]')
    window.localStorage.setItem('microbial-world:v4:custom-suites', '[]')
    window.localStorage.setItem('microbial-world:v4:active-suite-id', 'test_suite')
    window.localStorage.setItem('mbsettings', '{"autoSave":true}')

    // Verify new keys are currently empty
    expect(window.localStorage.getItem('bokbac:v4:guest-mode')).toBeNull()
    expect(window.localStorage.getItem('bokbac:v4:saved-cases')).toBeNull()
    expect(window.localStorage.getItem('bokbac:v4:custom-suites')).toBeNull()
    expect(window.localStorage.getItem('bokbac:v4:active-suite-id')).toBeNull()
    expect(window.localStorage.getItem('bokbac:v4:settings')).toBeNull()

    // 2. Run migration
    migrateLocalStorage()

    // 3. Verify new keys contain the old values
    expect(window.localStorage.getItem('bokbac:v4:guest-mode')).toBe('true')
    expect(window.localStorage.getItem('bokbac:v4:saved-cases')).toBe('[{"id":"case-1"}]')
    expect(window.localStorage.getItem('bokbac:v4:custom-suites')).toBe('[]')
    expect(window.localStorage.getItem('bokbac:v4:active-suite-id')).toBe('test_suite')
    expect(window.localStorage.getItem('bokbac:v4:settings')).toBe('{"autoSave":true}')
  })

  it('does not overwrite existing new keys with old keys', () => {
    // 1. Set both old and new values, with different content
    window.localStorage.setItem('microbial-world:v4:guest-mode', 'false')
    window.localStorage.setItem('bokbac:v4:guest-mode', 'true')

    window.localStorage.setItem('mbsettings', '{"autoSave":false}')
    window.localStorage.setItem('bokbac:v4:settings', '{"autoSave":true}')

    // 2. Run migration
    migrateLocalStorage()

    // 3. Verify new values were not overwritten
    expect(window.localStorage.getItem('bokbac:v4:guest-mode')).toBe('true')
    expect(window.localStorage.getItem('bokbac:v4:settings')).toBe('{"autoSave":true}')
  })
})
