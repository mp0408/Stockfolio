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

interface AuthState {
  user: User | null;
  profile: Profile | null;
  store: Store | null;
  isLoading: boolean;
}

export interface SignUpResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    storeName: string;
    role: "manager" | "staff";
  }) => Promise<SignUpResult>;
  signIn: (data: {
    email: string;
    password: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    store: null,
    isLoading: true,
  });

  const supabase = createClient();

  // Fetches profile and store with automatic retry & self-healing fallback
  const fetchProfileAndStore = useCallback(
    async (userObj: User) => {
      const userId = userObj.id;

      // Try initial query
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If profile is not found yet (e.g. database trigger taking a split second), retry once
      if (!profile) {
        await new Promise((res) => setTimeout(res, 350));
        const retryResult = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        profile = retryResult.data;
      }

      let store: Store | null = null;

      // Self-healing: create store + profile if database trigger did not run
      if (!profile && userObj) {
        const meta = userObj.user_metadata || {};
        const storeName = meta.store_name || "My Store";
        const fullName =
          meta.full_name || userObj.email?.split("@")[0] || "Store Manager";
        const role = meta.role || "manager";

        // Check if store already exists for user
        const { data: existingStore } = await supabase
          .from("stores")
          .select("*")
          .eq("owner_id", userId)
          .maybeSingle();

        let activeStore = existingStore as Store | null;

        if (!activeStore) {
          const { data: newStore } = await supabase
            .from("stores")
            .insert({ name: storeName, owner_id: userId })
            .select()
            .maybeSingle();
          activeStore = newStore as Store | null;
        }

        if (activeStore) {
          store = activeStore;
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              store_id: activeStore.id,
              full_name: fullName,
              role: role,
            })
            .select()
            .maybeSingle();

          profile = newProfile as Profile | null;
        }
      } else if (profile?.store_id) {
        const { data: storeData } = await supabase
          .from("stores")
          .select("*")
          .eq("id", profile.store_id)
          .maybeSingle();
        store = storeData as Store | null;
      }

      return { profile: profile as Profile | null, store };
    },
    [supabase]
  );

  // Refreshes the current user's profile data
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const { profile, store } = await fetchProfileAndStore(state.user);
    setState((prev) => ({ ...prev, profile, store }));
  }, [state.user, fetchProfileAndStore]);

  // Sign up a new user with metadata
  const signUp = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      storeName: string;
      role: "manager" | "staff";
    }): Promise<SignUpResult> => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            store_name: data.storeName,
            role: data.role,
          },
        },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("rate limit") ||
          authError.message.toLowerCase().includes("over_email_send_rate_limit")
        ) {
          return {
            error:
              "Email rate limit reached. Please wait a moment or disable email confirmation in Supabase.",
          };
        }
        if (
          authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("user already exists")
        ) {
          return {
            error:
              "An account with this email already exists. Please sign in or reset your password.",
          };
        }
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: "Failed to create account. Please try again." };
      }

      // Supabase enumeration protection — empty identities array means email already taken
      if (authData.user.identities && authData.user.identities.length === 0) {
        return {
          error:
            "An account with this email already exists. Please sign in instead.",
        };
      }

      // Email confirmation required — no session created immediately
      if (!authData.session) {
        return { error: null, needsEmailConfirmation: true };
      }

      const { profile, store } = await fetchProfileAndStore(authData.user);
      setState({
        user: authData.user,
        profile,
        store,
        isLoading: false,
      });

      return { error: null, needsEmailConfirmation: false };
    },
    [supabase, fetchProfileAndStore]
  );

  // Sign in an existing user
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
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid_grant")
        ) {
          return {
            error:
              "Incorrect email or password. Please verify your credentials or sign up.",
          };
        }
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return {
            error:
              "Email not verified yet. Please check your inbox or disable email confirmation in your Supabase Auth settings.",
          };
        }
        return { error: error.message };
      }

      if (authData.user) {
        const { profile, store } = await fetchProfileAndStore(authData.user);
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

  // Sign out the current user
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      store: null,
      isLoading: false,
    });
  }, [supabase]);

  // Send password reset email via Supabase
  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
          return {
            error: "Too many requests. Please wait a few minutes and try again.",
          };
        }
        return { error: error.message };
      }

      return { error: null };
    },
    [supabase]
  );

  // Update password for the currently authenticated user
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    },
    [supabase]
  );

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { profile, store } = await fetchProfileAndStore(session.user);
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { profile, store } = await fetchProfileAndStore(session.user);
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
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
