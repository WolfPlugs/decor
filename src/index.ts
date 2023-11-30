import { Injector, common, webpack } from "replugged";
import {
  subscriptions as UserDecorationsStoreSubscriptions,
  useUsersDecorationsStore,
} from "./lib/stores/UserDecorationsStore";
import { CDN_URL, RAW_SKU_ID, SKU_ID } from "./lib/constants";

const { users } = common;
const AvatarURL = webpack.getByProps("getUserAvatarURL");
const { isAnimatedAvatarDecoration } = webpack.getByProps("isAnimatedAvatarDecoration");
const inject = new Injector();

export interface AvatarDecoration {
  asset: string;
  skuId: string;
}

UserDecorationsStoreSubscriptions;

export async function start(): Promise<void> {
  inject.after(users, "getUser", (args, res) => {
    const store = useUsersDecorationsStore.getState();
    if (res && store.has(res.id)) {
      const decor = store.get(res.id);

      if (decor && res.avatarDecoration?.skuId !== SKU_ID) {
        users.avatarDecoration = {
          asset: decor,
          skuId: SKU_ID,
        };
      } else if (!decor && res?.avatarDecoration?.skuId === SKU_ID) {
        users.avatarDecoration = null;
      }

      res.avatarDecorationData = res?.avatarDecoration;
    }
  });

  inject.instead(AvatarURL, "getAvatarDecorationURL", (args, res) => {
    const [{ avatarDecoration, canAnimate }] = args;
    if (avatarDecoration?.skuId === SKU_ID) {
      const url = new URL(`${CDN_URL}/${avatarDecoration.asset}.png`);
      url.searchParams.set("animate", (!!canAnimate && isAnimatedAvatarDecoration(avatarDecoration.asset)).toString());
      return url.toString();
    } else if (avatarDecoration?.skuId === RAW_SKU_ID) {
      return avatarDecoration.asset;
    }
  });
}

export function stop(): void {
  inject.uninjectAll();
}
