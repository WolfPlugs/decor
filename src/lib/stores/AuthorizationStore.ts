import type { StateStorage } from "zustand/middleware";
import { authorizationToken } from "../utils/settings";
import { persist, create } from "../zustand";
import { common } from "replugged";
import showAuthorizationModal from "../utils/showAuthorizationModal";

const { users } = common;

interface AuthorizationState {
  token: string | null;
  tokens: Record<string, string>;
  init: () => void;
  authorize: () => Promise<void>;
  setToken: (token: string) => void;
  remove: (id: string) => void;
  isAuthorized: () => boolean;
}

const indexedDBStorage: StateStorage = {
  async getItem(name: string): Promise<string | null> {
    return (await authorizationToken).get(name).then((v) => v ?? null);
  },
  async setItem(name: string, value: string): Promise<void> {
    (await authorizationToken).set(name, value);
  },
  async removeItem(name: string): Promise<void> {
    (await authorizationToken).set(name, null);
  },
};

export const useAuthorizationStore = create<AuthorizationState>(
  persist(
    (set, get) => ({
      token: null,
      tokens: {},
      init: () => {
        set({ token: get().tokens[users.getCurrentUser().id] ?? null });
      },
      setToken: (token: string) =>
        set({ token, tokens: { ...get().tokens, [users.getCurrentUser().id]: token } }),
      remove: (id: string) => {
        const { tokens, init } = get();
        const newTokens = { ...tokens };
        delete newTokens[id];
        set({ tokens: newTokens });

        init();
      },
      authorize: () => void showAuthorizationModal(),
      isAuthorized: () => !!get().token,
    }),
    {
      name: "decor-auth",
      getStorage: () => indexedDBStorage,
      partialize: (state) => ({ tokens: state.tokens }),
      onRehydrateStorage: () => (state) => state?.init(),
    },
  ),
);
