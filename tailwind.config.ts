// /** @type {import('tailwindcss').Config} */
// import scrollbarPlugin from "tailwind-scrollbar";
// import plugin from "tailwindcss/plugin";

// export default {
//   mode: "jit",
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   darkMode: ["class", '[data-mode="dark"]'],
//   theme: {
//     extend: {
//       fontFamily: {
//         primary: ['"Red Hat Display"', "sans-serif"],
//         secondary: ['"Lora"', "serif"],
//       },
//       colors: {
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         card: "hsl(var(--card))",
//         "card-foreground": "hsl(var(--card-foreground))",
//         border: "hsl(var(--border))",
//         destructive: "hsl(var(--destructive))",
//         "destructive-foreground": "hsl(var(--destructive-foreground))",
//         primary: "#63130C",
//         textBlack: "#050505",
//         textGrey: "#828DA9",
//         textLightGrey: "#9BA4BA",
//         textDarkGrey: "#49526A",
//         textDarkBrown: "#32290E",
//         strokeGrey: "#9DA3AA",
//         strokeGreyTwo: "#E0E0E0",
//         strokeGreyThree: "#EAEEF2",
//         strokeCream: "#D3C6A1",
//         error: "#EA91B4",
//         errorTwo: "#FC4C5D",
//         paleLightBlue: "#EFF2FF",
//         brightBlue: "#007AFF",
//         success: "#00AF50",
//         successTwo: "#E3FAD6",
//         successThree: "#AEF1A7",
//         disabled: "#E2E4EB",
//         blackBrown: "#1E0604",
//         gold: "#F8CB48",
//         purpleBlue: "#DADFF8",
//         pink: "#F7D3E1",
//         inkBlue: "#8396E7",
//         inkBlueTwo: "#3951B6",
//         paleYellow: "#FFF3D5",
//         chalk: "#FFFFFC",
//         grape: "#EAD2D0",
//       },
//       backgroundImage: {
//         primaryGradient: "linear-gradient(to right, #982214, #F8CB48)",
//         errorGradient: "linear-gradient(to right, #982214, #473b15)",
//         inversedErrorGradient: "linear-gradient(to left, #982214, #473b15)",
//         paleGrayGradient: "linear-gradient(to right, #F6F8FA, #FFFFFF)",
//         paleGrayGradientLeft: "linear-gradient(to left, #F6F8FA, #FFFFFF)",
//         paleCreamGradientLeft: "linear-gradient(to left, #FEF5DA, #FFFFFF)",
//       },
//       boxShadow: {
//         innerCustom: "inset 1px 2px 4px rgba(0, 0, 0, 0.15)",
//         menuCustom: "8px 12px 40px rgba(0, 0, 0, 0.15)",
//         titlePillCustom: "1px 2px 10px rgba(0, 0, 0, 0.05)",
//       },
//     },
//   },
//   plugins: [
//     scrollbarPlugin({ nocompatible: true }),
//     plugin(function ({ addUtilities }) {
//       // Custom scrollbar utilities (optional)
//       addUtilities({
//         ".scrollbar-thin": {
//           "scrollbar-width": "thin",
//         },
//         ".scrollbar-thumb-gray-400": {
//           "scrollbar-color": "#9CA3AF transparent",
//         },
//         ".scrollbar-track-gray-100": {
//           "scrollbar-color": "transparent #F3F4F6",
//         },
//       });
//     }),
//   ],
// };













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
      // A lovely, calm palette (not your previous brand colors)
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",

        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",

        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
      },

      backgroundImage: {
        softHero:
          "radial-gradient(900px circle at 10% -10%, hsla(var(--accent)/0.12) 0%, transparent 45%), radial-gradient(800px circle at 110% 0%, hsla(var(--primary)/0.10) 0%, transparent 50%), linear-gradient(180deg, hsla(var(--primary)/0.06) 0%, hsla(var(--accent)/0.08) 100%)",
        pill:
          "linear-gradient(180deg, hsla(var(--primary)/0.92) 0%, hsla(var(--accent)/0.92) 100%)",
      },

      // Comfortable, legible type scale
      fontSize: {
        xs: ["0.78rem", { lineHeight: "1.2" }],
        sm: ["0.875rem", { lineHeight: "1.35" }],
        base: ["1rem", { lineHeight: "1.5" }],          // 16px
        lg: ["1.125rem", { lineHeight: "1.5" }],       // 18px
        xl: ["1.25rem", { lineHeight: "1.4" }],        // 20px
        "2xl": ["1.5rem", { lineHeight: "1.35" }],     // 24px
        "3xl": ["1.875rem", { lineHeight: "1.25" }],   // 30px
        "4xl": ["2.25rem", { lineHeight: "1.2" }],     // 36px
        "5xl": ["3rem", { lineHeight: "1.1" }],        // 48px
        "6xl": ["3.75rem", { lineHeight: "1.05" }],    // 60px
      },

      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        pill: "0 8px 24px rgba(0,0,0,0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [
    scrollbarPlugin({ nocompatible: true }),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-thin": { "scrollbar-width": "thin" },
        ".scrollbar-thumb-muted": { "scrollbar-color": "hsl(var(--muted-foreground)) transparent" },
        ".scrollbar-track-muted": { "scrollbar-color": "transparent hsl(var(--muted))" },
      });
    }),
  ],
};

