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

/**
 * The dark catalogue-style header used at the top of every commerce screen —
 * same treatment as `CatalogLayout`'s "CatalogHeader" (uppercase yellow
 * eyebrow, display title, muted-inverse description on `--ifr-bg-dark`).
 */
export default function PreviewCommerceHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-ifr-dark border-b border-ifr">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-8 md:py-10">
        <p
          className="m-0 uppercase text-ifr-yellow text-[16px] leading-[26px] md:text-[18px] md:leading-[30px]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: "var(--ifr-fw-medium)" }}
        >
          {eyebrow}
        </p>
        <h1
          className="m-0 mt-1 text-ifr-text-inverse text-[28px] leading-[36px] md:text-[36px] md:leading-[44px]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: "var(--ifr-fw-bold)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="m-0 mt-2 text-ifr-text-inverse-secondary text-[15px] md:text-[18px] leading-[27px] max-w-[70ch]"
            style={{ fontFamily: "var(--ifr-font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
