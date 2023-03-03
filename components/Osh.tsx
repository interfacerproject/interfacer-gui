import { ApolloQueryResult, OperationVariables } from "@apollo/client";
import { Button, Card, Spinner, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { CheckmarkFilled, View, ViewOff, WarningAltFilled } from "@carbon/icons-react";
import dayjs from "dayjs";
import { useAuth } from "hooks/useAuth";
import useAutoimport from "hooks/useAutoimport";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import { url } from "lib/regex";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { Dispatch, useState } from "react";

declare type Color = "success" | "critical" | "warning" | "subdued" | "text-inverse";
const OshLine = ({
  stats,
  name,
  project,
  setOshRatings,
  isOwner,
}: {
  stats: any;
  name: string;
  project: Partial<EconomicResource>;
  setOshRatings: Dispatch<any>;
  isOwner: boolean;
}) => {
  const { t } = useTranslation("common");
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
  if (!stat.show && !isOwner) return null;
  return (
    <div className="m-2 mr-1 py-1">
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
            {isOwner && (
              <Button
                id="seeRelations"
                size="slim"
                icon={stat.show ? <ViewOff /> : <View />}
                fullWidth
                onClick={handleShow}
              >
                {t(stat.show ? "Hide" : "Show")}
              </Button>
            )}
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
  project: Partial<EconomicResource>;
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<{ economicResource: EconomicResource }>>;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [oshRatings, setOshRatings] = useState<any>(project?.metadata?.ratings);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { analyzeRepository } = useAutoimport();
  const { updateMetadata } = useProjectCRUD();
  const { user } = useAuth();
  const isOwner = user?.ulid === project.primaryAccountable!.id;
  const handleAnalyze = async () => {
    setLoading(true);
    if (!project.repo || !url.test(project.repo!)) {
      setError(t("Update your project and provide a valid repository url"));
      setLoading(false);
      return;
    }
    const result = await analyzeRepository(project.repo);
    if (!result?.stats) {
      setError(t("Something went wrong be sure to have a valid repository url"));
      setLoading(false);
      return;
    }
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
    await updateMetadata(project, { lastOshCheck: dayjs().toISOString() });
    setOshRatings(ratingsToUpdate);
    await refetch();
    setLoading(false);
  };

  return (
    <>
      {(oshRatings || isOwner) && (
        <>
          <Card sectioned>
            {loading ? (
              <div className="w-full h-96 bg-white mt-24 bg-opacity-50 z-10 flex content-center justify-center">
                <Spinner />
              </div>
            ) : (
              <Stack vertical spacing={"loose"}>
                <Text as="h2" variant="heading2xl">
                  {t("Open Know How")}
                </Text>
                <Stack vertical spacing="loose">
                  <Text as="p" variant="bodyMd">
                    {t(
                      "The OKH checker is a tool that verifies whether a hardware design aligns with the Open Know How specification ensuring that it follows standardized documentation and metadata practices for open hardware designs"
                    )}
                  </Text>
                  <div className="border rounded-sm bg-[#FAFAFA]">
                    {oshRatings &&
                      Object.keys(oshRatings).map((n: string, i: number) => (
                        <OshLine
                          stats={oshRatings}
                          name={n}
                          key={i}
                          project={project}
                          setOshRatings={setOshRatings}
                          isOwner={isOwner}
                        />
                      ))}
                  </div>
                  <div>
                    <Text as="p" variant="bodySm">
                      {t("OKH version") + ": 0.3.1-15-gbc9808f"}
                    </Text>
                    {error && (
                      <Text as="p" variant="bodyMd" color="critical">
                        {error}
                      </Text>
                    )}
                    {oshRatings && (
                      <Text as="p" variant="bodySm">
                        {t("Last execution")}
                        {": "}
                        {dayjs(project?.metadata?.oshExecution).toLocaleString()}
                      </Text>
                    )}
                    {isOwner && (
                      <Button primary id="seeRelations" size="large" fullWidth monochrome onClick={handleAnalyze}>
                        {t("Run checker")}
                      </Button>
                    )}
                  </div>
                </Stack>
              </Stack>
            )}
          </Card>
        </>
      )}
    </>
  );
};

export default OshTool;
