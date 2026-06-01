// templates/authStore.ts → copy to `src/stores/authStore.ts`
// Zustand auth/session store. Owns the two-system model: Firebase identity + backend user row.
// Wires the http.ts auth bridge at bootstrap so networking stays Firebase-free.
//
// Platform note:
//   Expo  → initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
//   Web   → browserLocalPersistence (Firebase default; no extra wiring)
// See gotchas: Firebase v12 RN persistence import quirk (@firebase/auth scoped package).

import { create } from "zustand";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { configureHttpAuth } from "@/lib/http";
import { queryClient } from "@/lib/queryClient";
import { getUserByFirebaseUuid, createUser } from "@/services/user.service";
import type { User } from "@/types/api";

type Status = "init" | "authed" | "guest";

interface AuthState {
  status: Status;
  user: User | null; // backend row
  firebaseUser: FirebaseUser | null;
  bootstrap: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    profile: Omit<User, "id" | "firebaseUuid">,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "init",
  user: null,
  firebaseUser: null,

  // Call once at app start. Wires the http bridge + subscribes to Firebase session changes.
  bootstrap: () => {
    const auth = getAuth();

    configureHttpAuth({
      getToken: (force) => auth.currentUser?.getIdToken(force) ?? Promise.resolve(null),
      onAuthExpired: () => void get().logout(),
    });

    onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        set({ status: "guest", user: null, firebaseUser: null });
        return;
      }
      // Firebase session exists → confirm the backend row (two-system model).
      const row = await getUserByFirebaseUuid(fbUser.uid).catch(() => null);
      set({
        firebaseUser: fbUser,
        user: row,
        status: row ? "authed" : "guest", // no backend row → not usable; force onboarding
      });
    });
  },

  login: async (email, password) => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles the backend lookup + status transition.
  },

  register: async (email, password, profile) => {
    const auth = getAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // MANDATORY: create the backend row or every protected call 401s.
    const row = await createUser({ ...profile, firebaseUuid: cred.user.uid });
    set({ user: row, firebaseUser: cred.user, status: "authed" });
  },

  logout: async () => {
    await signOut(getAuth()).catch(() => {});
    queryClient.clear(); // drop cached data across the session boundary
    set({ status: "guest", user: null, firebaseUser: null });
  },
}));
