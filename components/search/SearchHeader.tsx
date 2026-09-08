// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { useTranslation } from "next-i18next";

interface Props {
  q: string;
  totalCount: number | null;
}

export default function SearchHeader({ q, totalCount }: Props) {
  const { t } = useTranslation("common");
  return (
    <div className="bg-ifr-dark border-b border-ifr">
      <div className="p-6 md:p-10 flex flex-col gap-[5px]">
        <p
          className="m-0 uppercase text-ifr-yellow text-[16px] leading-[26px] md:text-[18px] md:leading-[30px]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: 500 }}
        >
          {t("Search results")}
        </p>
        <h1
          className="m-0 text-ifr-text-inverse text-[28px] leading-[36px] md:text-[36px] md:leading-[44px]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: 700 }}
        >
          {t("Results for “{{q}}”", { q })}
        </h1>
        {totalCount !== null && (
          <p
            className="m-0 hidden md:block text-ifr-text-inverse-secondary text-[16px] leading-[24px] md:text-[18px] md:leading-[27px]"
            style={{ fontFamily: "var(--ifr-font-body)" }}
          >
            {t("{{n}} matches across Designs, Products, Services, Machines and People", { n: totalCount })}
          </p>
        )}
      </div>
    </div>
  );
}
