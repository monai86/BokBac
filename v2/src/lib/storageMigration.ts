/**
 * LocalStorage Migration Utility
 * Copies legacy 'microbial-world:v4:*' and 'mbsettings' keys to new 'bokbac:v4:*'
 * key patterns, ensuring backward compatibility for local/guest users.
 */

export function migrateLocalStorage() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return
  }

  const migrationPairs = [
    { oldKey: 'microbial-world:v4:guest-mode', newKey: 'bokbac:v4:guest-mode' },
    { oldKey: 'microbial-world:v4:saved-cases', newKey: 'bokbac:v4:saved-cases' },
    { oldKey: 'microbial-world:v4:custom-suites', newKey: 'bokbac:v4:custom-suites' },
    { oldKey: 'microbial-world:v4:active-suite-id', newKey: 'bokbac:v4:active-suite-id' },
    { oldKey: 'mbsettings', newKey: 'bokbac:v4:settings' },
  ]

  for (const { oldKey, newKey } of migrationPairs) {
    try {
      const oldValue = window.localStorage.getItem(oldKey)
      if (oldValue !== null) {
        const newValue = window.localStorage.getItem(newKey)
        // Only migrate if the new key doesn't have data already.
        if (newValue === null) {
          window.localStorage.setItem(newKey, oldValue)
        }
      }
    } catch (e) {
      console.warn(`[Storage Migration] Failed to migrate ${oldKey} to ${newKey}:`, e)
    }
  }
}
