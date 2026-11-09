// SPDX-License-Identifier: AGPL-3.0-or-later
import { Banner } from "@bbtgnn/polaris-interfacer";
import type { ProjectCreationOutcome } from "lib/projectCreation";
import { useTranslation } from "next-i18next";
import Link from "next/link";

type Created = Extract<ProjectCreationOutcome, { kind: "created" }>;

/** Shown instead of the form once the project exists, so it cannot be submitted twice. */
export default function ProjectCreationResult({ result }: { result: Created }) {
  const { t } = useTranslation("common");
  const tr = (key: string, options: Record<string, unknown> = {}) =>
    t("common:projectCreation." + key, { nsSeparator: ":", keySeparator: ".", ...options });
  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6 py-6 md:py-[42px]">
      <Banner status="warning" title={tr("createdWithIssues")}>
        {result.failed.length > 0 && <p>{tr("failed", { steps: Array.from(new Set(result.failed)).join(", ") })}</p>}
        {result.skipped.length > 0 && (
          <>
            <p>{tr("skippedTitle")}</p>
            <ul className="list-disc pl-5">
              {result.skipped.map(s => (
                <li key={s.name}>{tr("skippedItem", { name: s.name, reason: s.reason })}</li>
              ))}
            </ul>
          </>
        )}
        <Link href={`/project/${result.projectId}?created=true`}>
          <a className="underline">{tr("open")}</a>
        </Link>
      </Banner>
    </div>
  );
}
