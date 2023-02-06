// Logic
import { useTranslation } from "next-i18next";
import { useState } from "react";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects, { SearchedProject } from "components/SearchProjects";
import { EconomicResource } from "lib/types";

//

export type Values = Array<Partial<EconomicResource>>;

export interface Props {
  onUpdate?: (projects: Values) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  media?: React.ReactElement;
}

//

export default function RelationsStep(props: Props) {
  const { onUpdate = () => {} } = props;
  const { t } = useTranslation();

  const [selection, setSelection] = useState<Array<SearchedProject>>([]);
  const excludeIDs = selection.map(item => item.id);

  //

  function handleSelect(value: SearchedProject) {
    setSelection([...selection, value]);
  }

  function removeSelected(id: string) {
    const newSelection = selection.filter(item => item.id !== id);
    setSelection(newSelection);
  }

  onUpdate(selection as Values);

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Relations")} subtitle={t("Please read our Documentation Guidelines.")} />

      <SearchProjects onSelect={handleSelect} excludeIDs={excludeIDs} />

      {selection.length && (
        <Stack vertical spacing="tight">
          <Text variant="bodyMd" as="p">
            {t("Selected projects")}
          </Text>
          {selection.map(project => (
            <PCardWithAction
              key={project.id}
              onClick={() => {
                removeSelected(project.id);
              }}
            >
              {/* @ts-ignore */}
              <ProjectDisplay project={project} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
