import { Injector, common, webpack } from "replugged";

const { users } = common;
const inject = new Injector();

const BASE_URL = "https://decor.fieryflames.dev";

let usersCache: Map<string, string>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fetchUsers = async (cache: RequestCache = "default") =>
  (usersCache = new Map(
    Object.entries(await fetch(`${BASE_URL}/users.json`, { cache }).then((c) => c.json())),
  ));

export async function start(): Promise<void> {
  const AssetUtils = webpack.getBySource("getAvatarDecorationURL:");

  inject.after(users, "getUser", (_, res) => {
    if (res && usersCache?.has(res.id)) {
      res.avatarDecoration = `decor_${usersCache?.get(res.id)}`;
    }
    return res;
  });

  // @ts-expect-error - very lazy to type this
  inject.after(AssetUtils, "NZ", ([{ avatarDecoration }]: string, _) => {
    if (avatarDecoration?.startsWith("decor")) {
      const parts = avatarDecoration?.split("_");
      parts.shift();
      return `${BASE_URL}/${parts.join("_")}.png`;
    }
  });

  await fetchUsers();
}

export function stop(): void {
  inject.uninjectAll();
}
