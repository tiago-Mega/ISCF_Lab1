'use client'
import { useState } from 'react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Account created! You can now log in.')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Create Account</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
      <input type="password" placeholder="Password (min 6 characters)" value={password}
        onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
      <button type="submit" className="bg-green-600 text-white p-2 rounded">Register</button>
      <p className="text-sm text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 underline">Sign in</Link>
      </p>
    </form>
  )
}
