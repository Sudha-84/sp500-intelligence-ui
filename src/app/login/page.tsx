'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { signIn, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await signIn(email, password)
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center p-4"
         style={{ background: 'var(--surface-0)' }}>

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                      rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #4e7cff 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}>
            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>
              SP500 Intelligence
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Powered by xAI Grok
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8" style={{ background: 'var(--surface-2)' }}>
          <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium mb-1.5 block"
                     style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none
                             transition-colors focus:ring-1"
                  style={{
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium mb-1.5 block"
                     style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPwd
                    ? <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />
                    : <Eye    size={14} style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-xs p-3 rounded-lg"
                          style={{ background: 'var(--col-bear-glow)', color: 'var(--col-bear)' }}>
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center
                         justify-center gap-2 transition-all mt-2"
              style={{
                background: isLoading ? 'var(--surface-4)' : 'var(--accent)',
                color: 'white',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Signing in…' : <>Sign in <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>

        {/* Signup link — navigates to Cognito hosted UI */}
        {(() => {
          const domain   = process.env.NEXT_PUBLIC_COGNITO_DOMAIN   ?? ''
          const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? ''
          // Strip trailing slash so redirect_uri matches exactly what's registered in Cognito
          const appUrl   = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
          // redirect_uri must exactly match one of the Allowed Callback URLs in the
          // Cognito App Client. Scopes separated by %20 (not +) per OAuth 2.0 spec.
          const redirectUri = encodeURIComponent(appUrl + '/dashboard')
          const signupUrl = domain
            ? `https://${domain}/signup?client_id=${clientId}&response_type=code&scope=email%20openid%20profile&redirect_uri=${redirectUri}`
            : '#'
          return (
            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <a href={signupUrl}
                 style={{ color: 'var(--accent)', textDecoration: 'none' }}
                 onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                 onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                Create one →
              </a>
            </p>
          )
        })()}

        <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Secured by Amazon Cognito · xAI Grok sentiment analysis
        </p>
      </motion.div>
    </div>
  )
}
