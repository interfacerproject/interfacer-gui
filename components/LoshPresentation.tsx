import { useTranslation } from "next-i18next";
import { EconomicResource } from "../lib/types";

const LoshPresentation = ({
  economicResource,
  goToClaim,
}: {
  economicResource?: EconomicResource;
  goToClaim?: () => void;
}) => {
  const { t } = useTranslation("ResourceProps");
  return (
    <>
      {economicResource && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
          <div className="md:col-start-2 md:col-end-7">
            <h2>{economicResource.name}</h2>
            <p className="mb-1 text-gray-500">{economicResource.note}</p>
            <p className="text-gray-500">
              This is a{/* {mapUnit(data?.economicResource.onhandQuantity?.hasUnit.label)} */}
              <span className="text-primary">
                {economicResource.conformsTo && `${economicResource.conformsTo.name}`}
              </span>
            </p>
          </div>

          <div className="md:col-start-8 md:col-end-13">
            <div>
              <h4>{t("assigned to:")}</h4>
              <p className="text-gray-500">{economicResource.primaryAccountable?.name}</p>
            </div>
            <div>
              <h4>{t("current location:")}</h4>
              <p className="text-gray-500">{economicResource.currentLocation?.name}</p>
            </div>
            {goToClaim && (
              <div className="md:w-3/5 px-0.5 md:px-0">
                <button className="px-20 mb-4 btn btn-accent btn-block" onClick={goToClaim}>
                  {t("Claim Ownership")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoshPresentation;
