import { common, lodash } from "replugged";
import { Decoration, NewDecoration, getUserDecoration, getUserDecorations } from "../api";
import discordifyDecoration from "../utils/discordifyDecoration";
import { useUsersDecorationsStore } from "./UserDecorationsStore";
import decorationToString from "../utils/decorationToString";
import { create } from "../zustand";

const { lodash, users, fluxDispatcher } = common;

interface CurrentUserDecorationsState {
  decorations: Decoration[];
  selectedDecoration: Decoration | null;
  fetched: boolean;
  fetch: () => Promise<void>;
  delete: (decoration: Decoration | string) => Promise<void>;
  create: (decoration: NewDecoration) => Promise<void>;
  select: (decoration: Decoration | null) => Promise<void>;
  clear: () => void;
}

function updateCurrentUserAvatarDecoration(decoration: Decoration | null) {
  const user = users.getCurrentUser();
  user.avatarDecoration = decoration ? discordifyDecoration(decoration) : null;
  user.avatarDecorationData = user.avatarDecoration;

  useUsersDecorationsStore
    .getState()
    .set(user.id, decoration ? decorationToString(decoration) : null);
  fluxDispatcher.dispatch({ type: "CURRENT_USER_UPDATE", user });
  fluxDispatcher.dispatch({ type: "USER_SETTINGS_ACCOUNT_SUBMIT_SUCCESS" });
}

export const useCurrentUserDecorationsStore = create<CurrentUserDecorationsState>((set, get) => ({
  decorations: [],
  selectedDecoration: null,
  async fetch() {
    const decorations = await getUserDecorations();
    const selectedDecoration = await getUserDecoration();

    set({ decorations, selectedDecoration });
  },
  clear: () => set({ decorations: [], selectedDecoration: null })
}));
