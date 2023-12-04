import { webpack, common, components } from "replugged";
import { useAuthorizationStore } from "../../lib/stores/AuthorizationStore";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import { cl } from "..";
import { openChangeDecorationModal } from "../modals/ChangeDecorationModal";

const { React } = common
const { Flex, Button } = components
const CustomizationSection = webpack.getBySource(".customizationSectionBackground");


interface DecorSectionProps {
  hideTitle?: boolean;
  hideDivider?: boolean;
  noMargin?: boolean;
}


export default function DecorSection({ hideTitle = false, hideDivider = false, noMargin = false }: DecorSectionProps) {

  const authorization = useAuthorizationStore();
  const { selectedDecoration, select: selectDecoration, fetch: fetchDecorations } = useCurrentUserDecorationsStore();
  
  React.useEffect(() => {
    if (authorization.isAuthorized()) fetchDecorations();
  }, [authorization.token]);

  return <CustomizationSection
    title={!hideTitle && "Decor"}
    hasBackground={true}
    hideDivider={hideDivider}
    className={noMargin && cl("section-remove-margin")}
  >
    <Flex>
      <Button
        onClick={() => {
          if (!authorization.isAuthorized()) {
            authorization.authorize().then(openChangeDecorationModal).catch(() => { });
          } else openChangeDecorationModal();
          // openChangeDecorationModal();
        }}
        size={Button.Sizes.SMALL}
      >
        Change Decoration
      </Button>
      {selectedDecoration && authorization.isAuthorized() && <Button
        onClick={() => selectDecoration(null)}
        color={Button.Colors.PRIMARY}
        size={Button.Sizes.SMALL}
        look={Button.Looks.LINK}
      >
        Remove Decoration
      </Button>}
    </Flex>
  </CustomizationSection>
}
