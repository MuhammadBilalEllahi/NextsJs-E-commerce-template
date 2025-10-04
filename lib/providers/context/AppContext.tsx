"use client";

import { getToken } from "next-auth/jwt";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { User } from "@/types";

type AppContextType = {
  router: ReturnType<typeof useRouter>;
  user: User | null;
  setUser: (u: User | null) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
  currency?: string;
  products: any[];
  fetchProducts: () => Promise<void>;
  cart: any[];
  setCart: (c: any[]) => void;
  wishlist: any[];
  setWishlist: (w: any[]) => void;
  orders: any[];
  setOrders: (o: any[]) => void;
  reviews: any[];
  setReviews: (r: any[]) => void;
  categories: any[];
  setCategories: (c: any[]) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = process.env.NEXT_PUBLIC_CURRENCY;

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.debug("Login data:", data);

      if (data.success) {
        setUser(data.user);
        return true;
      } else {
        setError(data.error);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/account/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchProducts = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
    const data = await response.json();
    setProducts(data);
  };

  const checkIfCookiePresentThenCheckAuth = async () => {
    const sessionToken = await cookieStore.get("session-token");
    if (sessionToken) {
      checkAuth();
    }
  };
  // Check authentication status on mount
  useEffect(() => {
    checkIfCookiePresentThenCheckAuth();
  }, []);

  const value: AppContextType = {
    router,
    user,
    setUser,
    isLoading,
    setIsLoading,
    error,
    setError,
    currency,
    products,
    fetchProducts,
    cart,
    wishlist,
    orders,
    reviews,
    categories,
    login,
    logout,
    checkAuth,
    setCart: function (c: any[]): void {
      throw new Error("Function not implemented.");
    },
    setWishlist: function (w: any[]): void {
      throw new Error("Function not implemented.");
    },
    setOrders: function (o: any[]): void {
      throw new Error("Function not implemented.");
    },
    setReviews: function (r: any[]): void {
      throw new Error("Function not implemented.");
    },
    setCategories: function (c: any[]): void {
      throw new Error("Function not implemented.");
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
