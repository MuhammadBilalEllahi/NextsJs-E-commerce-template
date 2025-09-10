"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { getAllCategories, getProductsByCategory } from "@/database/data-service"
import { CURRENCY } from "@/lib/constants"

interface Category {
  id: string
  name: string
  slug: string
  parent: { id: string; name: string } | null
  description: string
  image: string
}

interface Product {
  id: string
  slug: string
  title: string
  price: number
  image?: string
  brand: string
}

interface HoverNavigationProps {
  isOpen: boolean
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function HoverNavigation({ isOpen, onClose, onMouseEnter, onMouseLeave }: HoverNavigationProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showProducts, setShowProducts] = useState(false)

  // Cache keys and expiry times
  const CATEGORIES_CACHE_KEY = 'dehli_mirch_categories'
  const PRODUCTS_CACHE_KEY_PREFIX = 'dehli_mirch_products_'
  const CACHE_EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes in milliseconds

  // Helper function to check if cache is expired
  const isCacheExpired = (timestamp: number) => {
    return Date.now() - timestamp > CACHE_EXPIRY_TIME
  }

  // Helper function to get cached data
  const getCachedData = (key: string) => {
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (!isCacheExpired(timestamp)) {
          return data
        } else {
          // Remove expired cache
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error)
    }
    return null
  }

  // Helper function to set cached data
  const setCachedData = (key: string, data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }

  // Clear expired cache on component mount
  useEffect(() => {
    const clearExpiredCache = () => {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('dehli_mirch_')) {
            const cached = localStorage.getItem(key)
            if (cached) {
              const { timestamp } = JSON.parse(cached)
              if (isCacheExpired(timestamp)) {
                localStorage.removeItem(key)
              }
            }
          }
        })
      } catch (error) {
        console.error('Error clearing expired cache:', error)
      }
    }
    
    clearExpiredCache()
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (hoveredCategory) {
      setShowProducts(true)
      fetchCategoryProducts(hoveredCategory.slug)
    } else {
      setShowProducts(false)
      setCategoryProducts([])
    }
  }, [hoveredCategory])

  const fetchCategories = async () => {
    try {
      // Check localStorage cache first
      const cachedCategories = getCachedData(CATEGORIES_CACHE_KEY)
      if (cachedCategories) {
        setCategories(cachedCategories)
        return
      }

      // Fetch from server if not in cache
      const data = await getAllCategories()
      setCategories(data as Category[])
      
      // Cache the results
      setCachedData(CATEGORIES_CACHE_KEY, data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchCategoryProducts = async (categorySlug: string) => {
    setLoading(true)
    try {
      const cacheKey = `${PRODUCTS_CACHE_KEY_PREFIX}${categorySlug}`
      
      // Check localStorage cache first
      const cachedProducts = getCachedData(cacheKey)
      if (cachedProducts) {
        setCategoryProducts(cachedProducts)
        setLoading(false)
        return
      }

      // Fetch from server if not in cache
      const products = await getProductsByCategory(categorySlug, 6)
      setCategoryProducts(products)
      
      // Cache the results
      setCachedData(cacheKey, products)
    } catch (error) {
      console.error("Error fetching category products:", error)
      setCategoryProducts([])
    } finally {
      setLoading(false)
    }
  }


  if (!isOpen) return null

  return (
    <div 
      className="absolute top-8 left-0 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex">
        {/* Categories Column */}
        <div className="w-fit bg-popover text-popover-foreground border border-border shadow-md">
          <div className="p-0 py-1">
            {categories.map((category, index) => (
              <div key={category.id}>
                <div
                  className="flex items-center justify-between py-2 px-4 hover:underline cursor-pointer group transition-all"
                  onMouseEnter={() => {
                    setHoveredCategory(category)
                    setShowProducts(true)
                  }}
                >
                  <span className="text-xs font-medium w-28">
                    {category.name}
                  </span>
                  <ChevronRight className="ml-2 h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                {index < categories.length - 1 && (
                  <div className="border-b border-border mx-4"></div>
                )}
              </div>
            ))}
          </div>
          <div className="border-b border-border mx-4"></div>
        </div>

        {/* Products Column */}
        {showProducts && hoveredCategory && (
          <div className="bg-popover text-popover-foreground border border-border shadow-md">
            <div className="p-0 py-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {categoryProducts.map((product, index) => (
                    <div key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        className="flex items-center justify-between py-2 px-4 hover:underline cursor-pointer group transition-all"
                        onClick={onClose}
                      >
                        <span className="text-xs font-medium w-28">
                          {product.title}
                        </span>
                      </Link>
                      {index < categoryProducts.length - 1 && (
                        <div className="border-b border-border mx-4"></div>
                      )}
                    </div>
                  ))}
                  
                  {/* More link */}
                  {categoryProducts.length > 0 && (
                    <div>
                      <div className="border-b border-border mx-4"></div>
                      <Link
                        href={`/category/${hoveredCategory.slug}`}
                        className="flex items-center justify-between py-2 px-4 hover:underline cursor-pointer group transition-all"
                        onClick={onClose}
                      >
                        <span className="text-xs font-medium">
                          More
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </Link>
                    </div>
                  )}
                </>
              )}
              {categoryProducts.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">No products found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
