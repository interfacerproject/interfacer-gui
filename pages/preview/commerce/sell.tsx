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

import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { usePreviewDialog } from "components/previewCommerce/PreviewDialog";
import { PreviewHeading } from "components/previewCommerce/ui";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { ONBOARDING_PROGRESS, ONBOARDING_TASKS, OnboardingTask } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

const CommercePreviewSell: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const dialog = usePreviewDialog();
  const pct = Math.round((ONBOARDING_PROGRESS.done / ONBOARDING_PROGRESS.total) * 100);
  const remainingRequired = ONBOARDING_TASKS.filter(x => x.required && x.state === "todo").length;

  return (
    <main
      style={{ maxWidth: "1180px", margin: "0 auto", padding: "24px 24px 120px", fontFamily: "var(--ifr-font-body)" }}
    >
      <PreviewHeading style={{ marginBottom: "4px" }}>{t("Becoming a seller")}</PreviewHeading>
      <p style={{ margin: "0 0 20px", fontSize: "14px", color: "var(--ifr-text-secondary)" }}>
        {t(
          "Readiness checklist: no fixed order. The shop opens when the three required cards are green; the rest raises limits."
        )}
      </p>

      <div
        className="ifr-pc-collapse"
        style={{ display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", gap: "20px", alignItems: "start" }}
      >
        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "6px",
            background: "#fff",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "132px",
              height: "132px",
              borderRadius: "9999px",
              background: `conic-gradient(#036a53 0 ${pct}%, rgba(200,212,229,0.5) 0)`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                width: "104px",
                height: "104px",
                borderRadius: "9999px",
                background: "#fff",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "26px", fontWeight: 700 }}>
                  {ONBOARDING_PROGRESS.done}/{ONBOARDING_PROGRESS.total}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--ifr-text-secondary)" }}>{t("tasks done")}</p>
              </div>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: "13px",
              color: "var(--ifr-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {t("{{count}} required tasks left before your shop can take money.", { count: remainingRequired })}
          </p>
          <button
            type="button"
            disabled
            style={{
              width: "100%",
              height: "44px",
              border: "none",
              borderRadius: "8px",
              background: "#036a53",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              opacity: 0.45,
              cursor: "not-allowed",
            }}
          >
            {t("Open my shop")}
          </button>
        </div>

        <div className="ifr-pc-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {ONBOARDING_TASKS.map(task => (
            <TaskCard key={task.id} task={task} t={t} onAction={() => dialog.open(task.action?.label ?? task.label)} />
          ))}
        </div>
      </div>

      {dialog.element}
    </main>
  );
};

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function TaskCard({ task, t, onAction }: { task: OnboardingTask; t: TFn; onAction: () => void }) {
  const isDone = task.state === "done";
  const isOptional = task.state === "optional";

  const border = isDone ? "1px solid rgba(3,106,83,0.2)" : isOptional ? "1px solid #c9cccf" : "1px solid #f1bd4d";
  const background = isDone ? "#f1f8f5" : "#fff";
  const labelColor = isDone ? "#008060" : isOptional ? "var(--ifr-text-secondary)" : "#916a00";
  const labelText = isDone ? t("DONE · REQUIRED") : isOptional ? t("OPTIONAL") : t("TO DO · REQUIRED");

  return (
    <div
      style={{
        border,
        borderRadius: "6px",
        background,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        gridColumn: task.fullWidth ? "span 2" : undefined,
      }}
    >
      <span style={{ fontSize: "11px", fontWeight: 700, color: labelColor, letterSpacing: "0.4px" }}>{labelText}</span>
      <p style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "16px", fontWeight: 700 }}>
        {t(task.label)}
      </p>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--ifr-text-secondary)", lineHeight: 1.5 }}>{t(task.body)}</p>
      {task.action && (
        <button
          type="button"
          onClick={onAction}
          style={{
            alignSelf: "flex-start",
            height: "38px",
            padding: "0 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: task.action.variant === "primary" ? 600 : 500,
            cursor: "pointer",
            border: task.action.variant === "primary" ? "none" : "1px solid #c9cccf",
            background: task.action.variant === "primary" ? "#036a53" : "#fff",
            color: task.action.variant === "primary" ? "#fff" : "var(--ifr-text-primary)",
          }}
        >
          {t(task.action.label)}
        </button>
      )}
    </div>
  );
}

CommercePreviewSell.publicPage = true;
CommercePreviewSell.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewSell;
