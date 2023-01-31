// Logic
import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SearchProjects from "components/SearchProjects";

//

export interface Props {
  onSubmit?: (contributorsIDs: Array<string>) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  media?: React.ReactElement;
}

//

export default function RelationsStep(props: Props) {
  const { onSubmit = () => {} } = props;
  const { t } = useTranslation();

  const [selection, setSelection] = useState<Array<string>>([]);

  //

  function handleSelect(value: string) {
    setSelection([...selection, value]);
    console.log(selection);
  }

  // function updateSelection(selected: Array<string>) {
  //   const id = selected[0];
  //   if (!id) return;
  //   const agent = getAgentFromData(id);
  //   if (!agent) return;
  //   setSelection([...selection, agent]);
  // }

  // function removeSelected(id: string) {
  //   const newSelection = selection.filter(item => item.id !== id);
  //   setSelection(newSelection);
  // }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Relations")} subtitle={t("Please read our Documentation Guidelines.")} />

      <SearchProjects onSelect={handleSelect} excludeIDs={selection} />

      <pre>{JSON.stringify(selection)}</pre>

      {/* {selection.length && (
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
      )} */}
    </Stack>
  );
}
