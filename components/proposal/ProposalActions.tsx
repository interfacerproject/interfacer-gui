// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Banner, Button, Icon } from "@bbtgnn/polaris-interfacer";
import { AddProductMajor, RemoveProductMajor } from "@shopify/polaris-icons";
import { useAuth } from "hooks/useAuth";
import { useInBoxContext } from "hooks/useInBox";
import { useResourceControl } from "hooks/useResourceControl";
import useWallet from "hooks/useWallet";
import { errorFormatter } from "lib/errorFormatter";
import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import { acceptContribution, runFollowUps } from "lib/proposalAcceptance";
import { ProposedStatus } from "lib/types";
import { useTranslation } from "next-i18next";
import { MessageSubject } from "pages/notification";
import { useEffect, useRef, useState } from "react";

interface Resource {
  id: string;
  name?: string | null;
  primaryAccountable: { id: string };
}
export interface ProposalActionsProps {
  proposal: {
    id: string;
    status: string;
    note?: string | null;
    primaryIntents?: Array<{ id: string; resourceInventoriedAs?: Resource | null }> | null;
  };
  refetch: () => Promise<unknown>;
}

/**
 * Accept/reject for the controller of the resource the contribution modifies.
 * The backend authorizes every write; this only decides what to offer.
 */
export default function ProposalActions({ proposal, refetch }: ProposalActionsProps) {
  const { t } = useTranslation("ProposalProps");
  const { user, client } = useAuth();
  const { sendMessage } = useInBoxContext();
  const { addStrengthsPoints, addIdeaPoints } = useWallet({});
  const [cite, accept, modify] = proposal.primaryIntents ?? [];
  const fork = cite?.resourceInventoriedAs;
  const origin = accept?.resourceInventoriedAs;
  const access = useResourceControl(origin?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [warning, setWarning] = useState<string>();
  const busyRef = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const proposer = fork?.primaryAccountable.id;
  const message = () => ({
    originalResourceName: fork?.name || "",
    originalResourceID: fork?.id || "",
    proposalID: proposal.id,
    ownerName: user?.name,
    proposerName: user?.name,
    text: proposal.note || "",
  });

  const exclusive = (action: () => Promise<void>) => async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(undefined);
    setWarning(undefined);
    try {
      await action();
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const refresh = () => refetch().catch(e => console.error("Proposal refetch failed:", e));
  const fail = async (e: unknown) => {
    if (mounted.current) setError(errorFormatter(e, t));
    await refresh();
  };

  const onAccept = exclusive(async () => {
    try {
      await acceptContribution(client, proposal.id);
    } catch (e) {
      return fail(e);
    }
    // The acceptance is committed; follow-ups never repeat it.
    const failed = await runFollowUps([
      {
        name: t("notification"),
        run: () => sendMessage(message(), [proposer!], MessageSubject.CONTRIBUTION_ACCEPTED),
      },
      { name: t("strengths points"), run: () => addStrengthsPoints(proposer!, IdeaPoints.OnAccept) },
      { name: t("idea points"), run: () => addIdeaPoints(user!.ulid, StrengthsPoints.OnAccept) },
    ]);
    if (failed.length && mounted.current)
      setWarning(
        t("The contribution was accepted, but these follow-up steps failed – {{steps}}", { steps: failed.join(", ") })
      );
    await refresh();
  });

  const onReject = exclusive(async () => {
    try {
      await client!.resources.rejectProposal(cite!.id, accept!.id, modify!.id);
    } catch (e) {
      return fail(e);
    }
    const failed = await runFollowUps([
      {
        name: t("notification"),
        run: () => sendMessage(message(), [proposer!], MessageSubject.CONTRIBUTION_REJECTED),
      },
    ]);
    if (failed.length && mounted.current)
      setWarning(
        t("The contribution was rejected, but these follow-up steps failed – {{steps}}", { steps: failed.join(", ") })
      );
    await refresh();
  });

  const actionable =
    proposal.status === ProposedStatus.Pending &&
    access.status === "controller" &&
    Boolean(client && user && cite && accept && modify && proposer);

  if (!actionable && !error && !warning) return null;
  return (
    <>
      {error && (
        <div className="mx-auto w-full max-w-lg px-4 pt-4">
          <Banner status="critical">{error}</Banner>
        </div>
      )}
      {warning && (
        <div className="mx-auto w-full max-w-lg px-4 pt-4">
          <Banner status="warning">{warning}</Banner>
        </div>
      )}
      {actionable && (
        <div className="bg-yellow-100 border-t-1 border-t-border-warning-subdued p-4 flex flex-wrap justify-end items-center gap-3 sm:gap-6 sticky bottom-0 z-20">
          <div className="space-x-2">
            <Button
              size="large"
              onClick={onReject}
              icon={<Icon source={RemoveProductMajor} />}
              disabled={busy}
              id="reject-contribution"
            >
              {t("Reject contribution")}
            </Button>
            <Button
              size="large"
              primary
              onClick={onAccept}
              icon={<Icon source={AddProductMajor} />}
              disabled={busy}
              id="accept-contribution"
            >
              {t("Accept contribution")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
