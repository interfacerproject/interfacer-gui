import dayjs from "../lib/dayjs";
import cn from "classnames";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import Link from "next/link";
import { Button } from "@bbtgnn/polaris-interfacer";
import { useRouter } from "next/router";
import { MessageSubject } from "../pages/notification";
import { useTranslation } from "next-i18next";

type ContributionMessageProps = {
  data: Date;
  userName: string;
  userId: string;
  resourceId: string;
  resourceName: string;
  proposalId: string;
  message: string;
  subject: MessageSubject;
};
const ContributionMessage = ({
  data,
  userName,
  userId,
  resourceName,
  resourceId,
  proposalId,
  message,
  subject,
}: ContributionMessageProps) => {
  const router = useRouter();
  const { t } = useTranslation("notificationProps");
  const headlinesDict = {
    [MessageSubject.CONTRIBUTION_REQUEST]: t("want to contribute to your"),
    [MessageSubject.CONTRIBUTION_ACCEPTED]: t("accepted your contribution to"),
    [MessageSubject.CONTRIBUTION_REJECTED]: t("rejected your contribution to"),
  };
  const className = cn("pb-2 my-2 border-b-2 p-2", {
    "": subject === MessageSubject.CONTRIBUTION_REQUEST,
    "bg-success": subject === MessageSubject.CONTRIBUTION_ACCEPTED,
    "bg-error": subject === MessageSubject.CONTRIBUTION_REJECTED,
  });
  return (
    <div className={className}>
      <p className="mr-1">{dayjs(data).fromNow()}</p>
      <p className="text-xs">{dayjs(data).format("HH:mm DD/MM/YYYY")}</p>
      <div className="flex flex-row my-2 center">
        <div className="mr-2">
          <BrDisplayUser id={userId} name={userName} />
        </div>
        <div className="pt-3.5">
          <span className="mr-1">{headlinesDict[subject]}</span>
          <Link href={`/asset/${resourceId}`}>
            <a className="text-primary hover:underline">{resourceName}</a>
          </Link>
        </div>
      </div>
      <p className="text-xs bg-[#E0E0E0] p-2">{message}</p>
      <p className="my-2">{`let ${userName} knows about your decision`}</p>
      <Button
        primary
        fullWidth
        onClick={() => {
          router.push(`/proposal/${proposalId}`);
        }}
      >
        {"review"}
      </Button>
    </div>
  );
};

export default ContributionMessage;
