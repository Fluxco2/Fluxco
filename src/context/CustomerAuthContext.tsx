"use client";

import { createContext, useContext } from "react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import type { User, Session } from "@supabase/supabase-js";

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

interface CustomerAuthContextType {
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

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useCustomerAuth();
  return (
    <CustomerAuthContext.Provider value={auth}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuthContext(): CustomerAuthContextType {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuthContext must be used within a CustomerAuthProvider");
  }
  return ctx;
}
