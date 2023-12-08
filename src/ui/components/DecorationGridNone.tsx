import { HTMLProps } from "react";
import { DecorationGridItem } from ".";
import { NoEntrySignIcon } from "./Icons";
import { components, common } from "replugged";

const { i18n } = common;
const { Text } = components;

type DecorationGridNoneProps = HTMLProps<HTMLDivElement> & {
  isSelected: boolean;
  onSelect: () => void;
};

export default function DecorationGridNone(props: DecorationGridNoneProps) {
  console.log(DecorationGridItem, NoEntrySignIcon, Text);
  return (
    <DecorationGridItem {...props}>
      <NoEntrySignIcon />
      <Text variant="text-xs/normal" color="header-primary">
        {i18n.Messages.NONE}
      </Text>
    </DecorationGridItem>
  );
}
