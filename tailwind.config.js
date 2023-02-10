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
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#02604B",
          "primary-focus": "#014837",
          "primary-content": "#FFFFFF",
          secondary: "#02604B",
          "secondary-focus": "#014837",
          "secondary-content": "#FFFFFF",
          accent: "#F1BD4D",
          "accent-focus": "#D8A946",
          "accent-content": "#0B1324",
          neutral: "#475467",
          "neutral-focus": "#344054",
          "neutral-content": "#FFFFFF",
          "base-100": "#F8FAFC",
          "base-200": "#F1F4F8",
          "base-300": "#E3E9F2",
          "base-400": "#C8D4E5",
          "base-content": "#0C1729",
          "info-content": "#0C1729",
          success: "#32D583",
          "success-content": "#092B16",
          warning: "#FDB022",
          "warning-content": "#351507",
          error: "#FF7A70",
          "error-content": "#300502",
          "--rounded-btn": "2px",
        },
      },
    ],
  },
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
      colors: tokens.colors,
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
