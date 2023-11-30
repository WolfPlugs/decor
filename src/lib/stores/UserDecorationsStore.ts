import { common } from "replugged";
import { create } from "../zustand";
import { getUsersDecorations } from "../api";
import { SKU_ID } from "../constants";
import { AvatarDecoration } from "../..";
import subscribeToFluxDispatcher from "../utils/subscribeToFluxDispatcher";

const { lodash, users, fluxDispatcher, React, channels } = common;

interface UsersDecorationsState {
  usesDecorations: Map<string, string | null>;
  fetchQueue: Set<string>;
  bulkFetch: () => Promise<void>;
  fetch: (userId: string, force?: boolean) => Promise<void>;
  fetchMany: (userIds: string[]) => Promise<void>;
  getAsset: (userId: string) => string | null | undefined;
  get: (userId: string) => string | null | undefined;
  has: (userId: string) => boolean;
  set: (userId: string, decoration: string | null) => void;
}

export const useUsersDecorationsStore = create<UsersDecorationsState>((set, get) => ({
  usersDecorations: new Map(),
  fetchQueue: new Set(),
  bulkFetch: lodash.debounce(async () => {
    const { fetchQueue, usersDecorations } = get();
    set({ fetchQueue: new Set() });

    const fetchIds = Array.from(fetchQueue);
    if (fetchIds.length === 0) return;
    const fetchedUsersDecorations = await getUsersDecorations(fetchIds);

    const newUsersDecorations = new Map(usersDecorations);
    for (const [userId, decoration] of Object.entries(fetchedUsersDecorations)) {
      newUsersDecorations.set(userId, decoration);

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

    if (!force && usersDecorations.has(userId)) return;

    set({ fetchQueue: new Set(fetchQueue).add(userId) });
    bulkFetch();
  },

  async fetchMany(userIds) {
    if (!userIds.length) return;

    const { usersDecorations, fetchQueue, bulkFetch } = get();

    const newFetchQueue = new Set(fetchQueue);
    for (const userId of userIds) {
      if (!usersDecorations.has(userId)) newFetchQueue.add(userId);
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

    newUsersDecorations.set(userId, decoration);
    set({ usersDecorations: newUsersDecorations });
  },
}));

export const subscriptions = [
  subscribeToFluxDispatcher("LOAD_MESSAGES_SUCCESS", ({ messages }) => {
    useUsersDecorationsStore.getState().fetchMany(messages.map((m) => m.author.id));
  }),
  subscribeToFluxDispatcher("CONNECTION_OPEN", () => {
    useUsersDecorationsStore.getState().fetch(users.getCurrentUser().id, true);
  }),
  subscribeToFluxDispatcher("MESSAGE_CREATE", (data) => {
    const channelId = channels.getChannelId();
    if (data.channelId === channelId) {
      useUsersDecorationsStore.getState().fetch(data.message.author.id);
    }
  }),
  subscribeToFluxDispatcher("TYPING_START", (data) => {
    const channelId = channels.getChannelId();
    if (data.channelId === channelId) {
      useUsersDecorationsStore.getState().fetch(data.userId);
    }
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

  return decorAvatarDecoration ? { asset: decorAvatarDecoration, skuId: SKU_ID } : null;
}
