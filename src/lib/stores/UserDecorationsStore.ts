import { common } from "replugged";
import { create } from "../zustand";
import { getUsersDecorations } from "../api";
import { DECORATION_FETCH_COOLDOWN, SKU_ID } from "../constants";
import { AvatarDecoration } from "../..";
import subscribeToFluxDispatcher from "../utils/subscribeToFluxDispatcher";
import { useCurrentUserDecorationsStore } from "./CurrentUserDecorationsStore";
import { authorizationStore } from "./AuthorizationStore";

const { lodash, users, fluxDispatcher, React, channels } = common;

interface UserDecorationData {
  asset: string | null;
  fetchedAt: Date;
}

interface UsersDecorationsState {
  usesDecorations: Map<string, UserDecorationData>;
  fetchQueue: Set<string>;
  bulkFetch: () => Promise<void>;
  fetch: (userId: string, force?: boolean) => Promise<void>;
  fetchMany: (userIds: string[]) => Promise<void>;
  getAsset: (userId: string) => string | null | undefined;
  get: (userId: string) => UserDecorationData | undefined;
  has: (userId: string) => boolean;
  set: (userId: string, decoration: string | null) => void;
}

export const useUsersDecorationsStore = create<UsersDecorationsState>((set, get) => ({
  usersDecorations: new Map<string, UserDecorationData>(),
  fetchQueue: new Set(),
  bulkFetch: lodash.debounce(async () => {
    const { fetchQueue, usersDecorations } = get();
    set({ fetchQueue: new Set() });

    const fetchIds = Array.from(fetchQueue);
    if (fetchIds.length === 0) return;
    const fetchedUsersDecorations = await getUsersDecorations(fetchIds);

    const newUsersDecorations = new Map(usersDecorations);
    for (const [userId, decoration] of Object.entries(fetchedUsersDecorations)) {
      newUsersDecorations.set(userId, { asset: decoration, fetchedAt: new Date() });

      const user = users.getUser(userId) as any;
      if (user) {
        user.avatarDecoration = decoration ? { asset: decoration, skuId: SKU_ID } : null;
        user.avatarDecorationData = user.avatarDecoration;

        fluxDispatcher.dispatch({ type: "USER_UPDATE", user });
      }
    }

    for (const fetchedId of fetchIds) {
      if (!newUsersDecorations.has(fetchedId))
        usersDecorations.set(fetchedId, { asset: null, fetchedAt: new Date() });
    }

    set({ usersDecorations: newUsersDecorations });
  }),

  async fetch(userId: string, force: boolean = false) {
    const { usersDecorations, fetchQueue, bulkFetch } = get();

    if (usersDecorations.has(userId)) {
      const { fetchedAt } = usersDecorations.get(userId)!;
      if (!force && Date.now() - fetchedAt.getTime() < DECORATION_FETCH_COOLDOWN) return;
    }
    set({ fetchQueue: new Set(fetchQueue).add(userId) });
    bulkFetch();
  },

  async fetchMany(userIds) {
    if (!userIds.length) return;

    const { usersDecorations, fetchQueue, bulkFetch } = get();

    const newFetchQueue = new Set(fetchQueue);

    for (const userId of userIds) {
      if (usersDecorations.has(userId)) {
        const { fetchedAt } = usersDecorations.get(userId)!;
        if (Date.now() - fetchedAt.getTime() < DECORATION_FETCH_COOLDOWN) continue;
      }
      newFetchQueue.add(userId);
    }

    set({ fetchQueue: newFetchQueue });
    bulkFetch();
  },

  getAsset(userId: string) {
    return get().usersDecorations.get(userId)?.asset;
  },
  get(userId: string) {
    return get().usersDecorations.get(userId);
  },
  has(userId: string) {
    return get().usersDecorations.has(userId);
  },
  set(userId: string, decoration: string | null) {
    const { usersDecorations } = get();
    const newUsersDecorations = new Map(usersDecorations);

    newUsersDecorations.set(userId, { asset: decoration, fetchedAt: new Date() });
    set({ usersDecorations: newUsersDecorations });
  },
}));

export const subscriptions = [
  subscribeToFluxDispatcher("USER_PROFILE_MODAL_OPEN", (data) => {
    useUsersDecorationsStore.getState().fetch(data.userId, true);
  }),

  subscribeToFluxDispatcher("CONNECTION_OPEN", () => {
    useCurrentUserDecorationsStore.getState().clear();
    useUsersDecorationsStore.getState().fetch(users.getCurrentUser().id, true);
  }),

  subscribeToFluxDispatcher("LOAD_MESSAGES_SUCCESS", ({ messages }) => {
    useUsersDecorationsStore.getState().fetchMany(messages.map((m) => m.author.id));
  }),
];

export function useUserDecorAvatarDecoration(user): AvatarDecoration | null | undefined {
  const [decorAvatarDecoration, setDecorAvatarDecoration] = React.useState<string | null>(
    user ? useUsersDecorationsStore.getState().getAsset(user.id) ?? null : null,
  );

  React.useEffect(
    () =>
      useUsersDecorationsStore.subscribe((state) => {
        if (!user) return;
        const newDecorAvatarDecoration = state.getAsset(user.id);
        if (!newDecorAvatarDecoration) return;
        if (decorAvatarDecoration !== newDecorAvatarDecoration)
          setDecorAvatarDecoration(newDecorAvatarDecoration);
      }),
    [],
  );

  React.useEffect(() => {
    if (!user) return;
    const { fetch: fetchUserDecorAvatarDecoration } = useUsersDecorationsStore.getState();
    fetchUserDecorAvatarDecoration(user.id);
  }, []);

  console.log("Effects", decorAvatarDecoration);

  return decorAvatarDecoration ? { asset: decorAvatarDecoration, skuId: SKU_ID } : null;
}
