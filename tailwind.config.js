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

const tokens = require("@bbtgnn/polaris-interfacer-tokens");

module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        1: "1px",
      },
      keyframes: {
        swing: {
          "0%,100%": { transform: "rotate(15deg)" },
          "50%": { transform: "rotate(-15deg)" },
        },
      },
      animation: {
        swing: "swing 1s infinite",
      },
      lineHeight: {
        11: "3rem",
      },
      fontSize: {
        xl: "1.313rem",
      },
      spacing: {
        128: "32rem",
        156: "49rem",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "sans-serif"],
      },
      colors: {...tokens.colors,
      primary: "#02604B"},
    },
  },
  plugins: [require("@tailwindcss/typography"),  require("@tailwindcss/line-clamp")],
};
