import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'

const SUITE_TABS = [
  { id: 'gpc_cluster', label: 'GPC Cluster', icon: '🧫' },
  { id: 'gpc_chain', label: 'GPC Chain', icon: '🦠' },
  { id: 'gpb', label: 'GP Bacilli', icon: '🧪' },
  { id: 'enterobacterales', label: 'Enterobacterales', icon: '🦠' },
  { id: 'vibrio_aeromonas', label: 'Vibrio / Aeromonas', icon: '💧' },
  { id: 'nfb', label: 'Non-Fermentative', icon: '⚡' },
  { id: 'gn_coccobacilli', label: 'GN Coccobacilli', icon: '🔬' },
]

export function TestSuitesPage() {
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites) || []
  const customSuites = useIdentifyStore((s) => s.customSuites) || []
  const [group, setGroup] = useState(SUITE_TABS[0].id)

  const allSuites = [...defaultSuites, ...customSuites]
  const suite = allSuites.find((item) => item.group === group) || allSuites[0]
  const selectedTab = SUITE_TABS.find((tab) => tab.id === group)

  return (
    <div className="suite-page suite-page-compact">
      <header className="lg-surface suite-header suite-header-compact">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <div className="lg-content">
          <div className="suite-header-title">
            <div>
              <p>Reference</p>
              <h1>Test Suite Reference</h1>
            </div>
            <span>{allSuites.length} suites</span>
          </div>

          <div className="suite-tab-grid" role="tablist" aria-label="Test suite groups">
            {SUITE_TABS.map((tab) => {
              const active = tab.id === group
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setGroup(tab.id)}
                  className={`suite-tab-button ${active ? 'active' : ''}`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {suite && (
        <>
          <section className="lg-surface suite-summary suite-summary-compact">
            <div className="lg-specular" />
            <div className="lg-caustic" />
            <div className="lg-content suite-summary-content">
              <div className="suite-summary-mark">
                {selectedTab?.icon || '🧪'}
              </div>
              <div>
                <h2>{suite.name}</h2>
                <p>{suite.description || suite.group}</p>
              </div>
              <span className="suite-count-pill">{suite.tests.length} tests</span>
            </div>
          </section>

          <section className="suite-table suite-table-compact overflow-hidden">
            <div className="suite-table-row suite-table-head">
              <span>No.</span>
              <span>Test name</span>
              <span>Options</span>
            </div>
            <div className="divide-y divide-white/[0.07]">
              {suite.tests.map((item, index) => {
                const def = lookupTestDefinition(item.testId)
                const options = def?.options || ['+', '−']
                return (
                  <article
                    key={`${item.testId}-${index}`}
                    className="suite-table-row suite-test-row"
                  >
                    <div>
                      <span className="suite-test-number">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3>{def?.label || item.testId}</h3>
                      <p>{item.testId}</p>
                    </div>
                    <div className="suite-options">
                      {options.map((option) => (
                        <span
                          key={option}
                          className="suite-option-pill"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
