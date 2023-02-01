// Logic
import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SearchUsers from "components/SearchUsers";
import { Agent } from "lib/types";

//

export interface SelectOption {
  value: string;
  label: string;
  media?: React.ReactElement;
}

export interface Props {
  onSubmit?: (contributorsIDs: Array<string>) => void;
}

//

export default function ContributorsStep(props: Props) {
  const { onSubmit = () => {} } = props;
  const { t } = useTranslation();

  const [selection, setSelection] = useState<Array<Agent>>([]);
  const excludeIDs = selection.map(item => item.id);

  function handleSelect(selected: Agent) {
    setSelection([...selection, selected]);
  }

  function removeSelected(id: string) {
    const newSelection = selection.filter(item => item.id !== id);
    setSelection(newSelection);
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Contributors")} subtitle={t("Tell us who contributed to this project.")} />

      <SearchUsers onSelect={handleSelect} excludeIDs={excludeIDs} />

      {selection.length && (
        <Stack vertical spacing="tight">
          <Text variant="bodyMd" as="p">
            {t("Selected contributors")}
          </Text>
          {selection.map(contributor => (
            <PCardWithAction
              key={contributor.id}
              onClick={() => {
                removeSelected(contributor.id);
              }}
            >
              <BrUserDisplay user={contributor} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
