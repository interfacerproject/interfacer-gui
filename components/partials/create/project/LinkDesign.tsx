import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects, { SearchedProject } from "components/SearchProjects";
import { useTranslation } from "next-i18next";
import { useState } from "react";

//

export default function LinkDesign() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SearchedProject | null>(null);

  function handleSelect(value: SearchedProject) {
    setSelected(value);
  }

  function handleRemove() {
    setSelected(null);
  }

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Design source")}
        subtitle={t("Tell us from which design your product is based on.")}
        titleTag="h2"
      />
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
