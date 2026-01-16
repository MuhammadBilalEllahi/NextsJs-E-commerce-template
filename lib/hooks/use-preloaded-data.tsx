"use client";

import { useEffect, useState } from "react";
import {
  getAllCategoriesWithProducts,
  getAllActiveBrands,
} from "@/database/data-service";
import { CACHE_EXPIRY_TIME, PRELOAD_CACHE_KEY } from "../cacheConstants";

interface PreloadedData {
  categories: any[];
  brands: any[];
  isLoaded: boolean;
}

// Global cache for preloaded data
let globalPreloadedData: PreloadedData = {
  categories: [],
  brands: [],
  isLoaded: false,
};


// Helper function to check if cache is expired
const isCacheExpired = (timestamp: number) => {
  return Date.now() - timestamp > CACHE_EXPIRY_TIME;
};

// Helper function to get cached data
const getCachedData = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (!isCacheExpired(timestamp)) {
        return data;
      } else {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error reading from cache:", error);
  }
  return null;
};

// Helper function to set cached data
const setCachedData = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
};

// Function to preload all hover navigation data
export const preloadHoverData = async (): Promise<PreloadedData> => {
  // Return cached data if available
  const cachedData = getCachedData(PRELOAD_CACHE_KEY);
  if (cachedData) {
    globalPreloadedData = { ...cachedData, isLoaded: true };
    return globalPreloadedData;
  }

  try {
    console.debug("Preloading hover navigation data...");

    // Load all data in parallel using Promise.all
    const [categories, brands] = await Promise.all([
      getAllCategoriesWithProducts(6), // Get 6 products per category for hover navigation
      getAllActiveBrands(),
    ]);

    const preloadedData: PreloadedData = {
      categories: categories || [],
      brands: brands || [],
      isLoaded: true,
    };

    // Update global cache
    globalPreloadedData = preloadedData;

    // Cache the results
    setCachedData(PRELOAD_CACHE_KEY, preloadedData);

    console.debug("Hover navigation data preloaded successfully:", {
      categoriesCount: categories?.length || 0,
      brandsCount: brands?.length || 0,
    });

    return preloadedData;
  } catch (error) {
    console.error("Error preloading hover navigation data:", error);
    return {
      categories: [],
      brands: [],
      isLoaded: false,
    };
  }
};

// Hook to get preloaded data
export const usePreloadedData = () => {
  const [data, setData] = useState<PreloadedData>(globalPreloadedData);

  useEffect(() => {
    // If data is already loaded, return it
    if (globalPreloadedData.isLoaded) {
      setData(globalPreloadedData);
      return;
    }

    // Otherwise, trigger preloading
    preloadHoverData().then((preloadedData) => {
      setData(preloadedData);
    });
  }, []);

  return data;
};

// Component to trigger preloading on page load
export function HoverDataPreloader() {
  useEffect(() => {
    // Only preload if not already loaded
    if (!globalPreloadedData.isLoaded) {
      preloadHoverData();
    }
  }, []);

  return null; // This component doesn't render anything
}

// Export the preload function for manual triggering
export { preloadHoverData as preloadHoverNavigationData };
