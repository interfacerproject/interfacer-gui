import { LinkIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import MdParser from "../lib/MdParser";
import { EconomicResource } from "../lib/types";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTags from "./brickroom/BrTags";

const LoshPresentation = ({
  economicResource,
  goToClaim,
}: {
  economicResource?: EconomicResource;
  goToClaim?: () => void;
}) => {
  const { t } = useTranslation("ResourceProps");
  const m = economicResource?.metadata;
  return (
    <>
      {economicResource && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
          <div className="md:col-start-2 md:col-end-7">
            <h2>{economicResource.name}</h2>
            <p className="pt-4 text-gray-500">
              {t("This is a &nbsp; {{type}}", { type: economicResource.conformsTo })}
              <Link href={`/resources`}>
                <a className="text-primary">{t("Losh asset")}</a>
              </Link>
            </p>
            <span className="pt-4 text-primary">{t("ID: {{id}}", { id: economicResource.id })}</span>
            {m && (
              <>
                <div className="pt-12 text-primary">
                  <Link href={m.repo}>
                    <a target="_blank" className="flex items-center">
                      <LinkIcon className="h-4" /> {t("&nbsp;")} {m.repo}
                    </a>
                  </Link>
                </div>
                <div className="pt-12 prose" dangerouslySetInnerHTML={{ __html: MdParser.render(m.function) }} />
                <img src={m.image} className="w-full py-10" alt="" />
                <BrTags tags={m.tags} />
              </>
            )}
          </div>

          <div className="md:col-start-8 md:col-end-13">
            <div className="flex flex-col">
              <span className="font-semibold">{m?.license}</span>
              <span className="italic text-primary">
                {t("by")} {m?.licensor}
              </span>

              <span className="pt-8">{t("Version: {{version}}", { version: m?.version })}</span>
              <span className="pt-8">
                {t("Version:")} {m?.version}
              </span>
              {m?.okhv}

              {goToClaim && (
                <>
                  <button type="button" className="mt-16 mr-8 w-72 btn btn-accent" onClick={goToClaim}>
                    {t("Claim ownership")}
                  </button>
                  <button type="button" className="mt-3 mr-8 w-72 btn btn-outline">
                    {t("add to list +")}
                  </button>
                </>
              )}
              <span className="pt-9">{t("Owner")}</span>
              <BrDisplayUser
                id={economicResource.primaryAccountable.id}
                name={economicResource.primaryAccountable.name}
                location={economicResource.currentLocation?.name}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoshPresentation;
