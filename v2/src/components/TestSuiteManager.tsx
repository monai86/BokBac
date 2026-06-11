import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { BIOCHEMICAL_TEST_REGISTRY } from '@/data/tests/biochemicalTestRegistry'
import { getSuiteTestDisplay, normalizeTestKeyToId } from '@/lib/suiteCatalog'
import type { TestSuite, TestSuiteItem } from '@/lib/types'
import { calculateSuiteDiagnosticPower } from '@/data/tests/essentialTests'

export function TestSuiteManager() {
  const group = useIdentifyStore((s) => s.group)
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites) || []
  const customSuites = useIdentifyStore((s) => s.customSuites) || []
  const setCustomSuites = useIdentifyStore((s) => s.setCustomSuites)
  const activeSuiteId = useIdentifyStore((s) => s.activeSuiteId)
  const setActiveSuiteId = useIdentifyStore((s) => s.setActiveSuiteId)

  // Find the active suite
  const allSuites = [...defaultSuites, ...customSuites]
  const currentSuite = allSuites.find((s) => s.id === activeSuiteId) || allSuites.find((s) => s.group === group)

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedDesc, setEditedDesc] = useState('')
  const [editedTests, setEditedTests] = useState<TestSuiteItem[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [importReport, setImportReport] = useState<{ type: 'error' | 'success', message: string } | null>(null)

  if (!currentSuite) return null

  const isSystemSuite = currentSuite.owner === 'system'
  const power = calculateSuiteDiagnosticPower(group, currentSuite.tests.map((t) => t.testId))
  const editedPower = calculateSuiteDiagnosticPower(group, editedTests.map((t) => t.testId))

  // Duplicate system suite
  const handleDuplicate = () => {
    const newSuite: TestSuite = {
      id: `custom_${currentSuite.group}_${Date.now()}`,
      name: `${currentSuite.name} (Custom)`,
      description: currentSuite.description || '',
      owner: 'user',
      group: currentSuite.group,
      tests: [...currentSuite.tests],
    }

    const nextCustoms = [...customSuites, newSuite]
    setCustomSuites(nextCustoms)
    setActiveSuiteId(newSuite.id)
    startEditing(newSuite)
  }

  const startEditing = (suite: TestSuite) => {
    setEditedName(suite.name)
    setEditedDesc(suite.description || '')
    setEditedTests([...suite.tests].sort((a, b) => a.order - b.order))
    setValidationError(null)
    setIsEditing(true)
  }

  // Save edits
  const handleSave = () => {
    if (!editedName.trim()) {
      setValidationError('กรุณากรอกชื่อ Test Suite')
      return
    }

    const updated: TestSuite = {
      ...currentSuite,
      name: editedName,
      description: editedDesc,
      tests: editedTests.map((t, idx) => ({ ...t, order: idx + 1 })),
    }

    const nextCustoms = customSuites.map((s) => (s.id === currentSuite.id ? updated : s))
    setCustomSuites(nextCustoms)
    setIsEditing(false)
    setValidationError(null)
  }

  // Delete suite
  const handleDelete = () => {
    const nextCustoms = customSuites.filter((s) => s.id !== currentSuite.id)
    setCustomSuites(nextCustoms)
    // Fallback to default suite for this group
    const defSuite = defaultSuites.find((s) => s.group === group)
    if (defSuite) {
      setActiveSuiteId(defSuite.id)
    }
    setIsEditing(false)
  }

  // Test item actions in editor
  const handleToggleRequired = (testId: string) => {
    setEditedTests(
      editedTests.map((t) => (t.testId === testId ? { ...t, required: !t.required } : t))
    )
  }

  const handleRemoveTest = (testId: string) => {
    setEditedTests(editedTests.filter((t) => t.testId !== testId))
  }

  const handleAddTest = (testId: string) => {
    if (editedTests.some((t) => t.testId === testId)) return
    const newItem: TestSuiteItem = {
      testId,
      required: false,
      order: editedTests.length + 1,
    }
    setEditedTests([...editedTests, newItem])
  }

  const moveTest = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= editedTests.length) return
    const updated = [...editedTests]
    const temp = updated[index]
    updated[index] = updated[nextIndex]
    updated[nextIndex] = temp
    setEditedTests(updated)
  }

  // Export JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSuite, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${currentSuite.id}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportReport(null)
    const fileReader = new FileReader()
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8')
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as TestSuite
          if (!parsed.id || !parsed.name || !Array.isArray(parsed.tests)) {
            setImportReport({ type: 'error', message: 'ไฟล์ JSON ไม่ถูกต้อง ขาดฟิลด์สำคัญ (id, name, tests)' })
            return
          }
          const normalizedTests = parsed.tests.map((item, index) => {
            const legacyLikeItem = item as TestSuiteItem & { id?: string; label?: string; options?: string[] }
            const rawId = legacyLikeItem.testId || legacyLikeItem.id || ''
            const testId = normalizeTestKeyToId(rawId)
            const definition = BIOCHEMICAL_TEST_REGISTRY.find((reg) => reg.id === testId)
            return {
              testId,
              required: item.required,
              order: item.order || index + 1,
              weightOverride: item.weightOverride,
              note: item.note,
              labelOverride: item.labelOverride || (legacyLikeItem.label && legacyLikeItem.label !== definition?.label ? legacyLikeItem.label : undefined),
              optionsOverride: item.optionsOverride || legacyLikeItem.options,
            }
          })

          // Validate tests in imported suite
          const invalidTests = normalizedTests.filter((t) => !BIOCHEMICAL_TEST_REGISTRY.some((reg) => reg.id === t.testId))
          if (invalidTests.length > 0) {
            setImportReport({ type: 'error', message: `พบ ${invalidTests.length} Test ID ที่ไม่มีในระบบ: ${invalidTests.map(t => t.testId).join(', ')}` })
            return
          }
          parsed.owner = 'user' // Mark as custom
          parsed.tests = normalizedTests
          const nextCustoms = [...customSuites.filter((s) => s.id !== parsed.id), parsed]
          setCustomSuites(nextCustoms)
          setActiveSuiteId(parsed.id)
          setImportReport({ type: 'success', message: `นำเข้า Suite '${parsed.name}' สำเร็จ (${parsed.tests.length} tests)` })
        } catch {
          setImportReport({ type: 'error', message: 'ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบรูปแบบไฟล์' })
        }
      }
    }
  }

  // Available tests to add
  const availableToSelect = BIOCHEMICAL_TEST_REGISTRY.filter(
    (reg) => !editedTests.some((t) => t.testId === reg.id)
  )

  return (
    <div className="backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-xl p-5 shadow-xl transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>📊</span> จัดการ Test Suite คลาสแล็บ (Biochemical Panels)
          </h2>
          <p className="text-xs text-zinc-400">
            ปรับแต่งชุดการทดสอบให้ตรงกับของแต่ละมหาวิทยาลัยหรือชั้นเรียน
          </p>
        </div>
        <div className="flex gap-2">
          {isSystemSuite ? (
            <button
              type="button"
              onClick={handleDuplicate}
              className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 text-xs font-semibold transition"
            >
              คัดลอกเพื่อแก้ไข (Duplicate)
            </button>
          ) : (
            <>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => startEditing(currentSuite)}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-1.5 text-xs font-semibold transition"
                >
                  แก้ไข Suite นี้
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-white/15 text-zinc-300 px-3 py-1.5 text-xs transition"
          >
            ส่งออก (Export JSON)
          </button>
          <label className="cursor-pointer rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-white/15 text-zinc-300 px-3 py-1.5 text-xs transition flex items-center">
            นำเข้า (Import JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importReport && (
        <div className={`mb-4 p-3 rounded-lg border text-xs leading-normal ${importReport.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
          <div className="flex justify-between items-start gap-2">
            <span>{importReport.type === 'error' ? '❌' : '✅'} {importReport.message}</span>
            <button type="button" onClick={() => setImportReport(null)} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Select suite dropdown */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-zinc-400 font-semibold uppercase">Suite ที่เลือกใช้งาน:</span>
        <select
          value={currentSuite.id}
          onChange={(e) => setActiveSuiteId(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:border-violet-500 focus:outline-none"
        >
          <optgroup label="Default System Suites">
            {defaultSuites
              .filter((s) => s.group === group)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (ระบบ)
                </option>
              ))}
          </optgroup>
          {customSuites.filter((s) => s.group === group).length > 0 && (
            <optgroup label="Custom Suites ของคุณ">
              {customSuites
                .filter((s) => s.group === group)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </optgroup>
          )}
        </select>
      </div>

      {isEditing ? (
        <div className="border border-violet-500/20 bg-violet-950/5 rounded-xl p-4">
          <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-1.5">
            <span className="text-violet-400">📝</span> กำลังแก้ไข: {currentSuite.name}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">ชื่อ Suite</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-zinc-950 p-2 text-xs text-zinc-200 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">คำอธิบาย</label>
              <input
                type="text"
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-zinc-950 p-2 text-xs text-zinc-200 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Live Diagnostic Power Score */}
          <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Suite Power (Realtime)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                editedPower.rating === 'excellent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                editedPower.rating === 'adequate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
              }`}>
                {editedPower.rating === 'excellent' ? 'ดีเยี่ยม' : editedPower.rating === 'adequate' ? 'พอใช้' : 'อ่อนแอ'} ({editedPower.score}/100)
              </span>
            </div>
            {editedPower.rating !== 'excellent' && (
              <div className="text-[10px] text-zinc-500 leading-normal space-y-1">
                {editedPower.missingPrimary.length > 0 && (
                  <p className="text-rose-300">
                    ⚠️ ขาดการทดสอบหลัก: <span className="font-semibold">{editedPower.missingPrimary.join(', ')}</span>
                  </p>
                )}
                {editedPower.missingCore.length > 0 && (
                  <p>
                    💡 แนะนำให้เพิ่ม: {editedPower.missingCore.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {validationError && (
            <p className="text-xs text-rose-400 mb-3 font-semibold">⚠️ {validationError}</p>
          )}

          {/* Test list editor */}
          <div className="mb-4">
            <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-2">รายการการทดสอบ ({editedTests.length} ตัว)</label>
            <div className="grid gap-1 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {editedTests.map((t, idx) => {
                const display = getSuiteTestDisplay(t)
                return (
                  <div
                    key={t.testId}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.02] border border-white/5 p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono w-4">{idx + 1}.</span>
                      <span className="font-medium text-zinc-200">{display.label}</span>
                      {t.required && (
                        <span className="text-[9px] font-bold text-rose-300 bg-rose-500/20 px-1 py-0.2 rounded">
                          จำเป็น (Gate)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRequired(t.testId)}
                        className={`px-2 py-0.5 rounded text-[10px] transition ${
                          t.required
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {t.required ? 'เลิกตั้งเป็น Gate' : 'ตั้งเป็น Gate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTest(idx, 'up')}
                        disabled={idx === 0}
                        className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTest(idx, 'down')}
                        disabled={idx === editedTests.length - 1}
                        className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(t.testId)}
                        className="text-rose-400 hover:text-rose-300 ml-1"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add test dropdown */}
          <div className="flex gap-2 items-center mb-4">
            <span className="text-xs text-zinc-400">เพิ่มการทดสอบ:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddTest(e.target.value)
                  e.target.value = ''
                }
              }}
              className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-300"
            >
              <option value="">-- เลือกการทดสอบ --</option>
              {availableToSelect.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              ลบ Test Suite นี้
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-3 py-1.5 text-xs transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-violet-600 text-white hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold transition"
              >
                บันทึก Suite
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4 text-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-zinc-200">
              {currentSuite.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              ผู้สร้าง: {isSystemSuite ? 'ระบบ' : 'ผู้ใช้ (Custom)'}
            </span>
          </div>
          <p className="text-zinc-400 mb-3 text-[11px] leading-relaxed">
            {currentSuite.description || 'ไม่มีคำอธิบาย'}
          </p>

          {/* Diagnostic Power Score */}
          <div className="mb-3 p-3 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">ประสิทธิภาพของชุดทดสอบ (Suite Power)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                power.rating === 'excellent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                power.rating === 'adequate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
              }`}>
                {power.rating === 'excellent' ? 'ดีเยี่ยม' : power.rating === 'adequate' ? 'พอใช้' : 'อ่อนแอ / ไม่เพียงพอ'} ({power.score}/100)
              </span>
            </div>
            
            {/* Warnings & Suggestions */}
            {power.rating !== 'excellent' && (
              <div className="text-[10px] text-zinc-400 leading-normal space-y-1">
                {power.missingPrimary.length > 0 && (
                  <p className="text-rose-300">
                    ⚠️ ขาดการทดสอบหลัก (Essential): <span className="font-semibold">{power.missingPrimary.join(', ')}</span>
                  </p>
                )}
                {power.missingCore.length > 0 && (
                  <p className="text-zinc-500">
                    💡 แนะนำให้เพิ่มการทดสอบเพิ่มความแม่นยำ: {power.missingCore.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
            {currentSuite.tests.map((t) => {
              const display = getSuiteTestDisplay(t)
              return (
                <span
                  key={t.testId}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium border ${
                    t.required
                      ? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
                      : 'border-white/5 bg-white/[0.02] text-zinc-400'
                  }`}
                >
                  {display.label} {t.required ? '(Gate)' : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
