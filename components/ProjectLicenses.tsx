import { Text } from "@bbtgnn/polaris-interfacer";
import useFilters from "hooks/useFilters";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import LicenseDisplay from "./LicenseDisplay";
import { LicenseStepValues } from "./partials/create/project/steps/LicenseStep";

const ProjectLicenses = ({ project }: { project: EconomicResource }) => {
  const licenses: LicenseStepValues = project?.metadata?.licenses;
  const { t } = useTranslation("projectProps");

  return (
    <>
      {licenses && (
        <>
          <Text as="h3" variant="headingLg">
            {t("Licenses")}
          </Text>
          {licenses.map((l, i) => (
            <div className="pt-3" key={i}>
              <LicenseDisplay licenseId={l.licenseId} label={l.scope} />
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default ProjectLicenses;
