'use client'
import { useState } from 'react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/')  // redirect to dashboard after login
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">Sign In</button>
    </form>
  )
}
