import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { supabase } from '../supabase'

export function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // After signup, Supabase auto-signs-in (email confirmation is OFF)
        onAuthed()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuthed()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-info-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-3 shadow-xl shadow-brand-500/30">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-100">InSafe</h1>
          <p className="mt-1 text-sm text-ink-400">Automated Finance Assistant</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-ink-700/60 bg-ink-800/50 backdrop-blur-sm p-8">
          {/* Tabs */}
          <div className="mb-6 flex rounded-xl bg-ink-700/40 p-1">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-ink-300 hover:text-ink-100'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-300">Email</label>
              <div className="flex items-center rounded-xl border border-ink-600 bg-ink-800/80 focus-within:border-brand-500 transition-colors">
                <Mail size={18} className="ml-3 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-300">Password</label>
              <div className="flex items-center rounded-xl border border-ink-600 bg-ink-800/80 focus-within:border-brand-500 transition-colors">
                <Lock size={18} className="ml-3 text-ink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 outline-none"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger-400" />
                  <p className="text-sm text-danger-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="font-medium text-brand-400 hover:text-brand-300"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Your data is private — each account sees only its own finances.
        </p>
      </motion.div>
    </div>
  )
}
