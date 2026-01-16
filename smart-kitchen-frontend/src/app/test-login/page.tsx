"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAuthState } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function TestLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleTestLogin = () => {
    setLoading(true)
    
    // Set test user auth state
    const testUser = {
      id: 'cmj5yagjo0007zei13wcni6vy',
      email: 'test@example.com',
      name: 'Test User',
    }
    
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWo1eWFnam8wMDA3emVpMTN3Y25pNnZ5IiwiaWF0IjoxNzY2ODI5MTkxLCJleHAiOjE3Njc0MzM5OTF9.f4_a88rnyJvkgxbG64y5WrtSrpOpyLlmODR8M1PXxhs'
    
    setAuthState(testUser, testToken)
    
    setTimeout(() => {
      router.push('/dashboard/settings')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white mb-4">Test Login</h1>
        <p className="text-slate-300 mb-6">Click to login as test user and access settings</p>
        <Button 
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? 'Logging in...' : 'Login as Test User'}
        </Button>
        <div className="mt-4 text-sm text-slate-400">
          <p>Email: test@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  )
}