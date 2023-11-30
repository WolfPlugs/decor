import { Decoration } from "../api";
import { SKU_ID } from "../constants";
import decorationToString from "./decorationToString";

export default (d: Decoration) => ({ asset: decorationToString(d), skuId: SKU_ID });
