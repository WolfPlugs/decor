import { AvatarDecoration } from "../..";
import { Decoration } from "../api";
import { SKU_ID } from "../constants";
import decorationToString from "./decorationToString";

export function decorationToAvatarDecoration(decoration: Decoration): AvatarDecoration {
  return { asset: decorationToString(decoration), skuId: SKU_ID };
}
