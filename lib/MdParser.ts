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

import MarkdownIt from "markdown-it";
// @ts-ignore
import emoji from "markdown-it-emoji";
// @ts-ignore
import subscript from "markdown-it-sub";
// @ts-ignore
import superscript from "markdown-it-sup";
// @ts-ignore
import footnote from "markdown-it-footnote";
// @ts-ignore
import deflist from "markdown-it-deflist";
// @ts-ignore
import abbreviation from "markdown-it-abbr";
// @ts-ignore
import insert from "markdown-it-ins";
// @ts-ignore
import mark from "markdown-it-mark";
// @ts-ignore
import tasklists from "markdown-it-task-lists";

const MdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(emoji)
  .use(subscript)
  .use(superscript)
  .use(footnote)
  .use(deflist)
  .use(abbreviation)
  .use(insert)
  .use(mark)
  .use(tasklists);
export default MdParser;
