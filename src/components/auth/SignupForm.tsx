'use client'

import { type FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Alert from '@/src/components/ui/Alert'
import Spinner from '@/src/components/ui/Spinner'

export default function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string }
        throw new Error(data.detail || 'Signup failed')
      }
      const signInRes = await signIn('credentials', { email, password, redirect: false })
      if (signInRes?.error) throw new Error('Signed up but sign-in failed. Try logging in.')
      router.push('/')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <Alert>{error}</Alert>}
      <label className="form-control">
        <span className="label-text">Name (optional)</span>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label className="form-control">
        <span className="label-text">Email</span>
        <input
          type="email"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
      </label>
      <label className="form-control">
        <span className="label-text">Password (min 8 characters)</span>
        <input
          type="password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !email || password.length < 8}
      >
        {loading ? <Spinner size="sm" /> : 'Create account'}
      </button>
    </form>
  )
}
