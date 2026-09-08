// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { LocationMarkerIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { PersonWithFileEssential } from "lib/types/extensions";
import { useTranslation } from "next-i18next";
import Link from "next/link";

interface Props {
  agent: Partial<PersonWithFileEssential> & {
    user?: string | null;
    primaryLocation?: { name?: string | null } | null;
  };
}

export default function AgentCard({ agent }: Props) {
  const { t } = useTranslation("common");
  const location = agent.primaryLocation?.name;

  return (
    <Link href={`/profile/${agent.id}`}>
      <a className="block no-underline">
        <div
          className="group bg-ifr-surface border border-ifr overflow-hidden flex flex-col items-center text-center gap-1 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
          style={{ borderRadius: "var(--ifr-radius-sm)" }}
        >
          <div className="rounded-full overflow-hidden border border-ifr-avatar" style={{ width: 64, height: 64 }}>
            <BrUserAvatar user={agent} size="64px" />
          </div>
          <h3
            className="text-ifr-text-primary mt-2"
            style={{
              fontFamily: "var(--ifr-font-heading)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-bold)",
            }}
          >
            {agent.name}
          </h3>
          {agent.user && (
            <span
              className="text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {`@${agent.user}`}
            </span>
          )}
          {location && (
            <span
              className="flex items-center gap-1.5 text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0" />
              {location}
            </span>
          )}
          <span
            className="mt-2 text-white"
            style={{
              backgroundColor: "var(--ifr-text-primary)",
              borderRadius: "var(--ifr-radius-sm)",
              padding: "3px 8px",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-semibold)",
            }}
          >
            {t("Person")}
          </span>
        </div>
      </a>
    </Link>
  );
}
