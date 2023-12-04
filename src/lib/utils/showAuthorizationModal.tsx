import { webpack, common } from "replugged"
import { useAuthorizationStore } from "../stores/AuthorizationStore";
import { AUTHORIZE_URL, CLIENT_ID } from "../constants";
import { logger } from "../..";

const { modal: { openModal } } = common
const OAuth = webpack.getByProps("OAuth2AuthorizeModal")

export default async () => new Promise(r => openModal(props =>
    <OAuth.OAuth2AuthorizeModal
        {...props}
        scopes={["identify"]}
        responseType="code"
        redirectUri={AUTHORIZE_URL}
        permissions={0n}
        clientId={CLIENT_ID}
        cancelCompletesFlow={false}
        callback={async (response: any) => {
            try {
                const url = new URL(response.location);
                url.searchParams.append("client", "replugged");

                const req = await fetch(url);

                if (req?.ok) {
                    const token = await req.text();
                    useAuthorizationStore.getState().setToken(token);
                } else {
                    throw new Error("Request not OK");
                }
                r(void 0);
            } catch (e) {
                logger.error("Decor: Failed to authorize", e);
            }
        }}
    />
))


