import { common } from "replugged";
import { DecorationGridDecoration } from ".";
import { Decoration } from "../../lib/api";
import { decorationToAvatarDecoration } from "../../lib/utils/decorationToAvatarDecoration";
import DecorationContextMenu from "./DecorationContextMenu";


const { contextMenu: ContextMenuApi } = common;
interface DecorDecorationGridDecorationProps extends HTMLProps<HTMLDivElement> {
  decoration: Decoration;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DecorDecorationGridDecoration(props: DecorDecorationGridDecorationProps) {
  const { decoration } = props;

  return <DecorationGridDecoration
      {...props}
      onContextMenu={e => {
          ContextMenuApi.open(e, () => (
              <DecorationContextMenu
                  decoration={decoration}
              />
          ));
      }}
      avatarDecoration={decorationToAvatarDecoration(decoration)}
  />;
}
