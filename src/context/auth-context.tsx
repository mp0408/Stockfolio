"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, Store } from "@/lib/types";

/* ── Types ───────────────────────────────────────── */

interface AuthState {
  user: User | null;
  profile: Profile | null;
  store: Store | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    storeName: string;
    role: "manager" | "staff";
  }) => Promise<{ error: string | null }>;
  signIn: (data: {
    email: string;
    password: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ── Provider ────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    store: null,
    isLoading: true,
  });

  const supabase = createClient();

  /**
   * Fetches the user's profile and store from the database.
   */
  const fetchProfileAndStore = useCallback(
    async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      let store: Store | null = null;
      if (profile?.store_id) {
        const { data: storeData } = await supabase
          .from("stores")
          .select("*")
          .eq("id", profile.store_id)
          .single();
        store = storeData;
      }

      return { profile: profile as Profile | null, store };
    },
    [supabase]
  );

  /**
   * Refreshes the current user's profile data.
   */
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const { profile, store } = await fetchProfileAndStore(state.user.id);
    setState((prev) => ({ ...prev, profile, store }));
  }, [state.user, fetchProfileAndStore]);

  /**
   * Sign up a new user.
   * Creates auth user → store → profile in sequence.
   */
  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      storeName: string;
      role: "manager" | "staff";
    }): Promise<{ error: string | null }> => {
      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: "Account created. Please check your email to verify." };
      }

      // 2. Create the store
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .insert({
          name: data.storeName,
          owner_id: authData.user.id,
        })
        .select()
        .single();

      if (storeError) {
        return { error: "Account created but store setup failed. Please contact support." };
      }

      // 3. Create the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          store_id: storeData.id,
          full_name: data.fullName,
          role: data.role,
        });

      if (profileError) {
        return { error: "Account created but profile setup failed. Please contact support." };
      }

      // Fetch fresh data into state
      const { profile, store } = await fetchProfileAndStore(authData.user.id);
      setState({
        user: authData.user,
        profile,
        store,
        isLoading: false,
      });

      return { error: null };
    },
    [supabase, fetchProfileAndStore]
  );

  /**
   * Sign in an existing user.
   */
  const signIn = useCallback(
    async (data: {
      email: string;
      password: string;
    }): Promise<{ error: string | null }> => {
      const { data: authData, error } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        // Translate common Supabase errors to user-friendly messages
        if (error.message.includes("Invalid login credentials")) {
          return { error: "Incorrect email or password. Please try again." };
        }
        return { error: error.message };
      }

      if (authData.user) {
        const { profile, store } = await fetchProfileAndStore(authData.user.id);
        setState({
          user: authData.user,
          profile,
          store,
          isLoading: false,
        });
      }

      return { error: null };
    },
    [supabase, fetchProfileAndStore]
  );

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      store: null,
      isLoading: false,
    });
  }, [supabase]);

  /**
   * Initialize auth state on mount and listen for changes.
   */
  useEffect(() => {
    // Get the current session
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { profile, store } = await fetchProfileAndStore(session.user.id);
        setState({
          user: session.user,
          profile,
          store,
          isLoading: false,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { profile, store } = await fetchProfileAndStore(session.user.id);
        setState({
          user: session.user,
          profile,
          store,
          isLoading: false,
        });
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          store: null,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileAndStore]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────── */

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
