"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { handleCartMergeOnAuth } from "@/middleware";
import { CART_STORAGE_KEY, CartActionTypes, useCart } from "./cartContext";
import { User } from "@/types/types";
import { signupApi, getMe } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User | null }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string | Error; user?: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isFormLoading, setIsFormLoading] = useState(false);
  const router = useRouter();
  const { clear } = useCart();
  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as "customer" | "admin",
      }
    : null;

  const isAuthenticated = !!user;
  const isLoading = status === "loading";

  const login = async (email: string, password: string) => {
    setIsFormLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: "Invalid credentials" };
      }
      console.debug("Login result:", result);
      console.debug("User:", user);

      if (result?.ok && user) {
        // Merge guest cart with user cart if guest cart exists
        await handleCartMergeOnAuth(user.id);
        return { success: true, user };
      }
      // Wait for session to update
      const session = await getSession();

      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    } finally {
      setIsFormLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsFormLoading(true);
    try {
      const data = await signupApi({ name, email, password });
      if (data?.success) {
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginResult?.ok) {
          const me = await getMe().catch(() => null);
          const userId = me?.user?.id;
          if (userId) {
            await handleCartMergeOnAuth(userId);
            return { success: true, user: me.user };
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
      console.debug("Registration data\\[providers\\authProvider.tsx]:", data);

      return { success: false, error: data?.error || "Registration failed" };
    } catch (error) {
      console.error("Registration error\\[providers\\authProvider.tsx]:", error);
      return { success: false, error: error?.message || "Network error" };
    } finally {
      setIsFormLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      await clear();
      // dispatch({ type: CartActionTypes.CLEAR })
      localStorage.removeItem(CART_STORAGE_KEY);

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    // NextAuth handles session refresh automatically
    // This function is kept for compatibility
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
