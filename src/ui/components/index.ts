import { common, webpack } from "replugged";
import type { ComponentType, HTMLProps, PropsWithChildren } from "react";
import { AvatarDecoration } from "../..";
import Grid from "./Grid";
const { React } = common;

type DecorationGridItemComponent = ComponentType<
  PropsWithChildren<HTMLProps<HTMLDivElement>> & {
    onSelect: () => void;
    isSelected: boolean;
  }
>;

type DecorationGridDecorationComponent = React.ComponentType<
  HTMLProps<HTMLDivElement> & {
    avatarDecoration: AvatarDecoration;
    onSelect: () => void;
    isSelected: boolean;
  }
>;

export const AvatarDecorationModalPreview = React.memo(
  webpack.getBySource("AvatarDecorationModalPreview"),
);

export const DecorationGridItem: DecorationGridItemComponent = Grid;

export let DecorationGridDecoration: DecorationGridDecorationComponent;
export const setDecorationGridDecoration = (v) => (DecorationGridDecoration = v);
