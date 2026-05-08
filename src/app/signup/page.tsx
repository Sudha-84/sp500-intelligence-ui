'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signUp, confirmSignUp } from 'aws-amplify/auth'
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep]         = useState<'register' | 'confirm'>('register')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [code, setCode]         = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      })
      setStep('confirm')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await confirmSignUp({ username: email, confirmationCode: code })
      router.replace('/login?verified=1')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'var(--surface-0)' }}>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                      rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #4e7cff 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>SP500 Intelligence</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by xAI Grok</div>
          </div>
        </div>

        <div className="card p-8" style={{ background: 'var(--surface-2)' }}>
          {step === 'register' ? (
            <>
              <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Enter your details to get started
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                           placeholder="you@example.com" required
                           className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                           style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                           placeholder="Min. 8 characters" required
                           className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none"
                           style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPwd
                        ? <Eye    size={14} style={{ color: 'var(--text-muted)' }} />
                        : <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                           placeholder="Repeat password" required
                           className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                           style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-xs p-3 rounded-lg"
                              style={{ background: 'var(--col-bear-glow)', color: 'var(--col-bear)' }}>
                    {error}
                  </motion.div>
                )}
                <button type="submit" disabled={loading}
                        className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all mt-2"
                        style={{ background: loading ? 'var(--surface-4)' : 'var(--accent)', color: 'white', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={14} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Check your email</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                We sent a 6-digit verification code to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>
              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Verification code
                  </label>
                  <div className="relative">
                    <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" value={code} onChange={e => setCode(e.target.value)}
                           placeholder="123456" required maxLength={6} autoFocus
                           className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none font-mono tracking-widest"
                           style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-xs p-3 rounded-lg"
                              style={{ background: 'var(--col-bear-glow)', color: 'var(--col-bear)' }}>
                    {error}
                  </motion.div>
                )}
                <button type="submit" disabled={loading}
                        className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all mt-2"
                        style={{ background: loading ? 'var(--surface-4)' : 'var(--accent)', color: 'white', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Verifying…' : <><span>Verify email</span><ArrowRight size={14} /></>}
                </button>
                <button type="button" onClick={() => setStep('register')}
                        className="w-full py-2 text-xs text-center"
                        style={{ color: 'var(--text-muted)' }}>
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--accent)' }}>Sign in</a>
        </p>
      </motion.div>
    </div>
  )
}
