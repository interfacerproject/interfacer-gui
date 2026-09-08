// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { ProjectType } from "components/types";

export type SearchCategory = "designs" | "products" | "services" | "machines" | "people";

/** Categories backed by economicResources (FETCH_RESOURCES). Order matters for display. */
export const RESOURCE_CATEGORIES = ["designs", "products", "services", "machines"] as const;

/** Every category, in the order they appear in the tab strip and the "All" view. */
export const ALL_CATEGORIES: readonly SearchCategory[] = ["designs", "products", "services", "machines", "people"];

export const CATEGORY_LABEL_KEY: Record<SearchCategory, string> = {
  designs: "Designs",
  products: "Products",
  services: "Services",
  machines: "Machines",
  people: "People",
};

/** Lowercase, for "No {{category}} match "q"" style copy. */
export const CATEGORY_SINGULAR_KEY: Record<SearchCategory, string> = {
  designs: "designs",
  products: "products",
  services: "services",
  machines: "machines",
  people: "people",
};

export const CATEGORY_ACCENT: Record<SearchCategory, string> = {
  designs: "var(--ifr-green)",
  products: "var(--ifr-type-product)",
  services: "var(--ifr-type-service)",
  machines: "var(--ifr-type-machine)",
  people: "var(--ifr-text-primary)",
};

export const CATEGORY_PROJECT_TYPE: Record<(typeof RESOURCE_CATEGORIES)[number], ProjectType> = {
  designs: ProjectType.DESIGN,
  products: ProjectType.PRODUCT,
  services: ProjectType.SERVICE,
  machines: ProjectType.MACHINE,
};
