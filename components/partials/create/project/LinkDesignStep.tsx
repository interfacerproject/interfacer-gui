import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects, { SearchedProject } from "components/SearchProjects";
import { EconomicEvent } from "lib/types";
import { useTranslation } from "next-i18next";
import { useState } from "react";

//

export type Values = Partial<EconomicEvent> | null;

export interface Props {
  onChange?: (values: Values) => void;
}

//

export default function LinkDesign(props: Props) {
  const { t } = useTranslation();
  const { onChange = () => {} } = props;

  const [selected, setSelected] = useState<Values>(null);

  function handleSelect(value: SearchedProject) {
    setSelected(value as Partial<EconomicEvent>);
  }
  function handleRemove() {
    setSelected(null);
  }

  onChange(selected);

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Design source")} subtitle={t("Tell us from which design your product is based on.")} />

      <SearchProjects label="Search for a design" conformsTo={["design"]} onSelect={handleSelect} />

      {selected && (
        <Stack vertical spacing="extraTight">
          <Text as="p" variant="bodyMd">
            {t("Linked design")}
          </Text>
          <PCardWithAction onClick={handleRemove}>
            {/* @ts-ignore */}
            <ProjectDisplay project={selected} />
          </PCardWithAction>
        </Stack>
      )}
    </Stack>
  );
}
