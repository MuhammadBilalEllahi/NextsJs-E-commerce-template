import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // For demo purposes, we'll use a simple check
    // In production, you'd validate against your database
    if (email === 'admin@dehlimirch.com' && password === 'admin123') {
      // Set a session cookie
      const cookieStore = await cookies()
      cookieStore.set('session-token', 'demo-admin-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: '1', 
          email, 
          name: 'Admin User',
          role: 'admin' 
        } 
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}










