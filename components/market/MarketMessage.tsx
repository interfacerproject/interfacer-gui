// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// One marketplace notice in /notification: a new order (to the seller) or an
// order built/delivered (to the buyer), with a link to where to act.

import { Button } from "@bbtgnn/polaris-interfacer";
import { useInBoxContext } from "hooks/useInBox";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import dayjs from "lib/dayjs";
import { eur } from "lib/market/format";
import { MarketNoticeMessage, MarketSubject, marketNoticeLink } from "lib/market/notify";
import BrUserDisplay from "components/brickroom/BrUserDisplay";

export default function MarketMessage({
  id,
  subject,
  message,
  sender,
  data,
}: {
  id: number;
  subject: MarketSubject;
  message: MarketNoticeMessage;
  sender: string;
  data: Date;
}) {
  const { t } = useTranslation("notificationProps");
  const router = useRouter();
  const { setReadedMessage } = useInBoxContext();
  const newOrder = subject === MarketSubject.NEW_ORDER;
  const who = newOrder ? message.buyerName : message.sellerName;
  const headline = newOrder
    ? message.kind === "build"
      ? t("ordered a build of")
      : t("bought")
    : message.kind === "build"
    ? t("built your order of")
    : t("delivered your order of");

  return (
    <div className="space-y-3" data-testid={`market-notice-${subject}`}>
      <div>
        <p className="mr-1">{dayjs(data).fromNow()}</p>
        <div className="flex flex-row items-center space-x-2">
          {sender && <BrUserDisplay userId={sender} />}
          <p>
            <span className="font-semibold">{who || sender} </span>
            {headline} <span className="font-semibold">{message.itemName}</span>
            {newOrder && typeof message.totalEur === "number" ? ` · ${eur(message.totalEur)}` : null}
          </p>
        </div>
      </div>
      <p className="pl-2 border-l-2 border-gray-200">
        {newOrder
          ? t("Open Selling to fulfil it and sign the Interfacer record.")
          : t("The handover is recorded on Interfacer; see your order for the details.")}
      </p>
      <Button
        primary={newOrder}
        onClick={async () => {
          await setReadedMessage(id);
          router.push(marketNoticeLink(subject, message));
        }}
      >
        {newOrder ? t("Go to Selling") : t("See your order")}
      </Button>
    </div>
  );
}
