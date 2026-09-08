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

import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { useState } from "react";

type Choice = "interfacer" | "external" | "none";

/**
 * Flag-gated "Sales & availability" section shown in the product-creation form.
 * The upcoming feature is not wired to submission — this is local state only,
 * previewing how the choice will appear.
 */
export default function SalesAvailabilitySection() {
  const { t } = useTranslation("commercePreviewProps");
  const [choice, setChoice] = useState<Choice>("interfacer");

  const options: { id: Choice; title: string; body: string }[] = [
    {
      id: "interfacer",
      title: t("Sell through Interfacer"),
      body: t("Accept orders and manage stock directly through Interfacer."),
    },
    {
      id: "external",
      title: t("Add an external store link"),
      body: t("Send buyers to your existing store or sales page."),
    },
    {
      id: "none",
      title: t("Not for sale"),
      body: t("Showcase the product without a purchase option."),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PTitleSubtitle
        title={t("Sales & availability")}
        subtitle={t("Choose how people can purchase or access this product.")}
      />

      <div className="flex flex-col gap-2.5">
        {options.map(o => {
          const on = o.id === choice;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setChoice(o.id)}
              className="flex items-center gap-3 p-3.5 text-left cursor-pointer"
              style={{
                border: on ? "2px solid #036a53" : "1px solid #c9cccf",
                borderRadius: "6px",
                background: on ? "#f1f8f5" : "#fff",
              }}
            >
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: "16px",
                  height: "16px",
                  border: on ? "5px solid #036a53" : "1px solid #c9cccf",
                }}
              />
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-medium text-ifr-text-primary">{o.title}</span>
                <span className="block text-[12px] text-ifr-text-secondary">{o.body}</span>
              </span>
            </button>
          );
        })}
      </div>

      {choice === "external" && (
        <input
          type="text"
          placeholder={t("https://your-store.example/product")}
          className="w-full h-10 px-3 border border-ifr rounded-ifr-md bg-ifr-subdued text-[14px] text-ifr-text-primary outline-none"
        />
      )}

      <p className="m-0 text-[12px] text-ifr-text-secondary">
        {t("Selling on Interfacer is an upcoming feature — this choice is a preview and is not saved yet.")}
      </p>
    </div>
  );
}
