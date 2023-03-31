import { Button } from "@bbtgnn/polaris-interfacer";
import { Notification } from "@carbon/icons-react";
import { BellIcon } from "@heroicons/react/outline";
import ContributionMessage from "components/ContributionMessage";
import useInBox from "hooks/useInBox";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import TopbarPopover from "./TopbarPopover";

//

export default function TopbarNotifications() {
  const { unread, messages } = useInBox();
  const { t } = useTranslation("common");
  const MAX_MESSAGES = 5;

  return (
    <TopbarPopover notification={Boolean(unread)} buttonContent={<BellIcon className="w-5 h-5" />}>
      <div className="divide-y-1 divide-slate-200">
        {messages &&
          messages.slice(undefined, MAX_MESSAGES).map(m => (
            <div className="p-4" key={m.id}>
              <ContributionMessage message={m.content} sender={m.sender} data={m.content.data} id={m.id} />
            </div>
          ))}

        <div className="sticky bottom-0 bg-white p-4">
          <Link href="/notification">
            <a>
              <Button fullWidth outline icon={<Notification />}>
                {t("See all notifications")}
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </TopbarPopover>
  );
}
