"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface SupplierProfile {
  id: string;
  user_id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  certifications: string[];
  specialties: string[];
  website: string | null;
  kva_range_min: number | null;
  kva_range_max: number | null;
  is_verified: boolean;
  notify_new_listings: boolean;
  created_at: string;
  last_login: string | null;
}

interface UseSupplierAuthReturn {
  user: User | null;
  session: Session | null;
  supplier: SupplierProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    profile: {
      company_name: string;
      contact_name: string;
      phone?: string;
      notify_new_listings?: boolean;
    }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useSupplierAuth(): UseSupplierAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSupplierProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching supplier profile for user:", userId);
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching supplier profile:", error);
        return null;
      }

      console.log("Supplier profile fetched:", data);
      return data as SupplierProfile;
    } catch (err) {
      console.error("Exception fetching supplier profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        // getSession can hang if token refresh fails — add timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("getSession timeout")), 2000)
        );

        let currentSession: any = null;
        let error: any = null;
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          currentSession = (result as any).data?.session ?? null;
          error = (result as any).error ?? null;
        } catch {
          console.warn("[SupplierAuth] getSession timed out — treating as no session");
          if (isMounted) setLoading(false);
          return;
        }

        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const profile = await fetchSupplierProfile(currentSession.user.id);
            if (isMounted) {
              setSupplier(profile);
            }
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Exception during auth init:", err);
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state change:", event);

      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const profile = await fetchSupplierProfile(newSession.user.id);
        if (isMounted) {
          setSupplier(profile);
        }
      } else {
        setSupplier(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSupplierProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (
    email: string,
    password: string,
    profile: {
      company_name: string;
      contact_name: string;
      phone?: string;
      notify_new_listings?: boolean;
    }
  ) => {
    try {
      // Use API route to create user and profile (bypasses RLS issues)
      const response = await fetch("/api/supplier/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          company_name: profile.company_name,
          contact_name: profile.contact_name,
          phone: profile.phone || null,
          notify_new_listings: profile.notify_new_listings ?? false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.error || "Registration failed") };
      }

      // Auto sign-in after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in failed:", signInError);
        // Registration succeeded but auto-login failed - not critical
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || "Registration failed") };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setUser(null);
    setSession(null);
    setSupplier(null);
  };

  return {
    user,
    session,
    supplier,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
