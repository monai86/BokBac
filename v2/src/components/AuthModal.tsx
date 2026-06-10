import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { isFirebaseActive, auth } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

export function AuthModal() {
  const loginWithEmail = useIdentifyStore((s) => s.loginWithEmail)
  const signupWithEmail = useIdentifyStore((s) => s.signupWithEmail)
  const loginWithGoogle = useIdentifyStore((s) => s.loginWithGoogle)
  const setGuest = useIdentifyStore((s) => s.setGuest)

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [name, setName] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authErr, setAuthErr] = useState('')
  
  // Forgot password
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthErr('')
    
    if (!isFirebaseActive) {
      setAuthErr('กรุณาตั้งค่า Firebase Config ใน code ก่อนใช้งานครับ')
      return
    }

    if (pwd.length < 6) {
      setAuthErr('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (mode === 'signup' && pwd !== pwd2) {
      setAuthErr('ยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setAuthErr('กรุณากรอกชื่อแสดงผล')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), pwd)
      } else {
        await signupWithEmail(email.trim(), pwd, name.trim())
      }
    } catch (err: any) {
      console.error(err)
      let msg = err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      } else if (msg.includes('email-already-in-use')) {
        msg = 'อีเมลนี้ถูกใช้งานแล้วในระบบ'
      } else if (msg.includes('invalid-email')) {
        msg = 'รูปแบบอีเมลไม่ถูกต้อง'
      } else if (msg.includes('operation-not-allowed')) {
        msg = 'ล็อกอินด้วยอีเมลยังไม่ถูกเปิดใช้งานใน Firebase'
      }
      setAuthErr('❌ ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMsg('')
    if (!isFirebaseActive || !auth) {
      setResetMsg('กรุณาตั้งค่า Firebase Config ใน code ก่อนใช้งานครับ')
      return
    }
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetMsg('✅ ระบบได้ส่งอีเมลรีเซ็ตรหัสผ่านไปยังเมลของคุณแล้ว กรุณาตรวจสอบ Inbox/Spam')
    } catch (err: any) {
      console.error(err)
      let msg = err.message || 'เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ต'
      if (msg.includes('user-not-found')) {
        msg = 'ไม่พบอีเมลนี้ในระบบ'
      } else if (msg.includes('auth/missing-email')) {
        msg = 'กรุณากรอกอีเมล'
      }
      setResetMsg('❌ ' + msg)
    } finally {
      setResetLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setAuthErr('')
    if (!isFirebaseActive) {
      setAuthErr('กรุณาตั้งค่า Firebase Config ใน code ก่อนใช้งานครับ')
      return
    }
    try {
      await loginWithGoogle()
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/operation-not-supported-in-this-environment' || window.location.protocol === 'file:') {
        alert('❌ การล็อกอินด้วย Google จำเป็นต้องเปิดผ่านเว็บเซิร์ฟเวอร์ (http/https)\nระบบไม่รองรับการเปิดไฟล์โดยตรงแบบนี้ (file://)\n\n👉 แนะนำให้ใช้วิธี "สมัครสมาชิกด้วยอีเมล" แทนครับ (หรือรันผ่าน Live Server ก็ได้ครับ)')
      } else {
        setAuthErr('การล็อกอินล้มเหลว: ' + err.message)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <div className="lg-surface p-6 sm:p-8 max-w-md w-full bg-zinc-950/80 border border-white/10 shadow-2xl relative">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <div className="lg-content relative z-10 flex flex-col gap-6">
          <div className="text-center">
            <span className="text-4xl">🦠</span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">BOK BAC</h1>
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mt-1">Diagnostic Engine & Reference</p>
          </div>

          {authErr && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 leading-relaxed">
              {authErr}
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">ชื่อผู้ใช้งาน (Display Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Dr. Somsak"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">อีเมล (Email)</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-400">รหัสผ่าน (Password)</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setResetEmail(email); }}
                      className="text-xs text-violet-400 hover:underline"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    minLength={6}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1"
                  >
                    {showPwd ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">ยืนยันรหัสผ่าน (Confirm Password)</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    minLength={6}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">รีเซ็ตรหัสผ่าน</h3>
                <p className="text-xs text-zinc-400 mt-1">ป้อนอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน</p>
              </div>

              {resetMsg && (
                <div className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  resetMsg.includes('✅') 
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' 
                    : 'border-red-500/20 bg-red-500/10 text-red-200'
                }`}>
                  {resetMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgot(false); setResetMsg(''); }}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-white/10 text-zinc-400 hover:bg-white/5 transition"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 transition disabled:opacity-50"
                  >
                    {resetLoading ? 'กำลังส่ง...' : 'ส่งอีเมลรีเซ็ต'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="text-center text-xs text-zinc-400">
            {mode === 'login' ? 'ยังไม่มีบัญชีผู้ใช้?' : 'มีบัญชีผู้ใช้อยู่แล้ว?'}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setAuthErr('')
                setPwd('')
                setPwd2('')
                setShowForgot(false)
              }}
              className="text-violet-400 font-bold ml-1 hover:underline focus:outline-none"
            >
              {mode === 'login' ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="mx-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">หรือ</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm text-white font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => setGuest(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/30 text-violet-300 hover:bg-violet-500/5 transition text-xs font-semibold"
            >
              ใช้งานโดยไม่ล็อกอิน (Guest Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
