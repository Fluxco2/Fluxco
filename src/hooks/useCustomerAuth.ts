"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface CustomerProfile {
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
  notion_customer_id: string | null;
  created_at: string;
  last_login: string | null;
}

interface UseCustomerAuthReturn {
  user: User | null;
  session: Session | null;
  customer: CustomerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    profile: {
      company_name: string;
      contact_name: string;
      phone?: string;
    }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useCustomerAuth(): UseCustomerAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching customer profile:", error);
        return null;
      }

      return data as CustomerProfile;
    } catch (err) {
      console.error("Exception fetching customer profile:", err);
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
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const profile = await fetchCustomerProfile(currentSession.user.id);
            if (isMounted) {
              setCustomer(profile);
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
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Only re-fetch profile on sign-in or token refresh, not every event
      if (event === 'SIGNED_IN' && newSession?.user) {
        const profile = await fetchCustomerProfile(newSession.user.id);
        if (isMounted) {
          setCustomer(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setCustomer(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCustomerProfile]);

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
    }
  ) => {
    try {
      const response = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          company_name: profile.company_name,
          contact_name: profile.contact_name,
          phone: profile.phone || null,
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
    setCustomer(null);
  };

  return {
    user,
    session,
    customer,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
