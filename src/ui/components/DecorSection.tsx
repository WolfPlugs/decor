import { webpack, common, components } from "replugged";
import { authorizationStore } from "../../lib/stores/AuthorizationStore";
import { useCurrentUserDecorationsStore } from "../../lib/stores/CurrentUserDecorationsStore";
import { cl } from "..";
import { openChangeDecorationModal } from "../modals/ChangeDecorationModal";

const { React } = common;
const { Flex, Button } = components;
let CustomizationSection;

interface DecorSectionProps {
  hideTitle?: boolean;
  hideDivider?: boolean;
  noMargin?: boolean;
}

export default function DecorSection({
  hideTitle = false,
  hideDivider = false,
  noMargin = false,
}: DecorSectionProps) {
  CustomizationSection ??= webpack.getBySource(".customizationSectionBackground");
  const {
    selectedDecoration,
    select: selectDecoration,
    fetch: fetchDecorations,
  } = useCurrentUserDecorationsStore();

  React.useEffect(() => {
    if (authorizationStore.isAuthorized()) fetchDecorations();
  }, [authorizationStore.token]);

  return (
    <CustomizationSection
      title={!hideTitle && "Decor"}
      hasBackground={true}
      hideDivider={hideDivider}
      className={noMargin && cl("section-remove-margin")}>
      <Flex>
        <Button
          onClick={() => {
            if (!authorizationStore.isAuthorized()) {
              authorizationStore.authorize();
              openChangeDecorationModal();
            } else openChangeDecorationModal();
            // openChangeDecorationModal();
          }}
          size={Button.Sizes.SMALL}>
          Change Decoration
        </Button>
        {selectedDecoration && authorizationStore.isAuthorized() && (
          <Button
            onClick={() => selectDecoration(null)}
            color={Button.Colors.PRIMARY}
            size={Button.Sizes.SMALL}
            look={Button.Looks.LINK}>
            Remove Decoration
          </Button>
        )}
      </Flex>
    </CustomizationSection>
  );
}
