// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { SearchIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function NoQueryPrompt() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push({ pathname: "/search", query: { q } });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-20 px-4">
      <h1
        className="text-ifr-text-primary"
        style={{
          fontFamily: "var(--ifr-font-heading)",
          fontSize: "var(--ifr-fs-2xl)",
          fontWeight: "var(--ifr-fw-bold)",
        }}
      >
        {t("Search the platform")}
      </h1>
      <form onSubmit={submit} className="w-full max-w-[560px]">
        <div className="bg-ifr-search border border-ifr rounded-full px-5 py-3 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 shrink-0 text-ifr-text-secondary" />
          <input
            type="search"
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={t("Search designs, products, services, machines, people…")}
            className="flex-1 min-w-0 bg-transparent text-ifr-text-primary placeholder:text-ifr-text-muted outline-none"
            style={{ fontFamily: "var(--ifr-font-body)" }}
          />
        </div>
      </form>
      <div
        className="flex gap-4 text-ifr-green"
        style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
      >
        <Link href="/designs">
          <a className="hover:underline">{t("Designs")}</a>
        </Link>
        <Link href="/products">
          <a className="hover:underline">{t("Products")}</a>
        </Link>
        <Link href="/services">
          <a className="hover:underline">{t("Services")}</a>
        </Link>
      </div>
    </div>
  );
}
