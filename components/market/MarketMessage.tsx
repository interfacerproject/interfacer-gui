// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// One marketplace notice in /notification: a new order (to the seller), an
// order built/delivered (to the buyer), or an after-sale step (a request to
// the seller; an answer or a refund to the buyer), with a link to where to act.

import { Button } from "@bbtgnn/polaris-interfacer";
import { useInBoxContext } from "hooks/useInBox";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import dayjs from "lib/dayjs";
import { eur, eurCents } from "lib/market/format";
import { MarketNoticeMessage, MarketSubject, marketNoticeLink, toSeller } from "lib/market/notify";
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
  const aftersale = subject === MarketSubject.AFTERSALE;
  const forSeller = toSeller(subject, message);
  const who = aftersale ? message.actorName : newOrder ? message.buyerName : message.sellerName;
  const headline = aftersale
    ? {
        requested: message.caseKind === "return" ? t("asks to return") : t("asks to cancel the order of"),
        withdrawn: t("withdrew their request on"),
        accepted: message.caseKind === "return" ? t("accepted your return of") : t("cancelled your order of"),
        rejected: t("declined your request on"),
        refunded: t("refunded you for"),
      }[message.event ?? "requested"]
    : newOrder
    ? message.kind === "build"
      ? t("ordered a build of")
      : t("bought")
    : message.kind === "build"
    ? t("built your order of")
    : t("delivered your order of");
  const amount =
    aftersale && typeof message.amountCents === "number"
      ? eurCents(message.amountCents)
      : newOrder && typeof message.totalEur === "number"
      ? eur(message.totalEur)
      : null;

  return (
    <div className="space-y-3" data-testid={`market-notice-${subject}`}>
      <div>
        <p className="mr-1">{dayjs(data).fromNow()}</p>
        <div className="flex flex-row items-center space-x-2">
          {sender && <BrUserDisplay userId={sender} />}
          <p>
            <span className="font-semibold">{who || sender} </span>
            {headline} <span className="font-semibold">{message.itemName}</span>
            {amount ? ` · ${amount}` : null}
          </p>
        </div>
      </div>
      <p className="pl-2 border-l-2 border-gray-200">
        {aftersale
          ? forSeller
            ? t("Open Selling to answer the request.")
            : t("See your order for the details.")
          : newOrder
          ? t("Open Selling to fulfil it and sign the Interfacer record.")
          : t("The handover is recorded on Interfacer; see your order for the details.")}
      </p>
      <Button
        primary={forSeller}
        onClick={async () => {
          await setReadedMessage(id);
          router.push(marketNoticeLink(subject, message));
        }}
      >
        {forSeller ? t("Go to Selling") : t("See your order")}
      </Button>
    </div>
  );
}
