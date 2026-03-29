import DashboardIcon from "../assets/RedIconsSvg/Dashboard.svg?url";
import SalesIcon from "../assets/RedIconsSvg/Sales.svg?url";
import CustomersIcon from "../assets/RedIconsSvg/Customers.svg?url";
import AgentsIcon from "../assets/RedIconsSvg/affiliate-marketing.svg?url";
import ProductsIcon from "../assets/RedIconsSvg/product.svg?url";
import InventoryIcon from "../assets/RedIconsSvg/Inventory.svg?url";
import DevicesIcon from "../assets/RedIconsSvg/Devices.svg?url";
import ContractsIcon from "../assets/RedIconsSvg/Contract.svg?url";
import ReportsIcon from "../assets/RedIconsSvg/Reports.svg?url";
import SettingsIcon from "../assets/RedIconsSvg/settings.svg?url";

const LogoFull = new URL("/freewave-logo.png", import.meta.url).href;
const LoginBackground = new URL("../assets/freewave-auth-bg.png", import.meta.url).href;
const FaviconUrl = "/freewave-logo.png";

const clamp = (v: number) => Math.max(0, Math.min(255, v));

const hexToRgb = (hex: string) => {
  const num = parseInt(hex.replace("#", ""), 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const toHslString = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `${h} ${s}% ${l}%`;
};

const adjustColor = (hex: string, percent: number) => {
  const { r, g, b } = hexToRgb(hex);
  const nr = clamp(r + Math.round((percent / 100) * 255));
  const ng = clamp(g + Math.round((percent / 100) * 255));
  const nb = clamp(b + Math.round((percent / 100) * 255));
  return `rgb(${nr}, ${ng}, ${nb})`;
};

type ThemePalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  warning: string;
  danger: string;
};

