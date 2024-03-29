import { webpack, common, components } from "replugged";
import { Decoration, Preset, getPresets } from "../../lib/api";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import { decorationToAvatarDecoration } from "../../lib/utils/decorationToAvatarDecoration";
import { cl } from "..";
import SectionedGridList from "../components/SectionedGridList";
import DecorationGridNone from "../components/DecorationGridNone";
import DecorationGridCreate from "../components/DecorationGridCreate";
import { NavigationRouter, openCreateDecorationModal } from "../modals/CreateDecorationModal";
import DecorDecorationGridDecoration from "../components/DecorDecorationGridDecoration";
import { authorizationStore } from "../../lib/stores/AuthorizationStore";
import { openInviteModal } from "./openInviteModal";
import { Margins } from "../../Settings";
import { AvatarDecorationModalPreview } from "../components";
import { GUILD_ID, INVITE_KEY } from "../../lib/constants";
import { User } from "discord-types/general";

const {
  React,
  users,
  parser,
  guilds,
  fluxDispatcher,
  modal: { openModal, confirm },
} = common;
const {
  FormText,
  Flex,
  Modal: { ModalRoot, ModalHeader, ModalCloseButton, ModalContent, ModalFooter },
  Text,
  Tooltip,
  Button,
  ErrorBoundary,
} = components;

const UserSummaryItem = webpack.getBySource("UserSummaryItem").default;
const DecorationModalStyles = webpack.getByProps("modalFooterShopButton");
const modals = webpack.getByProps("openModalLazy");

function usePresets() {
  const [presets, setPresets] = React.useState<Preset[]>([]);
  React.useEffect(() => {
    getPresets().then(setPresets);
  }, []);
  return presets;
}

interface Section {
  title: string;
  subtitle?: string;
  sectionKey: string;
  items: ("none" | "create" | Decoration)[];
  authorIds?: string[];
}

function SectionHeader({ section }: { section: Section }) {
  const hasSubtitle = typeof section.subtitle !== "undefined";
  const hasAuthorIds = typeof section.authorIds !== "undefined";

  const [authors, setAuthors] = React.useState<User[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!section.authorIds) return;

      for (const authorId of section.authorIds) {
        const author = users.getUser(authorId) ?? (await users.getUser(authorId));
        setAuthors((authors) => [...authors, author]);
      }
    })();
  }, [section.authorIds]);

  return (
    <div>
      <Flex>
        <FormText.DEFAULT style={{ flexGrow: 1 }}>{section.title}</FormText.DEFAULT>
        {hasAuthorIds && (
          <UserSummaryItem
            users={authors}
            guildId={undefined}
            renderIcon={false}
            max={5}
            showDefaultAvatarsForNullUsers
            size={16}
            showUserPopout
            className={Margins.bottom8}
          />
        )}
      </Flex>
      {hasSubtitle && (
        <FormText.DESCRIPTION type="description" className={Margins.bottom8}>
          {section.subtitle}
        </FormText.DESCRIPTION>
      )}
    </div>
  );
}

