import { common, components, webpack, types } from "replugged";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import { cl, requireCreateStickerModal } from "..";
import { GUILD_ID, INVITE_KEY } from "../../lib/constants";
import { openInviteModal } from "./openInviteModal";
import { Link } from "../components/Link";
import { Margins } from "../../Settings";
import { AvatarDecorationModalPreview } from "../components";

const { React, users, guilds, fluxDispatcher, modal: { openModal } } = common;
const { Modal: { ModalRoot, ModalHeader, ModalCloseButton, ModalContent, ModalFooter }, Text, FormItem, FormNotice, FormText, Button } = components;

const modals = webpack.getByProps("openModalLazy");
const FileUpload = webpack.getBySource("uploadInput,")

export const NavigationRouter = webpack.getBySource("transitionTo - Transitioning to ") as unknown;



function useObjectURL(object: Blob | MediaSource | null) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
      if (!object) return;

      const objectUrl = URL.createObjectURL(object);
      setUrl(objectUrl);

      return () => {
          URL.revokeObjectURL(objectUrl);
          setUrl(null);
      };
  }, [object]);

  return url;
}


export default function CreateDecorationModal(props) {
  const [name, setName] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
      if (error) setError(null);
  }, [file]);

  const { create: createDecoration } = useCurrentUserDecorationsStore();

  const fileUrl = useObjectURL(file);

  const decoration = useMemo(() => fileUrl ? { asset: fileUrl, skuId: RAW_SKU_ID } : null, [fileUrl]);

  return <ModalRoot
      {...props}
      size={ModalSize.MEDIUM}
      className={DecorationModalStyles.modal}
  >
      <ModalHeader separator={false} className={cl("modal-header")}>
          <Text
              color="header-primary"
              variant="heading-lg/semibold"
              tag="h1"
              style={{ flexGrow: 1 }}
          >
              Create Decoration
          </Text>
          <ModalCloseButton onClick={props.onClose} />
      </ModalHeader>
      <ModalContent
          className={cl("create-decoration-modal-content")}
          scrollbarType="none"
      >
          <div className={cl("create-decoration-modal-form-preview-container")}>
              <div className={cl("create-decoration-modal-form")}>
                  {error !== null && <Text color="text-danger" variant="text-xs/normal">{error.message}</Text>}
                  <FormText.DEFAULT title="File">
                      <FileUpload
                          filename={file?.name}
                          placeholder="Choose a file"
                          buttonText="Browse"
                          filters={[{ name: "Decoration file", extensions: ["png", "apng"] }]}
                          onFileSelect={setFile}
                      />
                      <FormText.DESCRIPTION type="description" className={Margins.top8}>
                          File should be APNG or PNG.
                      </FormText.DESCRIPTION>
                  </FormText.DEFAULT>
                  <FormText.DEFAULT title="Name">
                      <TextInput
                          placeholder="Companion Cube"
                          value={name}
                          onChange={setName}
                      />
                      <FormText.DESCRIPTION type="description" className={Margins.top8}>
                          This name will be used when referring to this decoration.
                      </FormText.DESCRIPTION>
                  </FormText.DEFAULT>
              </div>
              <div>
                  <AvatarDecorationModalPreview
                      avatarDecorationOverride={decoration}
                      user={users.getCurrentUser()}
                  />
              </div>
          </div>
          <FormText.DESCRIPTION type="description" className={Margins.bottom16}>
              Make sure your decoration does not violate <Link
                  href="https://github.com/decor-discord/.github/blob/main/GUIDELINES.md"
              >
                  the guidelines
              </Link> before creating your decoration.
              <br />You can receive updates on your decoration's review by joining <Link
                  href={`https://discord.gg/${INVITE_KEY}`}
                  onClick={async e => {
                      e.preventDefault();
                      if (!guilds.getGuild(GUILD_ID)) {
                          const inviteAccepted = await openInviteModal(INVITE_KEY);
                          if (inviteAccepted) {
                              modals.closeAllModals();
                              fluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                          }
                      } else {
                        modals.closeAllModals();
                          fluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                          NavigationRouter.transitionToGuild(GUILD_ID);
                      }
                  }}
              >
                  Decor's Discord server
              </Link>.
          </FormText.DESCRIPTION>
      </ModalContent>
      <ModalFooter className={cl("modal-footer")}>
          <Button
              onClick={() => {
                  setSubmitting(true);
                  createDecoration({ alt: name, file: file! })
                      .then(props.onClose).catch(e => { setSubmitting(false); setError(e); });
              }}
              disabled={!file || !name}
              submitting={submitting}
          >
              Create
          </Button>
          <Button
              onClick={props.onClose}
              color={Button.Colors.PRIMARY}
              look={Button.Looks.LINK}
          >
              Cancel
          </Button>
      </ModalFooter>
  </ModalRoot>;
}


export const openCreateDecorationModal = () =>
    Promise.all([requireAvatarDecorationModal(), requireCreateStickerModal()])
        .then(() => openModal(props => <CreateDecorationModal {...props} />));
