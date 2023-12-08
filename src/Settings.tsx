import { common, components, webpack } from "replugged";
import { Link } from "./ui/components/Link";
import DecorSection from "./ui/components/DecorSection";

export const Margins: Record<`${"top" | "bottom" | "left" | "right"}${8 | 16 | 20}`, string> = {} as any;

const { FormText } = components;
const { fluxDispatcher } = common;

const modals = webpack.getByProps("openModalLazy");


export function Settings() {
  return (
    <div>
      <DecorSection hideTitle hideDivider noMargin />
      <FormText.DESCRIPTION className={[Margins.top8, Margins.bottom8]}>
        You can also access Decor decorations from the <Link
          href="/settings/profile-customization"
          onClick={e => { 
            e.preventDefault();
            modals.closeAllModals();
            fluxDispatcher.dispatch({ type: "USER_SETTINGS_MODAL_SET_SECTION", section: "Profile Customization" });
          }}
        >Profiles</Link> PAGE.
      </FormText.DESCRIPTION>
    </div>
  )
}