export default function ChangeDecorationModal(props: any) {
  // undefined = not trying, null = none, Decoration = selected
  const [tryingDecoration, setTryingDecoration] = React.useState<Decoration | null | undefined>(
    undefined,
  );
  const isTryingDecoration = typeof tryingDecoration !== "undefined";

  const avatarDecorationOverride =
    tryingDecoration != null ? decorationToAvatarDecoration(tryingDecoration) : tryingDecoration;

  const {
    decorations,
    selectedDecoration,
    fetch: fetchUserDecorations,
    select: selectDecoration,
  } = useCurrentUserDecorationsStore();

  React.useEffect(() => {
    fetchUserDecorations();
  }, []);

  const activeSelectedDecoration = isTryingDecoration ? tryingDecoration : selectedDecoration;
  const activeDecorationHasAuthor = typeof activeSelectedDecoration?.authorId !== "undefined";
  const hasDecorationPendingReview = decorations.some((d) => d.reviewed === false);

  const presets = usePresets();
  const presetDecorations = presets.flatMap((preset) => preset.decorations);

  const activeDecorationPreset = presets.find(
    (preset) => preset.id === activeSelectedDecoration?.presetId,
  );
  const isActiveDecorationPreset = typeof activeDecorationPreset !== "undefined";

  const ownDecorations = decorations.filter(
    (d) => !presetDecorations.some((p) => p.hash === d.hash),
  );

  const data = [
    {
      title: "Your Decorations",
      sectionKey: "ownDecorations",
      items: ["none", ...ownDecorations, "create"],
    },
    ...presets.map((preset) => ({
      title: preset.name,
      subtitle: preset.description ?? undefined,
      sectionKey: `preset-${preset.id}`,
      items: preset.decorations,
      authorIds: preset.authorIds,
    })),
  ] as Section[];

  return (
    <ModalRoot {...props} size="dynamic" className={DecorationModalStyles.modal}>
      <ErrorBoundary>
        <ModalHeader separator={false} className={cl("modal-header")}>
          <Text.H2
            color="header-primary"
            variant="heading-lg/semibold"
            tag="h1"
            style={{ flexGrow: 1 }}>
            Change Decoration
          </Text.H2>
          <ModalCloseButton onClick={props.onClose} />
        </ModalHeader>
        <ModalContent className={cl("change-decoration-modal-content")} scrollbarType="none">
          <SectionedGridList
          renderItem={item => {
            if (typeof item === "string") {
              switch (item) {
                case "none":
                  return <DecorationGridNone
                    className={cl("change-decoration-modal-decoration")}
                    isSelected={activeSelectedDecoration === null}
                    onSelect={() => setTryingDecoration(null)}
                  />;
                case "create":
                  return <Tooltip text="You already have a decoration pending review" shouldShow={hasDecorationPendingReview}>
                    {tooltipProps => <DecorationGridCreate
                      className={cl("change-decoration-modal-decoration")}
                      {...tooltipProps}
                      onSelect={!hasDecorationPendingReview ? openCreateDecorationModal : () => { }}
                    />}
                  </Tooltip>;
              }
            } else {
              return <Tooltip text={"Pending review"} shouldShow={item.reviewed === false}>
                {tooltipProps => (
                  <DecorDecorationGridDecoration
                    {...tooltipProps}
                    className={cl("change-decoration-modal-decoration")}
                    onSelect={item.reviewed !== false ? () => setTryingDecoration(item) : () => { }}
                    isSelected={activeSelectedDecoration?.hash === item.hash}
                    decoration={item}
                  />
                )}
              </Tooltip>;
            }
          }}
          getItemKey={item => typeof item === "string" ? item : item.hash}
          getSectionKey={section => section.sectionKey}
          renderSectionHeader={section => 
          <SectionHeader section={section} />
        }
          sections={data}
        />
          <div className={cl("change-decoration-modal-preview")}>
          <AvatarDecorationModalPreview
            avatarDecorationOverride={avatarDecorationOverride}
            user={users.getCurrentUser()}
          />
          {isActiveDecorationPreset && <Text tag="h3" className="p">Part of the {activeDecorationPreset.name} Preset</Text>}
          {typeof activeSelectedDecoration === "object" &&
            <Text.H2
              variant="text-sm/semibold"
              color="header-primary"
            >
              {activeSelectedDecoration?.alt}
            </Text.H2>
          }
          {activeDecorationHasAuthor && <Text key={`createdBy-${activeSelectedDecoration.authorId}`}>Created by {parser.parse(`<@${activeSelectedDecoration.authorId}>`)}</Text>}
        </div>
        </ModalContent>
        <ModalFooter className={[cl("change-decoration-modal-footer", cl("modal-footer"))]}>
          <div className={cl("change-decoration-modal-footer-btn-container")}>
            <Button
              onClick={() => {
                selectDecoration(tryingDecoration!).then(props.onClose);
              }}
              disabled={!isTryingDecoration}>
              Apply
            </Button>
            <Button onClick={props.onClose} color={Button.Colors.PRIMARY} look={Button.Looks.LINK}>
              Cancel
            </Button>
          </div>
          <div className={cl("change-decoration-modal-footer-btn-container")}>
            <Button
              onClick={() =>
                confirm({
                  title: "Log Out",
                  body: "Are you sure you want to log out of Decor?",
                  confirmText: "Log Out",
                  confirmColor: cl("danger-btn"),
                  cancelText: "Cancel",
                  onConfirm() {
                    authorizationStore.remove(users.getCurrentUser().id);
                    props.onClose();
                  },
                })
              }
              color={Button.Colors.PRIMARY}
              look={Button.Looks.LINK}>
              Log Out
            </Button>
            <Tooltip text="Join Decor's Discord Server for notifications on your decoration's review, and when new presets are released">
              {(tooltipProps) => (
                <Button
                  {...tooltipProps}
                  onClick={async () => {
                    if (!guilds.getGuild(GUILD_ID)) {
                      const inviteAccepted = await openInviteModal(INVITE_KEY);
                      if (inviteAccepted) {
                        modals.closeAllModals();
                        fluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                      }
                    } else {
                      props.onClose();
                      fluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                      NavigationRouter.transitionToGuild(GUILD_ID);
                    }
                  }}
                  color={Button.Colors.PRIMARY}
                  look={Button.Looks.LINK}>
                  Discord Server
                </Button>
              )}
            </Tooltip>
          </div>
        </ModalFooter>
      </ErrorBoundary>
    </ModalRoot>
  );
}

export const openChangeDecorationModal = () =>
  openModal((props) => <ChangeDecorationModal {...props} />);
