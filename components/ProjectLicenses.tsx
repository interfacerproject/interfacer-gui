import { Text } from "@bbtgnn/polaris-interfacer";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import LicenseDisplay from "./LicenseDisplay";
import { LicenseStepValues } from "./partials/create/project/steps/LicenseStep";

const ProjectLicenses = ({ project }: { project: Partial<EconomicResource> }) => {
  const licenses: LicenseStepValues = project?.metadata?.licenses;
  const singleLicense = project?.license;
  const { t } = useTranslation("projectProps");

  // Show nothing if neither license type exists
  if (!licenses && !singleLicense) return null;

  return (
    <>
      <Text as="h3" variant="headingMd">
        {t("Licenses")}
      </Text>
      {/* Show single license from project.license */}
      {singleLicense && (
        <div className="pt-3">
          <LicenseDisplay licenseId={singleLicense} label="Main" />
        </div>
      )}
      {/* Show multiple licenses from metadata.licenses */}
      {licenses &&
        licenses.map((l, i) => (
          <div className="pt-3" key={i}>
            <LicenseDisplay licenseId={l.licenseId} label={l.scope} />
          </div>
        ))}
    </>
  );
};

export default ProjectLicenses;
