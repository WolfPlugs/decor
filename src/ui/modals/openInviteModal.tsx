import { webpack, common } from "replugged";

const { fluxDispatcher } = common;

const InviteActions = webpack.getByProps("resolveInvite");

export async function openInviteModal(code: string) {
  const { invite } = await InviteActions.resolveInvite(code, "Desktop Modal");
  if (!invite) throw new Error("Invalid invite: " + code);

  fluxDispatcher.dispatch({
      type: "INVITE_MODAL_OPEN",
      invite,
      code,
      context: "APP"
  });

  return new Promise<boolean>(r => {
      let onClose: () => void, onAccept: () => void;
      let inviteAccepted = false;

      fluxDispatcher.subscribe("INVITE_ACCEPT", onAccept = () => {
          inviteAccepted = true;
      });

      fluxDispatcher.subscribe("INVITE_MODAL_CLOSE", onClose = () => {
          fluxDispatcher.unsubscribe("INVITE_MODAL_CLOSE", onClose);
          fluxDispatcher.unsubscribe("INVITE_ACCEPT", onAccept);
          r(inviteAccepted);
      });
  });
}
