import { ApolloQueryResult, OperationVariables } from "@apollo/client";
import { Button, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { CheckmarkFilled, View, ViewOff, WarningAltFilled } from "@carbon/icons-react";
import { useAuth } from "hooks/useAuth";
import useAutoimport from "hooks/useAutoimport";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import devLog from "lib/devLog";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { Dispatch, useState } from "react";

declare type Color = "success" | "critical" | "warning" | "subdued" | "text-inverse";
const OshLine = ({
  stats,
  name,
  project,
  setOshRatings,
}: {
  stats: any;
  name: string;
  project: EconomicResource;
  setOshRatings: Dispatch<any>;
}) => {
  const { t } = useTranslation();
  const { updateMetadata } = useProjectCRUD();
  const stat = stats[name];
  const percentageHighlights = () => {
    if (stat.percent < 50)
      return { icon: <WarningAltFilled className="inline mb-1 ml-1" color="critical" />, color: "critical" };
    else if (stat.percent >= 50 && stat.percent < 70)
      return { icon: <WarningAltFilled center-align className="inline mb-1 ml-1" color="warning" />, color: "warning" };
    else
      return { icon: <CheckmarkFilled center-align className="inline mb-1 ml-1" color="success" />, color: "success" };
  };
  const { icon, color } = percentageHighlights();

  const handleShow = async () => {
    const ratingsToUpdate = { ...stats, [name]: { ...stat, show: !stat.show } };
    await updateMetadata(project, { ratings: ratingsToUpdate });
    setOshRatings(ratingsToUpdate);
  };
  return (
    <div className="m-2 mr-0 py-1">
      <Stack vertical spacing="loose">
        <div className="flex flex-between">
          <div className="flex-grow">
            <Text as="p" variant="bodyMd">
              {t(stat.name)}
            </Text>
            <Text as="p" variant="bodyMd" color={color as Color}>
              {stat.percent}
              {"%"}
              {icon}
            </Text>
          </div>
          <div className="flex-shrink pt-1">
            <Button
              id="seeRelations"
              size="slim"
              icon={stat.show ? <View /> : <ViewOff />}
              fullWidth
              onClick={handleShow}
            >
              {t(stat.show ? "Show" : "Hide")}
            </Button>
          </div>
        </div>
      </Stack>
    </div>
  );
};

const OshTool = ({
  project,
  refetch,
}: {
  project: EconomicResource;
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<{ economicResource: EconomicResource }>>;
}) => {
  const [oshRatings, setOshRatings] = useState<any>(project?.metadata?.ratings);
  const { t } = useTranslation();
  const { analyzeRepository } = useAutoimport();
  const { updateMetadata } = useProjectCRUD();
  const { user } = useAuth();
  const isOwner = user?.ulid === project.primaryAccountable.id;
  const handleAnalyze = async () => {
    const result = await analyzeRepository("https://github.com/dyne/zenflows-gui");
    if (result?.stats) {
      const { stats } = result;
      const { ratings } = stats;
      let ratingsToUpdate: any = {};
      if (oshRatings) {
        for (const key of Object.keys(oshRatings)) {
          ratingsToUpdate[key] = { ...ratings[key], show: Boolean(oshRatings[key].show) };
        }
      } else {
        Object.keys(ratings).map((n: string) => (ratingsToUpdate[n] = { ...ratings[n], show: false }));
      }
      await updateMetadata(project, { ratings: ratingsToUpdate });
      setOshRatings(ratingsToUpdate);
      await refetch();
    }
  };

  return (
    <>
      {(oshRatings || isOwner) && (
        <>
          <Card sectioned>
            <Stack vertical spacing={"loose"}>
              <Text as="h2" variant="heading2xl">
                {t("Open Know How")}
              </Text>
              {isOwner && (
                <Stack vertical spacing="loose">
                  <Text as="p" variant="bodyMd">
                    {t(
                      "The OKH checker is a tool that verifies whether a hardware design aligns with the Open Know How specification, ensuring that it follows standardized documentation and metadata practices for open hardware designs"
                    )}
                  </Text>
                  <div className="border rounded-sm bg-[#FAFAFA]">
                    {oshRatings &&
                      Object.keys(oshRatings).map((n: string, i: number) => (
                        <OshLine stats={oshRatings} name={n} key={i} project={project} setOshRatings={setOshRatings} />
                      ))}
                  </div>
                  <Button primary id="seeRelations" size="large" fullWidth monochrome onClick={handleAnalyze}>
                    {t("Run checker")}
                  </Button>
                </Stack>
              )}
              {!isOwner && (
                <Stack vertical spacing="extraTight">
                  {Object.keys(oshRatings).map(
                    (n: string, i: number) =>
                      oshRatings[n].show && <img src={oshRatings[n].badgeUrl} key={i} alt={oshRatings[n].name} />
                  )}
                </Stack>
              )}
            </Stack>
          </Card>
        </>
      )}
    </>
  );
};

export default OshTool;
