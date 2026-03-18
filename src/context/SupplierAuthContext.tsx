"use client";

import { createContext, useContext } from "react";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import type { User, Session } from "@supabase/supabase-js";

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

interface SupplierAuthContextType {
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

const SupplierAuthContext = createContext<SupplierAuthContextType | null>(null);

export function SupplierAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSupplierAuth();
  return (
    <SupplierAuthContext.Provider value={auth}>
      {children}
    </SupplierAuthContext.Provider>
  );
}

export function useSupplierAuthContext(): SupplierAuthContextType {
  const ctx = useContext(SupplierAuthContext);
  if (!ctx) {
    throw new Error("useSupplierAuthContext must be used within a SupplierAuthProvider");
  }
  return ctx;
}
