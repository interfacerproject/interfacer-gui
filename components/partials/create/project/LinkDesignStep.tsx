import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects from "components/SearchProjects";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useState } from "react";

//

export type LinkDesignStepData = Partial<EconomicResource> | null;

export interface Props {
  onChange?: (values: LinkDesignStepData) => void;
}

//

export default function LinkDesign(props: Props) {
  const { t } = useTranslation();
  const { onChange = () => {} } = props;

  const [selected, setSelected] = useState<LinkDesignStepData>(null);

  function handleSelect(value: Partial<EconomicResource>) {
    setSelected(value);
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
            <ProjectDisplay project={selected} />
          </PCardWithAction>
        </Stack>
      )}
    </Stack>
  );
}
