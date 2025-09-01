"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/providers/authProvider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      if (result.success) {
        // Check if user is admin and redirecting to admin area
        if (redirect.startsWith('/admin') && result.user?.role !== 'admin') {
          setError("Access denied. Admin privileges required.")
          setIsLoading(false)
          return
        }
        router.push(redirect)
      } else {
        setError(result.error || 'Login failed')
        setIsLoading(false)
      }
    } catch (error) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            required 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-3 text-sm">
        New here?{" "}
        <Link href="/account/signup" className="text-red-600 underline">
          Create an account
        </Link>
      </p>
      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <p className="font-semibold">Demo Credentials:</p>
        <p>Email: admin@dehlimirch.com</p>
        <p>Password: admin123</p>
      </div>
    </div>
  )
}
