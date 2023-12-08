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

export const useAuthorizationStore = {
  token: authorizationToken.get("token", null),
  tokens: authorizationToken.get("tokens", {
    [users.getCurrentUser().id]: authorizationToken.get("token", null),
  }),
  init: () => {},
  setToken: (token: string) => {
    authorizationToken.set("token", token);
    authorizationToken.set("tokens", {
      ...authorizationToken.get("tokens", {}),
      [users.getCurrentUser().id]: token,
    });
  },
  remove: (id: string) => {
    const tokens = authorizationToken.get("tokens", {});

    delete tokens[id];
    authorizationToken.set("tokens", tokens);
  },
  authorize: () => void showAuthorizationModal(),
  isAuthorized: () => Boolean(authorizationToken.get("token", null)),
};
