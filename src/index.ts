import { Injector, common, webpack, Logger } from "replugged";
import {
  subscriptions as UserDecorationsStoreSubscriptions,
  useUserDecorAvatarDecoration,
  useUsersDecorationsStore,
} from "./lib/stores/UserDecorationsStore";
import { CDN_URL, RAW_SKU_ID, SKU_ID } from "./lib/constants";

const { users } = common;
const AvatarURL = webpack.getByProps("getUserAvatarURL");
const { isAnimatedAvatarDecoration } = webpack.getByProps("isAnimatedAvatarDecoration");
const inject = new Injector();

export const logger = Logger.plugin("UserDecorations");
export interface AvatarDecoration {
  asset: string;
  skuId: string;
}

export async function start(): Promise<void> {
  useUserDecorAvatarDecoration;
  UserDecorationsStoreSubscriptions;

  inject.after(users, "getUser", (_, res) => {
    const store = useUsersDecorationsStore.getState();

    if (res && store.has(res?.id)) {
      const decor = store.get(res.id);

      if (decor && res.avatarDecoration?.skuId !== SKU_ID) {
        Object.defineProperty(res, "avatarDecoration", {
          get: () => {
            return { asset: decor.asset, skuId: SKU_ID };
          },
        });
      } else if (!decor && res.avatarDecoration && res.avatarDecoration?.skuId === SKU_ID) {
        //res.avatarDecoration = null;
      }
      Object.defineProperty(res, "avatarDecorationData", {
        get: () => {
          return { asset: decor.asset, skuId: SKU_ID };
        },
      });
    }

    return res;
  });

  inject.instead(AvatarURL, "getAvatarDecorationURL", (args, res) => {
    const [{ avatarDecoration, canAnimate }] = args;
    if (avatarDecoration?.skuId === SKU_ID) {
      const url = new URL(`${CDN_URL}/${avatarDecoration.asset}.png`);
      url.searchParams.set(
        "animate",
        (!!canAnimate && isAnimatedAvatarDecoration(avatarDecoration.asset ?? "")).toString(),
      );
      return url.toString();
    } else if (avatarDecoration?.skuId === RAW_SKU_ID) {
      return avatarDecoration.asset;
    }
  });

  inject.after(webpack.getByProps("canUserUse"), "canUserUse", (args, res, instance) => {
    if (args[0].name === "profilePremiumFeatures") return true;
    return res;
  });
}

export function stop(): void {
  inject.uninjectAll();
}
