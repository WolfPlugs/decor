import { HTMLProps } from "react";
import { DecorationGridItem } from ".";
import { PlusIcon } from "./Icons";
import { components, common } from "replugged";

const { i18n } = common;
const { Text } = components;

type DecorationGridCreateProps = HTMLProps<HTMLDivElement> & {
  onSelect: () => void;
};

export default function DecorationGridCreate(props: DecorationGridCreateProps) {
  return <DecorationGridItem
      {...props}
      isSelected={false}
  >
      <PlusIcon />
      <Text.Normal
          variant="text-xs/normal"
          color="header-primary"
      >
          {i18n.Messages.CREATE}
      </Text.Normal>
  </DecorationGridItem >;
}
