import { LicenseStepValues } from "components/partials/create/project/steps/LicenseStep";
import { capitalizeFirstLetter } from "lib/capitalizeString";
import { getLicenseById } from "lib/licenses/utils";

// Components
import { Link, Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";

//

export interface LicensesDisplayProps {
  scopedLicenses: LicenseStepValues;
}

export default function LicensesDisplay(props: LicensesDisplayProps) {
  const { t } = useTranslation();
  const { scopedLicenses } = props;
  const licensesData = scopedLicenses.map(sl => {
    const license = getLicenseById(sl.licenseId);
    return {
      name: license!.name,
      scope: sl.scope,
      reference: license!.reference,
      id: sl.licenseId,
    };
  });

  return (
    <>
      {licensesData.length != 0 && (
        <table>
          {licensesData.map(ld => {
            return (
              <tr key={ld.id} className="border-1 border-border-subdued">
                <td className="px-2 py-1 align-top">
                  <Text as="span" variant="bodySm" fontWeight="bold">
                    {capitalizeFirstLetter(ld.scope)}
                  </Text>
                </td>
                <td className="px-2 py-1">
                  <p className="space-x-1 whitespace-normal">
                    <Text as="span" variant="bodySm">
                      {ld.name}
                    </Text>
                    <Text as="span" variant="bodySm">
                      <Link url={ld.reference} external>
                        <span className="text-text-primary">{"[↗]"}</span>
                      </Link>
                    </Text>
                  </p>
                </td>
              </tr>
            );
          })}
        </table>
      )}

      {licensesData.length == 0 && (
        <div className="border-1 border-border-subdued px-2 py-1">{t("No licenses found")}</div>
      )}
    </>
  );
}
