import { API_URL } from "./constants";
import { useAuthorizationStore } from "./stores/AuthorizationStore";


export interface Preset {
  id: string;
  name: string;
  description: string | null;
  decorations: Decoration[];
  authorIds: string[];
}

export interface Decoration {
  hash: string;
  animated: boolean;
  alt: string | null;
  authorId: string | null;
  reviewed: boolean | null;
  presetId: string | null;
}

export interface NewDecoration {
  uri: string;
  fileName: string;
  fileType: string;
  alt: string | null;
}

export async function fetchApi(url: RequestInfo, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${useAuthorizationStore.getState().token}`,
    },
  });

  if (res.ok) return res;
  else throw new Error(await res.text());
}

export const getUsersDecorations = async (ids: string[] | undefined = undefined) => {
  if (ids && ids.length === 0) return {};
  const url = new URL(API_URL + "/users");
  if (ids && ids.length !== 0) url.searchParams.set("ids", JSON.stringify(ids));

  return (await fetch(url).then((c) => c.json())) as Record<string, string | null>;
};

export const getUserDecorations = async (id: string = "@me"): Promise<Decoration[]> =>
  fetchApi(API_URL + `/users/${id}/decorations`).then((c) => c.json());

export const getUserDecoration = async (id: string = "@me"): Promise<Decoration | null> =>
  fetchApi(API_URL + `/users/${id}/decoration`).then((c) => c.json());

export const getPresets = async (): Promise<Preset[]> => fetch(API_URL + "/decorations/presets").then(c => c.json());
