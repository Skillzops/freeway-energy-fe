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
        primary: ["var(--font-primary)", "sans-serif"],
        secondary: ["var(--font-secondary)", "serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",

        primary: "var(--brand-primary)",
        "primary-foreground": "var(--primary-foreground)",
        "primary-hex": "var(--brand-primary-hex)",
        "primary-shade-1": "var(--brand-primary-shade-1)",
        "primary-shade-2": "var(--brand-primary-shade-2)",

        accent: "var(--brand-accent)",
        "accent-foreground": "var(--accent-foreground)",
        "accent-10": "var(--brand-accent-10)",
        "accent-20": "var(--brand-accent-20)",

        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },

      backgroundImage: {
        softHero:
          "radial-gradient(900px circle at 10% -10%, hsla(var(--accent)/0.12) 0%, transparent 45%), radial-gradient(800px circle at 110% 0%, hsla(var(--primary)/0.10) 0%, transparent 50%), linear-gradient(180deg, hsla(var(--primary)/0.06) 0%, hsla(var(--accent)/0.08) 100%)",
        pill: "linear-gradient(180deg, hsla(var(--primary)/0.92) 0%, hsla(var(--accent)/0.92) 100%)",

        primaryGradient: "var(--brand-gradient-primary)",
        errorGradient: "var(--brand-gradient-error)",
        inversedErrorGradient:
          "linear-gradient(to left, var(--brand-primary), var(--brand-danger))",
        paleGrayGradient: "linear-gradient(to right, #F6F8FA, #FFFFFF)",
        paleGrayGradientLeft: "linear-gradient(to left, #F6F8FA, #FFFFFF)",
        paleCreamGradientLeft: "linear-gradient(to left, #FEF5DA, #FFFFFF)",
      },

      // Comfortable, legible type scale
      fontSize: {
        xs: ["0.78rem", { lineHeight: "1.2" }],
        sm: ["0.875rem", { lineHeight: "1.35" }],
        base: ["1rem", { lineHeight: "1.5" }], // 16px
        lg: ["1.125rem", { lineHeight: "1.5" }], // 18px
        xl: ["1.25rem", { lineHeight: "1.4" }], // 20px
        "2xl": ["1.5rem", { lineHeight: "1.35" }], // 24px
        "3xl": ["1.875rem", { lineHeight: "1.25" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "1.2" }], // 36px
        "5xl": ["3rem", { lineHeight: "1.1" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1.05" }], // 60px
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
        ".scrollbar-thumb-muted": {
          "scrollbar-color": "hsl(var(--muted-foreground)) transparent",
        },
        ".scrollbar-track-muted": {
          "scrollbar-color": "transparent hsl(var(--muted))",
        },
      });
    }),
  ],
};
