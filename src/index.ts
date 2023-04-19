import { Injector, Logger, webpack, common, types } from "replugged";

const { users } = common
const inject = new Injector();

const BASE_URL = "https://decor.fieryflames.dev";

let usersCache: Map<string, string>;
const fetchUsers = async (cache: RequestCache = "default") => usersCache = new Map(Object.entries(await fetch(BASE_URL + "/users.json", { cache }).then(c => c.json())));


export async function start(): Promise<void> {
  const AssetUtils = webpack.getByProps("getUserAvatarURL");

  inject.after(users, "getUser", (args, res) => {
   if (res && usersCache?.has(res.id)) res.avatarDecoration = `decor_${usersCache?.get(res.id)}`;
    return res;
  });

  inject.after(AssetUtils, "getAvatarDecorationURL", (args, res) => {
  
    console.log(args, res)
    return res;
  });


  await fetchUsers()
  
}

export function stop(): void {
  inject.uninjectAll();
}




async function fetchDecorations(decor) {
  console.log(decor)
  const res = await fetch(`${BASE_URL}/${decor}.png`);

}
