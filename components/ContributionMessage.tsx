import { Button } from "@bbtgnn/polaris-interfacer";
import cn from "classnames";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "../lib/dayjs";
import { MessageSubject } from "../pages/notification";
import BrDisplayUser from "./brickroom/BrDisplayUser";

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
    [MessageSubject.CONTRIBUTION_REQUEST]: t("wants to contribute to your"),
    [MessageSubject.CONTRIBUTION_ACCEPTED]: t("accepted ✅ your contribution to"),
    [MessageSubject.CONTRIBUTION_REJECTED]: t("rejected ❌ your contribution to"),
    [MessageSubject.ADDED_AS_CONTRIBUTOR]: t("added you as a contributor to"),
  };
  const className = cn({
    "": subject === MessageSubject.CONTRIBUTION_REQUEST,
    "bg-success": subject === MessageSubject.CONTRIBUTION_ACCEPTED,
    "bg-error": subject === MessageSubject.CONTRIBUTION_REJECTED,
  });

  const isRequest = subject === MessageSubject.CONTRIBUTION_REQUEST;

  return (
    <div className="space-y-3">
      <div>
        <p className="mr-1">{dayjs(data).fromNow()}</p>
        <p className="text-xs">{dayjs(data).format("HH:mm DD/MM/YYYY")}</p>
      </div>

      <div className="flex flex-row my-2 center">
        <div className="mr-2">
          <BrDisplayUser id={userId} name={userName} />
        </div>
        <div className="pt-3.5">
          <span className="mr-1">{headlinesDict[subject]}</span>
          <Link href={`/project/${resourceId}`}>
            <a className="text-primary hover:underline">{resourceName}</a>
          </Link>
        </div>
      </div>

      {isRequest && <p className="text-xs bg-[#E0E0E0] p-2 rounded-md">{message}</p>}

      {isRequest && <p>{`let ${userName} knows about your decision`}</p>}

      {isRequest ? (
        <Button
          fullWidth
          onClick={() => {
            router.replace(`/proposal/${proposalId}`);
          }}
        >
          {t("Review")}
        </Button>
      ) : (
        <Button
          fullWidth
          onClick={() => {
            router.replace(`/project/${resourceId}`);
          }}
        >
          {t("Take me there")}
        </Button>
      )}
    </div>
  );
};

export default ContributionMessage;
