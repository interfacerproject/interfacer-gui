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

import PreviewCommerceHeader from "components/previewCommerce/PreviewCommerceHeader";
import { usePreviewDialog } from "components/previewCommerce/PreviewDialog";
import { BackLink, PreviewPage } from "components/previewCommerce/ui";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { ONBOARDING_PROGRESS, ONBOARDING_TASKS, OnboardingTask } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { ReactElement, useState } from "react";

const muted = "var(--ifr-text-secondary)";

const CommercePreviewSell: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const dialog = usePreviewDialog();
  const [autoPassports, setAutoPassports] = useState(false);
  const pct = Math.round((ONBOARDING_PROGRESS.done / ONBOARDING_PROGRESS.total) * 100);
  const remaining = ONBOARDING_TASKS.filter(x => x.required && x.state === "todo").length;

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("SELL THROUGH INTERFACER")}
          title={t("Set up selling")}
          description={t("Complete the required setup to accept orders for your Interfacer products.")}
        />
      }
    >
      <BackLink href="/products" label={t("Back to Products")} />
      <p style={{ margin: "8px 0 20px", fontSize: "14px", color: muted }}>
        {t("Complete the required setup in any order.")}
      </p>

      <div
        className="ifr-pc-collapse"
        style={{ display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", gap: "20px", alignItems: "start" }}
      >
        {/* Progress rail */}
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
                <p style={{ margin: 0, fontSize: "11px", color: muted }}>{t("required steps")}</p>
              </div>
            </div>
          </div>
          <p style={{ margin: 0, textAlign: "center", fontSize: "13px", color: muted, lineHeight: 1.5 }}>
            {t("{{count}} steps to enable selling", { count: remaining })}
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
            {t("Enable selling")}
          </button>
        </div>

        {/* Task cards */}
        <div className="ifr-pc-collapse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {ONBOARDING_TASKS.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              t={t}
              autoPassports={autoPassports}
              onToggle={() => setAutoPassports(v => !v)}
              onAction={() => dialog.open(task.action?.label ?? task.link ?? task.label)}
            />
          ))}
        </div>
      </div>

      {dialog.element}
    </PreviewPage>
  );
};

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function TaskCard({
  task,
  t,
  autoPassports,
  onToggle,
  onAction,
}: {
  task: OnboardingTask;
  t: TFn;
  autoPassports: boolean;
  onToggle: () => void;
  onAction: () => void;
}) {
  const isDone = task.state === "done";
  const isOptional = task.state === "optional";
  const border = isDone ? "1px solid rgba(3,106,83,0.3)" : "1px solid #c9cccf";
  const background = isDone ? "#f1f8f5" : "#fff";
  const labelColor = isDone ? "#008060" : isOptional ? muted : "#916a00";
  const labelText = isDone ? t("DONE · REQUIRED") : isOptional ? t("OPTIONAL") : t("TO DO · REQUIRED");

  return (
    <div
      style={{
        border,
        borderRadius: "6px",
        background,
        padding: "16px",
        display: "flex",
        gap: "12px",
        gridColumn: task.fullWidth ? "1 / -1" : undefined,
        alignItems: task.fullWidth ? "center" : "flex-start",
      }}
    >
      {!task.fullWidth && (
        <span
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "9999px",
            border: isDone ? "none" : "1px solid #c9cccf",
            background: isDone ? "#036a53" : "#fff",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: "12px",
            flex: "none",
            marginTop: "2px",
          }}
        >
          {isDone ? "✓" : ""}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.4px", color: labelColor }}>
          {labelText}
        </span>
        <p style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "16px", fontWeight: 700 }}>
          {t(task.label)}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: muted, lineHeight: 1.5 }}>{t(task.body)}</p>
        {task.link && (
          <button
            type="button"
            onClick={onAction}
            style={{
              alignSelf: "flex-start",
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
              color: "#036a53",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {t(task.link)} {"→"}
          </button>
        )}
        {task.action && (
          <button
            type="button"
            onClick={onAction}
            style={{
              alignSelf: "flex-start",
              height: "36px",
              padding: "0 14px",
              borderRadius: "6px",
              border: "1px solid #c9cccf",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t(task.action.label)}
          </button>
        )}
      </div>
      {task.toggle && (
        <button
          type="button"
          role="switch"
          aria-checked={autoPassports}
          onClick={onToggle}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            background: autoPassports ? "#036a53" : "#c9cccf",
            position: "relative",
            flex: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "2px",
              left: autoPassports ? "22px" : "2px",
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              background: "#fff",
              transition: "left 0.15s",
            }}
          />
        </button>
      )}
    </div>
  );
}

CommercePreviewSell.publicPage = true;
CommercePreviewSell.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewSell;