type BrandColors = {
  legacy: {
    brandPrimary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  palette: Record<string, string>;
  theme?: {
    light: ThemePalette;
    dark: ThemePalette;
  };
  gradients: {
    primary: string;
    error: string;
    pill: string;
  };
};

type FontConfig = {
  fontFamily: string;
  importUrl?: string;
};

type BrandAssets = {
  logoFull: string;
  faviconUrl: string;
  authBackgrounds: {
    default: string;
    agent: string;
    installer: string;
  };
  homeIcons: {
    dashboard: string;
    sales: string;
    customers: string;
    agents: string;
    products: string;
    inventory: string;
    devices: string;
    contracts: string;
    reports: string;
    settings: string;
  };
  basePath: string;
  publicPath: string;
  illustrations: string;
  icons: string;
  sections: Record<string, string>;
};

export type BrandConfig = {
  id: string;
  appName: string;
  companyName: string;
  companyLegalName?: string;
  supportEmail?: string;
  domains: string[];
  typography: {
    primary: FontConfig;
    secondary: FontConfig;
  };
  colors: BrandColors;
  assets: BrandAssets;
};

export const BRAND_CONFIG: BrandConfig = {
  id: "freewave",
  appName: "Freewave Energy",
  companyName: "Freewave",
  companyLegalName: "Freewave Consult Limited",
  supportEmail: "support@freewave.com",
  domains: ["freewavecrm.com", "freewave-energy-cmvgn.ondigitalocean.app"],
  typography: {
    primary: {
      fontFamily: '"Red Hat Display", sans-serif',
      importUrl:
        "https://fonts.googleapis.com/css2?family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&display=swap",
    },
    secondary: {
      fontFamily: '"Lora", serif',
      importUrl: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap",
    },
  },
  colors: {
    legacy: {
      brandPrimary: "#1879C5",
      accent: "#26A7E8",
      success: "#00AF50",
      warning: "#F0B44C",
      danger: "#E34A67",
    },
    palette: {
      textBlack: "#050505",
      textGrey: "#6F84A4",
      textLightGrey: "#9CB4D3",
      textDarkGrey: "#385270",
      textDarkBrown: "#203245",
      strokeGrey: "#9CB8D4",
      strokeGreyTwo: "#E0E0E0",
      strokeGreyThree: "#E3EEF8",
      strokeCream: "#C9DFF2",
      error: "#F2A0B7",
      errorTwo: "#E34A67",
      paleLightBlue: "#EAF7FF",
      brightBlue: "#1EA3F0",
      successTwo: "#D9F7E8",
      successThree: "#A7E8C7",
      disabled: "#E2E4EB",
      blackBrown: "#0B2336",
      gold: "#F3C95E",
      purpleBlue: "#D8EBFA",
      pink: "#F8D7E5",
      inkBlue: "#7BB8EC",
      inkBlueTwo: "#156CB1",
      paleYellow: "#FFF5D9",
      chalk: "#FCFEFF",
      grape: "#D5E8F6",
    },
    gradients: {
      primary: "linear-gradient(to right, var(--brand-primary), var(--brand-accent))",
      error: "linear-gradient(to right, var(--brand-primary), var(--brand-danger))",
      pill: "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-accent) 100%)",
    },
  },
  assets: {
    logoFull: LogoFull,
    faviconUrl: FaviconUrl,
    authBackgrounds: {
      default: LoginBackground,
      agent: LoginBackground,
      installer: LoginBackground,
    },
    homeIcons: {
      dashboard: DashboardIcon,
      sales: SalesIcon,
      customers: CustomersIcon,
      agents: AgentsIcon,
      products: ProductsIcon,
      inventory: InventoryIcon,
      devices: DevicesIcon,
      contracts: ContractsIcon,
      reports: ReportsIcon,
      settings: SettingsIcon,
    },
    basePath: "src/assets",
    publicPath: "public",
    illustrations: "src/assets/Images",
    icons: "src/assets/RedIcons",
    sections: {
      agents: "src/assets/agents",
      customers: "src/assets/customers",
      sales: "src/assets/sales",
      inventory: "src/assets/inventory",
      dashboard: "src/assets/dashboard",
      settings: "src/assets/settings",
      tables: "src/assets/table",
      contracts: "src/assets/contracts",
    },
  },
};

const createBrandCssVariables = (config: BrandConfig) => {
  const {
    typography,
    colors: { gradients, legacy, palette },
  } = config;

  const derivedLight: ThemePalette = {
    background: "0 0% 99%",
    foreground: "240 6% 10%",
    card: "0 0% 100%",
    cardForeground: "240 6% 12%",
    border: "205 35% 89%",
    muted: "204 55% 96%",
    mutedForeground: "210 18% 42%",
    primary: toHslString(legacy.brandPrimary),
    primaryForeground: "0 0% 100%",
    accent: toHslString(legacy.accent),
    accentForeground: "25 70% 15%",
    success: toHslString(legacy.success),
    warning: toHslString(legacy.warning),
    danger: toHslString(legacy.danger),
  };

  const derivedDark: ThemePalette = {
    background: "240 6% 7%",
    foreground: "0 0% 100%",
    card: "210 36% 14%",
    cardForeground: "0 0% 100%",
    border: "210 34% 24%",
    muted: "210 30% 16%",
    mutedForeground: "205 18% 70%",
    primary: toHslString(legacy.brandPrimary),
    primaryForeground: "0 0% 100%",
    accent: toHslString(legacy.accent),
    accentForeground: "25 70% 12%",
    success: toHslString(legacy.success),
    warning: toHslString(legacy.warning),
    danger: toHslString(legacy.danger),
  };

  const primaryShade1 = adjustColor(legacy.brandPrimary, -20);
  const primaryShade2 = adjustColor(legacy.brandPrimary, -35);
  const paletteVars = Object.entries(palette || {}).map(
    ([key, value]) => `  --${key}: ${value};`
  );

  return `
:root {
  --font-primary: ${typography.primary.fontFamily};
  --font-secondary: ${typography.secondary.fontFamily};
  --background: ${derivedLight.background};
  --foreground: ${derivedLight.foreground};
  --card: ${derivedLight.card};
  --card-foreground: ${derivedLight.cardForeground};
  --border: ${derivedLight.border};
  --muted: ${derivedLight.muted};
  --muted-foreground: ${derivedLight.mutedForeground};
  --primary: ${derivedLight.primary};
  --primary-foreground: ${derivedLight.primaryForeground};
  --accent: ${derivedLight.accent};
  --accent-foreground: ${derivedLight.accentForeground};
  --success: ${derivedLight.success};
  --warning: ${derivedLight.warning};
  --danger: ${derivedLight.danger};

  --brand-primary: hsl(${derivedLight.primary});
  --brand-accent: hsl(${derivedLight.accent});
  --brand-warning: hsl(${derivedLight.warning});
  --brand-danger: hsl(${derivedLight.danger});
  --brand-primary-hex: ${legacy.brandPrimary};
  --brand-primary-shade-1: ${primaryShade1};
  --brand-primary-shade-2: ${primaryShade2};
  --brand-accent-10: hsla(${derivedLight.accent} / 0.1);
  --brand-accent-20: hsla(${derivedLight.accent} / 0.2);
  --brand-gradient-primary: ${gradients.primary};
  --brand-gradient-error: ${gradients.error};
  --brand-gradient-pill: ${gradients.pill};
${paletteVars.join("\n")}
}

:root.dark,
[data-mode="dark"] {
  --font-primary: ${typography.primary.fontFamily};
  --font-secondary: ${typography.secondary.fontFamily};
  --background: ${derivedDark.background};
  --foreground: ${derivedDark.foreground};
  --card: ${derivedDark.card};
  --card-foreground: ${derivedDark.cardForeground};
  --border: ${derivedDark.border};
  --muted: ${derivedDark.muted};
  --muted-foreground: ${derivedDark.mutedForeground};
  --primary: ${derivedDark.primary};
  --primary-foreground: ${derivedDark.primaryForeground};
  --accent: ${derivedDark.accent};
  --accent-foreground: ${derivedDark.accentForeground};
  --success: ${derivedDark.success};
  --warning: ${derivedDark.warning};
  --danger: ${derivedDark.danger};

  --brand-primary: hsl(${derivedDark.primary});
  --brand-accent: hsl(${derivedDark.accent});
  --brand-warning: hsl(${derivedDark.warning});
  --brand-danger: hsl(${derivedDark.danger});
  --brand-primary-hex: ${legacy.brandPrimary};
  --brand-primary-shade-1: ${primaryShade1};
  --brand-primary-shade-2: ${primaryShade2};
  --brand-accent-10: hsla(${derivedDark.accent} / 0.1);
  --brand-accent-20: hsla(${derivedDark.accent} / 0.2);
  --brand-gradient-primary: ${gradients.primary};
  --brand-gradient-error: ${gradients.error};
  --brand-gradient-pill: ${gradients.pill};
${paletteVars.join("\n")}
}
`;
};

export const applyBranding = (config: BrandConfig = BRAND_CONFIG) => {
  if (typeof document === "undefined") return;

  document.title = config.appName;

  const faviconLink =
    (document.querySelector("link[rel~='icon']") as HTMLLinkElement | null) ??
    document.querySelector("link[rel='shortcut icon']");

  if (faviconLink) {
    faviconLink.href = config.assets.faviconUrl;
  } else {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = config.assets.faviconUrl;
    document.head.appendChild(link);
  }

  const styleId = "brand-theme-overrides";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = createBrandCssVariables(config);

  const ensureFontLink = (id: string, href?: string) => {
    if (!href) return;
    let fontLink = document.getElementById(id) as HTMLLinkElement | null;
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.id = id;
      document.head.appendChild(fontLink);
    }
    fontLink.href = href;
  };

  ensureFontLink("brand-font-primary", config.typography.primary.importUrl);
  ensureFontLink("brand-font-secondary", config.typography.secondary.importUrl);
};

export const brandAssets = BRAND_CONFIG.assets;

export const BRAND_CLASSES = {
  gradientPrimary: "bg-gradient-to-r from-primary to-accent",
  primaryBg: "bg-primary",
};
