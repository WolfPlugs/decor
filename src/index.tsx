import { Injector, common, webpack, Logger, components } from "replugged";
import {
  subscriptions as UserDecorationsStoreSubscriptions,
  useUserDecorAvatarDecoration,
  useUsersDecorationsStore,
} from "./lib/stores/UserDecorationsStore";
import { CDN_URL, RAW_SKU_ID, SKU_ID } from "./lib/constants";
import DecorSection from "./ui/components/DecorSection";
import { Margins } from "./ui/modals/ChangeDecorationModal";
import { Link } from "./ui/components/Link";

import "./style.css"
const { users, fluxDispatcher } = common;
const { FormText } = components;

const AvatarURL = webpack.getByProps("getUserAvatarURL");
const { isAnimatedAvatarDecoration } = webpack.getByProps("isAnimatedAvatarDecoration");
const modals = webpack.getByProps("openModalLazy");

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
      const { asset } = store.get(res.id) ?? {};

      if (!asset || res.avatarDecoration?.skuId == SKU_ID) return res;

      Object.defineProperty(res, "avatarDecoration", {
        get: () => {
          return { asset: asset, skuId: SKU_ID };
        },
      });
      Object.defineProperty(res, "avatarDecorationData", {
        get: () => {
          return { asset: asset, skuId: SKU_ID };
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
    const store = useUsersDecorationsStore.getState();
    if (args[0].name === "profilePremiumFeatures" && store.has(args[1]?.id)?.asset) return true;
    return res;
  });
}

export { Settings } from "./Settings";

export function stop(): void {
  inject.uninjectAll();
}
