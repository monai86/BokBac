import { useState, useEffect } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth'
import { isFirebaseActive } from '@/auth/firebase'

export function SettingsPage() {
  const user = useIdentifyStore((s) => s.user)
  const settings = useIdentifyStore((s) => s.settings)
  const saveSettings = useIdentifyStore((s) => s.saveSettings)

  const [displayName, setDisplayName] = useState(settings.displayName || '')
  const [defaultGram, setDefaultGram] = useState(settings.defaultGram || '')
  const [autoSave, setAutoSave] = useState(settings.autoSave !== false)
  const [gateMode, setGateMode] = useState(settings.gateMode || 'hybrid')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Password changing
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmNewPwd, setConfirmNewPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)

  useEffect(() => {
    setDisplayName(settings.displayName || user?.displayName || '')
    setDefaultGram(settings.defaultGram || '')
    setAutoSave(settings.autoSave !== false)
    setGateMode(settings.gateMode || 'hybrid')
  }, [settings, user])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    // Update Firebase user profile if display name changed
    if (user && displayName.trim() !== (settings.displayName || user.displayName)) {
      try {
        await updateProfile(user, { displayName: displayName.trim() })
        await user.reload()
      } catch (e) {
        console.error('Error updating display name:', e)
      }
    }

    await saveSettings({
      ...settings,
      displayName: displayName.trim(),
      defaultGram,
      autoSave,
      gateMode,
    })
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleReset = async () => {
    setDisplayName(user?.displayName || '')
    setDefaultGram('')
    setAutoSave(true)
    setGateMode('hybrid')
    setSaveSuccess(false)
    
    await saveSettings({
      displayName: user?.displayName || '',
      defaultGram: '',
      autoSave: true,
      gateMode: 'hybrid',
    })
    alert('รีเซ็ตการตั้งค่าเรียบร้อยแล้ว')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')

    if (!user || !user.email) return

    if (!currentPwd || !newPwd || !confirmNewPwd) {
      setPwdError('กรุณากรอกรหัสผ่านให้ครบทุกช่อง')
      return
    }
    if (newPwd !== confirmNewPwd) {
      setPwdError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }
    if (newPwd.length < 6) {
      setPwdError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setChangingPwd(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPwd)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPwd)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmNewPwd('')
      setShowPasswordForm(false)
      setPwdSuccess('เปลี่ยนรหัสผ่านเสร็จสมบูรณ์เรียบร้อยแล้ว')
      setTimeout(() => setPwdSuccess(''), 4000)
    } catch (error: any) {
      console.error('Password change error:', error)
      if (error.code === 'auth/wrong-password') {
        setPwdError('รหัสผ่านปัจจุบันไม่ถูกต้อง')
      } else if (error.code === 'auth/weak-password') {
        setPwdError('รหัสผ่านใหม่อ่อนเกินไป')
      } else {
        setPwdError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน: ' + error.message)
      }
    } finally {
      setChangingPwd(false)
    }
  }

  // Determine auth provider (Google vs Email)
  const isGoogleUser = user?.providerData?.some((p: any) => p.providerId === 'google.com')

  const displayUserName = displayName.trim() || user?.displayName || 'Guest User'
  const modeLabel = user ? 'Cloud Sync' : 'Guest Mode'

  return (
    <div className="settings-page workspace-page space-y-6">
      {/* Page Header */}
      <header className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          ⚙️ ตั้งค่า
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-zinc-500">
          {user ? '☁️ CLOUD SYNC' : isFirebaseActive ? '💾 LOCAL STORAGE' : '💾 LOCAL STORAGE (Cloud Sync ไม่พร้อมใช้งาน)'}
        </p>
      </header>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          ✅ บันทึกการตั้งค่าเสร็จสมบูรณ์แล้ว
        </div>
      )}

      {pwdSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          ✅ {pwdSuccess}
        </div>
      )}

      {/* Profile & Synced Data settings */}
      <section className="settings-card lg-surface p-7">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <div className="lg-content space-y-6">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-violet-500 text-3xl font-black text-white shadow-[0_0_28px_rgba(139,92,246,0.28)]">
              {user ? '✓' : '?'}
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-100">{displayUserName}</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500">{modeLabel}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">ชื่อแสดงผล (Display Name)</label>
              <input
                type="text"
                placeholder="ชื่อของคุณ"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">อีเมล (Email)</label>
              <input
                type="text"
                disabled
                value={user?.email || 'Guest User (ไม่มีการเชื่อมโยงอีเมล)'}
                className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-500 select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Settings */}
      <section className="settings-card lg-surface p-7">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <div className="lg-content space-y-4">
          <h2 className="text-lg font-black text-zinc-100">การตั้งค่าการใช้งาน</h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">ค่าเริ่มต้น Gram Stain</label>
              <select
                value={defaultGram}
                onChange={(e) => setDefaultGram(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">-- เลือกค่าเริ่มต้น --</option>
                <option value="positive">Gram-positive (คัดกรองเฉพาะแบคทีเรียย้อมติดสีม่วง)</option>
                <option value="negative">Gram-negative (คัดกรองเฉพาะแบคทีเรียย้อมติดสีแดง/ชมพู)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4">
              <div>
                <label className="block text-sm font-black text-zinc-100">บันทึกอัตโนมัติ (Auto-save)</label>
                <span className="text-xs text-zinc-500">บันทึกข้อมูล case โดยอัตโนมัติเมื่อกดวิเคราะห์</span>
              </div>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="h-6 w-6 cursor-pointer accent-emerald-400"
              />
            </div>

            <details className="settings-advanced rounded-xl border border-white/5 bg-white/[0.015] p-4">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                Advanced Gate Mode
              </summary>
              <div className="mt-3 space-y-1">
                <label className="text-xs font-semibold text-zinc-400">โหมดคัดกรอง Gram & Morphology (Gate Mode)</label>
                <select
                  value={gateMode}
                  onChange={(e) => setGateMode(e.target.value as 'strict' | 'hybrid' | 'exploratory')}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="strict">strictTeaching (คัดกรองกลุ่มเคร่งครัด แยกกลุ่มแบบหักดิบ)</option>
                  <option value="hybrid">softClinical (เตือนเมื่อสิ่งส่งตรวจขัดแย้ง แต่ยังจัดอันดับให้)</option>
                  <option value="exploratory">exploratory (ค้นหาข้ามประเภทได้แบบอิสระ เหมาะกับการวิเคราะห์แบบยืดหยุ่น)</option>
                </select>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <div className="settings-actions flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleReset}
          className="settings-reset rounded-xl border border-white/10 px-6 py-4 text-sm font-black text-zinc-300 transition hover:bg-white/5"
        >
          รีเซ็ตค่าเริ่มต้น
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="settings-save rounded-xl bg-gradient-to-r from-violet-500 to-violet-300 px-8 py-4 text-sm font-black text-white shadow-[0_12px_36px_rgba(139,92,246,0.24)] transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
        </button>
      </div>

      {/* Password management for email accounts */}
      {user && !isGoogleUser && (
        <section className="lg-surface p-5 space-y-4">
          <div className="lg-specular" />
          <div className="lg-caustic" />
          <div className="lg-content space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">ความปลอดภัย</h2>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(!showPasswordForm); setPwdError(''); }}
                className="text-xs text-violet-400 hover:underline"
              >
                {showPasswordForm ? 'ซ่อนแบบฟอร์ม' : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </div>

            {pwdError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                {pwdError}
              </div>
            )}

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    required
                    placeholder="รหัสผ่านใหม่ อย่างน้อย 6 ตัวอักษร"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    required
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                    value={confirmNewPwd}
                    onChange={(e) => setConfirmNewPwd(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPwd}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 transition disabled:opacity-50"
                >
                  {changingPwd ? 'กำลังดำเนินการ...' : 'อัปเดตรหัสผ่านใหม่'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
