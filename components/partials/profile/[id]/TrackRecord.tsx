import { Card, Stack, Tabs } from "@bbtgnn/polaris-interfacer";
import TokensDisplay from "components/TokensDisplay";
import { useUser } from "components/layout/FetchUserLayout";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { Token, TrendPeriod } from "hooks/useWallet";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";

const TrackRecord = () => {
  const { t } = useTranslation();
  const { id } = useUser();
  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);

  const tabs = [
    {
      id: "week",
      content: t("This week"),
    },
    {
      id: "month",
      content: t("This month"),
    },
    {
      id: "cycle",
      content: t("This cycle"),
    },
  ];

  const tabsContent = [
    <div className="flex" key={"week"}>
      <TokensDisplay stat={t(Token.Idea)} id={id} period={TrendPeriod.Week} />
      <TokensDisplay stat={t(Token.Strengths)} id={id} period={TrendPeriod.Week} />
    </div>,
    <div className="flex" key={"month"}>
      <TokensDisplay stat={t(Token.Idea)} id={id} period={TrendPeriod.Month} />
      <TokensDisplay stat={t(Token.Strengths)} id={id} period={TrendPeriod.Month} />
    </div>,
    <div className="flex" key="cyclal">
      <TokensDisplay stat={t(Token.Idea)} id={id} period={TrendPeriod.Cycle} />
      <TokensDisplay stat={t(Token.Strengths)} id={id} period={TrendPeriod.Cycle} />
    </div>,
  ];
  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Track record")}
        subtitle={t(
          "We keep track of your recent activity on the platform, such as the number of designs you have contributed, the feedback you have received, and your level of engagement in the community. About the economic model"
        )}
        titleTag="h2"
      ></PTitleSubtitle>
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          {tabsContent[selected]}
        </Tabs>
      </Card>
    </Stack>
  );
};

export default TrackRecord;
