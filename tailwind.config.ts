/** @type {import('tailwindcss').Config} */
import scrollbarPlugin from "tailwind-scrollbar";
import plugin from "tailwindcss/plugin";

export default {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        primary: ['"Red Hat Display"', "sans-serif"],
        secondary: ['"Lora"', "serif"],
      },
      colors: {
        primary: "#63130C",
        textBlack: "#050505",
        textGrey: "#828DA9",
        textLightGrey: "#9BA4BA",
        textDarkGrey: "#49526A",
        textDarkBrown: "#32290E",
        strokeGrey: "#9DA3AA",
        strokeGreyTwo: "#E0E0E0",
        strokeGreyThree: "#EAEEF2",
        strokeCream: "#D3C6A1",
        error: "#EA91B4",
        errorTwo: "#FC4C5D",
        paleLightBlue: "#EFF2FF",
        brightBlue: "#007AFF",
        success: "#00AF50",
        successTwo: "#E3FAD6",
        successThree: "#AEF1A7",
        disabled: "#E2E4EB",
        blackBrown: "#1E0604",
        gold: "#F8CB48",
        purpleBlue: "#DADFF8",
        pink: "#F7D3E1",
        inkBlue: "#8396E7",
        inkBlueTwo: "#3951B6",
        paleYellow: "#FFF3D5",
        chalk: "#FFFFFC",
        grape: "#EAD2D0",
      },
      backgroundImage: {
        primaryGradient: "linear-gradient(to right, #982214, #F8CB48)",
        errorGradient: "linear-gradient(to right, #982214, #473b15)",
        inversedErrorGradient: "linear-gradient(to left, #982214, #473b15)",
        paleGrayGradient: "linear-gradient(to right, #F6F8FA, #FFFFFF)",
        paleGrayGradientLeft: "linear-gradient(to left, #F6F8FA, #FFFFFF)",
        paleCreamGradientLeft: "linear-gradient(to left, #FEF5DA, #FFFFFF)",
      },
      boxShadow: {
        innerCustom: "inset 1px 2px 4px rgba(0, 0, 0, 0.15)",
        menuCustom: "8px 12px 40px rgba(0, 0, 0, 0.15)",
        titlePillCustom: "1px 2px 10px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [
    scrollbarPlugin({ nocompatible: true }),
    plugin(function ({ addUtilities }) {
      // Custom scrollbar utilities (optional)
      addUtilities({
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
        },
        ".scrollbar-thumb-gray-400": {
          "scrollbar-color": "#9CA3AF transparent",
        },
        ".scrollbar-track-gray-100": {
          "scrollbar-color": "transparent #F3F4F6",
        },
      });
    }),
  ],
};
