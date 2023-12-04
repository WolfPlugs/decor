import { common, webpack } from "replugged";
import type { ComponentType, HTMLProps, PropsWithChildren } from "react";
import { AvatarDecoration } from "../..";

const { React }  = common

type DecorationGridItemComponent = ComponentType<PropsWithChildren<HTMLProps<HTMLDivElement>> & {
  onSelect: () => void,
  isSelected: boolean,
}>;

type DecorationGridDecorationComponent = React.ComponentType<HTMLProps<HTMLDivElement> & {
  avatarDecoration: AvatarDecoration;
  onSelect: () => void,
  isSelected: boolean,
}>;

export const AvatarDecorationModalPreview = () => {
  const component = webpack.getBySource("AvatarDecorationModalPreview");
  return React.memo(component);
};

export let DecorationGridItem: DecorationGridItemComponent;
export let DecorationGridDecoration: DecorationGridDecorationComponent;
