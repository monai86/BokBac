import { SavedCasesPanel } from '@/components/SavedCasesPanel'
import { useIdentifyStore } from '@/store/identifyStore'

export function CasesPage() {
  const user = useIdentifyStore((s) => s.user)
  const savedCases = useIdentifyStore((s) => s.savedCases)

  return (
    <div className="workspace-page max-w-7xl">
      <header className="case-page-header">
        <div>
          <h1>Case ที่บันทึกไว้</h1>
          <p>{user ? 'Cloud Sync Active' : 'Guest Mode, Local Save Active'}</p>
        </div>
        <strong>ทั้งหมด {savedCases.length} เคส</strong>
      </header>
      <SavedCasesPanel standalone />
    </div>
  )
}
