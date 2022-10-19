const colors = require("tailwindcss/colors");

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
        transparent: "transparent",
        secondary: colors.turquoise,
        ternary: colors.bronze,
        quaternary: colors.amber,
        black: colors.ebony,
        white: {
          100: "#fcfbfa",
          200: "#f9f7f4",
          300: "#f5f2ef",
          400: "#f2eee9",
          500: "#efeae4",
          600: "#bfbbb6",
          700: "#8f8c89",
          800: "#605e58",
          900: "#302f2e",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
