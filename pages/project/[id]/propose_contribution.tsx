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

import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useRef, useState } from "react";

// Request
import { Banner } from "@bbtgnn/polaris-interfacer";
import { useAuth } from "hooks/useAuth";
import { useInBoxContext } from "hooks/useInBox";
import { submitContributionProposal } from "lib/contributionProposal";
import { errorFormatter } from "lib/errorFormatter";
import Link from "next/link";
import { MessageSubject, ProposalNotification } from "../../notification";

// Components
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import CreateContributionFrom, { FormValues } from "components/partials/create/contribution/CreateContributionForm";
import useWallet from "hooks/useWallet";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths } from "next";

//

const ProposeContribution: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const [formError, setFormError] = useState("");

  const router = useRouter();
  const { user, client } = useAuth();
  const { sendMessage } = useInBoxContext();
  const { addStrengthsPoints, addIdeaPoints } = useWallet({});
  const { project: resource } = useProject();
  const busy = useRef(false);
  const [followUpsFailed, setFollowUpsFailed] = useState<{ proposalId: string; steps: string[] }>();
  const common = (key: string, options: Record<string, unknown> = {}) =>
    t("common:contributionProposal." + key, { nsSeparator: ":", keySeparator: ".", ...options });

  const onSubmit = async (formData: FormValues) => {
    if (busy.current || !resource || !formData.project) return;
    busy.current = true;
    setFormError("");
    setFollowUpsFailed(undefined);
    try {
      const name = formData.name || `contribution of ${resource.name} by ${user!.name}`;
      const outcome = await submitContributionProposal(
        {
          client,
          // The server chose the owner (the origin's controller).
          notify: (ownerId, proposalId) => {
            const message: ProposalNotification = {
              proposalID: proposalId,
              text: formData.description,
              originalResourceName: resource.name!,
              originalResourceID: resource.id!,
              proposerName: user!.name,
              ownerName: resource.primaryAccountable!.name,
            };
            return sendMessage(message, [ownerId], MessageSubject.CONTRIBUTION_REQUEST);
          },
          points: [
            {
              name: common("ideaPoints"),
              run: () => addIdeaPoints(resource.primaryAccountable!.id, IdeaPoints.OnFork),
            },
            { name: common("strengthsPoints"), run: () => addStrengthsPoints(user!.ulid, StrengthsPoints.OnFork) },
          ],
        },
        { resourceForkedId: formData.project, resourceOriginId: resource.id!, name, note: formData.description }
      );
      if (outcome.kind === "error") setFormError(errorFormatter(outcome.error, t));
      else if (outcome.kind === "created" && outcome.failed)
        setFollowUpsFailed({
          proposalId: outcome.proposalId,
          steps: outcome.failed.map(step => (step === "notification" ? common("notification") : step)),
        });
      else await router.push(`/proposal/${outcome.proposalId}`);
    } finally {
      busy.current = false;
    }
  };

  return (
    <>
      {followUpsFailed && (
        <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6 pt-6">
          <Banner status="warning">
            <p>{common("followUpsFailed", { steps: followUpsFailed.steps.join(", ") })}</p>
            <Link href={`/proposal/${followUpsFailed.proposalId}`}>
              <a className="underline">{common("openProposal")}</a>
            </Link>
          </Banner>
        </div>
      )}
      <CreateContributionFrom onSubmit={onSubmit} error={formError} setError={setFormError} />
    </>
  );
};

ProposeContribution.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <FetchProjectLayout>{page}</FetchProjectLayout>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default ProposeContribution;
