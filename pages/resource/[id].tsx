import { gql, useQuery } from "@apollo/client";
import type { NextPage } from "next";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Card from "../../components/brickroom/Card";
import Spinner from "../../components/brickroom/Spinner";

const Resource: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("ResourceProps");

  const QUERY_RESOURCE = gql`
    query ($id: ID!) {
      economicResource(id: $id) {
        id
        name
        note
        conformsTo {
          id
          name
        }
        onhandQuantity {
          hasUnit {
            id
            symbol
            label
          }
          hasNumericalValue
        }
        accountingQuantity {
          hasUnit {
            label
            symbol
          }
          hasNumericalValue
        }
        primaryAccountable {
          id
          name
        }
        currentLocation {
          name
          mappableAddress
        }
        primaryAccountable {
          id
          name
        }
      }
    }
  `;
  const { loading, data } = useQuery(QUERY_RESOURCE, { variables: { id: id } });

  return (
    <div>
      {loading && <Spinner />}
      {!loading && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
          <div className="md:col-start-2 md:col-end-7">
            <h2>{data?.economicResource.name}</h2>
            <p className="mb-1 text-gray-500">{data?.economicResource.note}</p>
            <p className="text-gray-500">
              This is a{/* {mapUnit(data?.economicResource.onhandQuantity?.hasUnit.label)} */}
              <span className="text-primary">
                {data?.economicResource.conformsTo && `${data?.economicResource.conformsTo.name}`}
              </span>
            </p>
          </div>

          <div className="md:col-start-8 md:col-end-13">
            <div>
              <h4>{t("assigned to:")}</h4>
              <p className="text-gray-500">{data?.economicResource.primaryAccountable?.name}</p>
            </div>
            <div>
              <h4>{t("current location:")}</h4>
              <p className="text-gray-500">{data?.economicResource.currentLocation?.name}</p>
            </div>
          </div>

          {/* <div className="my-3">
                <ActionsBlock resourceId={String(id)}/>
            </div> */}
          <div className="my-3 md:col-start-2 md:col-end-7">
            <Card className="w-128">
              <h2>Material passport</h2>
              <p className="text-gray-500">{t("description:")}</p>
              {/* <div className="w-40 mt-2">
                            <QrCodeButton id={String(id)}/>
                        </div> */}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["ResourceProps"])),
    },
  };
}

export default Resource;
