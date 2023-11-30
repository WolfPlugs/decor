import { API_URL } from "./constants";

export const getUsersDecorations = async (ids: string[] | undefined = undefined) => {
  if (ids && ids.length === 0) return {}
  const url = new URL(API_URL + "/users");
  if (ids && ids.length !== 0) url.searchParams.set("ids", JSON.stringify(ids));

  return (await fetch(url).then(c => c.json())) as Record<string, string | null>;
};
