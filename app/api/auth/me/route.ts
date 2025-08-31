import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session-token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      )
    }
    
    // In production, you'd validate the token and get user info from database
    // For demo purposes, we'll return a mock user
    return NextResponse.json({
      authenticated: true,
      user: {
        id: '1',
        email: 'admin@dehlimirch.com',
        name: 'Admin User',
        role: 'admin'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    )
  }
}










