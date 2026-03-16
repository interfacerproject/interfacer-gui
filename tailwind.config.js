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
      colors: {
        ...tokens.colors,
        primary: "#02604B",
        /* Interfacer design tokens */
        ifr: {
          "text-primary": "var(--ifr-text-primary)",
          "text-secondary": "var(--ifr-text-secondary)",
          "text-muted": "var(--ifr-text-muted)",
          green: {
            DEFAULT: "var(--ifr-green)",
            hover: "var(--ifr-green-hover)",
            dark: "var(--ifr-green-dark)",
            accent: "var(--ifr-green-accent)",
            bg: "var(--ifr-green-bg)",
            "status-text": "var(--ifr-green-status-text)",
          },
          red: {
            DEFAULT: "var(--ifr-red)",
            "hover-bg": "var(--ifr-red-hover-bg)",
          },
          yellow: {
            DEFAULT: "var(--ifr-yellow)",
            hover: "var(--ifr-yellow-hover)",
            bg: "var(--ifr-yellow-bg)",
            text: "var(--ifr-yellow-text)",
          },
          product: {
            DEFAULT: "var(--ifr-type-product)",
            hover: "var(--ifr-type-product-hover)",
            border: "var(--ifr-type-product-border)",
            bg: "var(--ifr-type-product-bg)",
          },
          service: {
            DEFAULT: "var(--ifr-type-service)",
            hover: "var(--ifr-type-service-hover)",
            border: "var(--ifr-type-service-border)",
            bg: "var(--ifr-type-service-bg)",
          },
          dpp: {
            DEFAULT: "var(--ifr-type-dpp)",
            hover: "var(--ifr-type-dpp-hover)",
            border: "var(--ifr-type-dpp-border)",
            bg: "var(--ifr-type-dpp-bg)",
          },
          location: {
            DEFAULT: "var(--ifr-type-location)",
            hover: "var(--ifr-type-location-hover)",
          },
        },
      },
      backgroundColor: {
        ifr: {
          page: "var(--ifr-bg-page)",
          profile: "var(--ifr-bg-profile)",
          surface: "var(--ifr-bg-surface)",
          elevated: "var(--ifr-bg-elevated)",
          hover: "var(--ifr-bg-hover)",
          input: "var(--ifr-bg-input)",
          search: "var(--ifr-bg-search)",
          tag: "var(--ifr-bg-tag)",
          "hover-light": "var(--ifr-bg-hover-light)",
          results: "var(--ifr-bg-results)",
          bookmark: "var(--ifr-bg-bookmark)",
          avatar: "var(--ifr-bg-avatar)",
          quote: "var(--ifr-bg-quote)",
          active: "var(--ifr-bg-active)",
          "form-input": "var(--ifr-bg-form-input)",
          "upload-btn": "var(--ifr-bg-upload-btn)",
        },
      },
      borderColor: {
        ifr: {
          DEFAULT: "var(--ifr-border)",
          light: "var(--ifr-border-light)",
          avatar: "var(--ifr-border-avatar)",
          env: "var(--ifr-border-env)",
          "form-input": "var(--ifr-border-form-input)",
        },
      },
      boxShadow: {
        "ifr-avatar": "var(--ifr-shadow-avatar)",
        "ifr-sm": "var(--ifr-shadow-sm)",
        "ifr-dropdown": "var(--ifr-shadow-dropdown)",
        "ifr-toggle": "var(--ifr-shadow-toggle)",
      },
      borderRadius: {
        "ifr-sm": "var(--ifr-radius-sm)",
        "ifr-md": "var(--ifr-radius-md)",
        "ifr-lg": "var(--ifr-radius-lg)",
        "ifr-full": "var(--ifr-radius-full)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/line-clamp")],
};
