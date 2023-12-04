import { components, common } from "replugged";
import { cl } from "..";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import { Decoration } from "../../lib/api";
import { CopyIcon, DeleteIcon } from "./Icons";

const { ContextMenu: Menu } = components
const { contextMenu: ContextMenuApi, users } = common


export default function DecorationContextMenu({ decoration }: { decoration: Decoration; }) {
  const { delete: deleteDecoration } = useCurrentUserDecorationsStore();

  return <Menu.Menu
      navId={cl("decoration-context-menu")}
      onClose={ContextMenuApi.close}
      aria-label="Decoration Options"
  >
      <Menu.MenuItem
          id={cl("decoration-context-menu-copy-hash")}
          label="Copy Decoration Hash"
          icon={CopyIcon}
          action={() => DiscordNative.clipboard.copy(decoration.hash)}
      />
      {decoration.authorId === users.getCurrentUser().id &&
          <Menu.MenuItem
              id={cl("decoration-context-menu-delete")}
              label="Delete Decoration"
              color="danger"
              icon={DeleteIcon}
              action={() => Alerts.show({
                  title: "Delete Decoration",
                  body: `Are you sure you want to delete ${decoration.alt}?`,
                  confirmText: "Delete",
                  confirmColor: cl("danger-btn"),
                  cancelText: "Cancel",
                  onConfirm() {
                      deleteDecoration(decoration);
                  }
              })}
          />
      }
  </Menu.Menu>;
}
