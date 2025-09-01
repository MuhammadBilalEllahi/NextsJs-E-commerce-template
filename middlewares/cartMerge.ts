// Utility function to merge guest cart with user cart
export async function mergeGuestCartWithUser(userId: string, sessionId: string) {
  try {
    const response = await fetch('/api/cart', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, sessionId }),
    })

    if (response.ok) {
      // Clear guest ID from localStorage after successful merge
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dm-guest-cart-id')
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to merge guest cart:', error)
    return false
  }
}

// Function to handle cart merging when user authenticates
export async function handleCartMergeOnAuth(userId: string) {
  if (typeof window === 'undefined') return

  const guestId = localStorage.getItem('dm-guest-cart-id')
  if (guestId) {
    await mergeGuestCartWithUser(userId, guestId)
  }
}
