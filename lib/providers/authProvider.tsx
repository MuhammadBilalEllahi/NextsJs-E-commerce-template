"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, signIn, signOut, useSession } from "next-auth/react"
import { handleCartMergeOnAuth } from "@/middlewares/cartMerge"

export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "admin"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isFormLoading, setIsFormLoading] = useState(false)
  const router = useRouter()

  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as "customer" | "admin"
  } : null

  const isAuthenticated = !!user
  const isLoading = status === "loading"

  const login = async (email: string, password: string) => {
    setIsFormLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: "Invalid credentials" }
      }
      console.log('Login result:', result)
      console.log("User:", user)

      if (result?.ok && user) {
        // Merge guest cart with user cart if guest cart exists
        await handleCartMergeOnAuth(user.id)
        return { success: true, user }
      }
      // Wait for session to update
    const session = await getSession() 

      return { success: false, error: "Login fkailed" }
          } catch (error) {
        console.error("Login error:", error)
        return { success: false, error: "Network error" }
      } finally {
        setIsFormLoading(false)
      }
    }

  const register = async (name: string, email: string, password: string) => {
    setIsFormLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
if (response.ok) {
  const loginResult = await signIn("credentials", {
    email,
    password,
    redirect: false,
  })

  if (loginResult?.ok) {
    // Force session refresh
    const sessionResponse = await fetch("/api/auth/session")
    const sessionData = await sessionResponse.json()
    
    // Wait for session to update
    const session = await getSession()

    if (sessionData?.user?.id) {
      await handleCartMergeOnAuth(sessionData.user.id)
      return { success: true, user: sessionData.user }
    }
  }
}

      // if (response.ok) {
      //   // After successful registration, sign in the user
      //   const loginResult = await signIn("credentials", {
      //     email,
      //     password,
      //     redirect: false,
      //   })

      //   if (loginResult?.ok && user) {
      //     // Merge guest cart with user cart if guest cart exists
      //     await handleCartMergeOnAuth(user.id)
      //     return { success: true, user }
      //   }
      // }

      return { success: false, error: data.error || "Registration failed" }
          } catch (error) {
        console.error("Registration error:", error)
        return { success: false, error: "Network error" }
      } finally {
        setIsFormLoading(false)
      }
    }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const refreshUser = async () => {
    // NextAuth handles session refresh automatically
    // This function is kept for compatibility
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
