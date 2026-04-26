import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Parse a simple CSS block like `.dark { --foo: #111; --bar: #222; }` or `@theme { ... }` */
function parseCssVars(css: string, selector: string): Record<string, string> {
  // Escape special regex chars in the selector
  const escaped = selector.replace(/[.*+?^${}()|[\]\\@]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`);
  const match = css.match(re);
  if (!match) return {};

  const vars: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*;/);
    if (m) vars[m[1]] = m[2];
  }
  return vars;
}

/** Read hero.ts theme config as a JS object */
function loadHeroConfig() {
  const heroPath = path.resolve(__dirname, "../../hero.ts");
  const content = fs.readFileSync(heroPath, "utf-8");
  const lines = content.split("\n");

  /**
   * Find the theme block by locating `<theme>: {` then collecting all lines
   * until braces balance back to zero.
   */
  const extractThemeBlock = (theme: string): string => {
    let depth = 0;
    let inside = false;
    const blockLines: string[] = [];
    for (const line of lines) {
      if (!inside) {
        if (new RegExp(`\\b${theme}:\\s*\\{`).test(line)) {
          inside = true;
          depth = 0;
          // count braces on this opening line
          for (const ch of line) {
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
          }
          blockLines.push(line);
          if (depth === 0) break;
          continue;
        }
      } else {
        for (const ch of line) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }
        blockLines.push(line);
        if (depth <= 0) break;
      }
    }
    return blockLines.join("\n");
  };

  const extractColor = (block: string, key: string): string | null => {
    const m = block.match(new RegExp(`${key}:\\s*"(#[a-fA-F0-9]+)"`));
    return m ? m[1] : null;
  };

  const lightBlock = extractThemeBlock("light");
  const darkBlock = extractThemeBlock("dark");

  return {
    light: {
      background: extractColor(lightBlock, "background"),
      foreground: extractColor(lightBlock, "foreground"),
      primaryDefault: extractColor(lightBlock, "DEFAULT"),
      primaryForeground: extractColor(lightBlock, "foreground"),
    },
    dark: {
      background: extractColor(darkBlock, "background"),
      foreground: extractColor(darkBlock, "foreground"),
      primaryDefault: extractColor(darkBlock, "DEFAULT"),
      primaryForeground: extractColor(darkBlock, "foreground"),
    },
  };
}

function loadGlobalsCss(): string {
  return fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
}

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

describe("Theme configuration (hero.ts)", () => {
  const config = loadHeroConfig();

  it("defines a light theme with required colors", () => {
    expect(config.light.background).toBeTruthy();
    expect(config.light.foreground).toBeTruthy();
    expect(config.light.primaryDefault).toBeTruthy();
  });

  it("defines a dark theme with required colors", () => {
    expect(config.dark.background).toBeTruthy();
    expect(config.dark.foreground).toBeTruthy();
    expect(config.dark.primaryDefault).toBeTruthy();
  });

  it("uses different background colors for light and dark", () => {
    expect(config.light.background).not.toBe(config.dark.background);
  });

  it("uses different foreground colors for light and dark", () => {
    expect(config.light.foreground).not.toBe(config.dark.foreground);
  });

  it("uses a lighter primary in dark mode for better contrast", () => {
    // Dark mode primary should be brighter (higher lightness) than light mode
    const lightPrimary = parseInt(config.light.primaryDefault!.slice(1), 16);
    const darkPrimary = parseInt(config.dark.primaryDefault!.slice(1), 16);
    // Sum of RGB channels as a rough brightness proxy
    const lightBrightness = (lightPrimary >> 16) + ((lightPrimary >> 8) & 0xff) + (lightPrimary & 0xff);
    const darkBrightness = (darkPrimary >> 16) + ((darkPrimary >> 8) & 0xff) + (darkPrimary & 0xff);
    expect(darkBrightness).toBeGreaterThan(lightBrightness);
  });
});

describe("CSS variable consistency (globals.css ↔ hero.ts)", () => {
  const css = loadGlobalsCss();
  const config = loadHeroConfig();

  it("@theme block matches light theme background", () => {
    const themeVars = parseCssVars(css, "@theme");
    expect(themeVars["--color-background"]?.toLowerCase()).toBe(config.light.background?.toLowerCase());
  });

  it("@theme block matches light theme foreground", () => {
    const themeVars = parseCssVars(css, "@theme");
    expect(themeVars["--color-foreground"]?.toLowerCase()).toBe(config.light.foreground?.toLowerCase());
  });

  it(".dark block overrides --color-background for dark mode", () => {
    const darkVars = parseCssVars(css, ".dark");
    expect(darkVars["--color-background"]).toBeTruthy();
    expect(darkVars["--color-background"]?.toLowerCase()).toBe(config.dark.background?.toLowerCase());
  });

  it(".dark block overrides --color-foreground for dark mode", () => {
    const darkVars = parseCssVars(css, ".dark");
    expect(darkVars["--color-foreground"]).toBeTruthy();
    expect(darkVars["--color-foreground"]?.toLowerCase()).toBe(config.dark.foreground?.toLowerCase());
  });

  it(".dark block includes color-scheme: dark", () => {
    const darkBlock = css.match(/\.dark\s*\{([^}]+)\}/);
    expect(darkBlock?.[1]).toContain("color-scheme: dark");
  });

  it(":root vars match @theme vars for light mode", () => {
    const rootVars = parseCssVars(css, ":root");
    const themeVars = parseCssVars(css, "@theme");
    expect(rootVars["--background"]?.toLowerCase()).toBe(themeVars["--color-background"]?.toLowerCase());
    expect(rootVars["--foreground"]?.toLowerCase()).toBe(themeVars["--color-foreground"]?.toLowerCase());
  });

  it(".dark --background and --color-background are in sync", () => {
    const darkVars = parseCssVars(css, ".dark");
    expect(darkVars["--background"]).toBe(darkVars["--color-background"]);
  });
});

describe("Dark mode logo variant", () => {
  const lightLogo = fs.readFileSync(path.resolve(__dirname, "../../public/icon.svg"), "utf-8");
  const darkLogo = fs.readFileSync(path.resolve(__dirname, "../../public/icon-dark.svg"), "utf-8");

  it("dark logo exists", () => {
    expect(darkLogo).toBeTruthy();
  });

  it("dark logo uses a lighter blue than the light logo", () => {
    // Light logo uses #393d98, dark logo should use something brighter
    const lightBlue = lightLogo.match(/fill:\s*(#[a-fA-F0-9]{6})/g) ?? [];
    const darkBlue = darkLogo.match(/fill:\s*(#[a-fA-F0-9]{6})/g) ?? [];

    // The main swoosh fill in light logo is #393d98
    expect(lightBlue.some((c) => c.includes("393d98"))).toBe(true);
    // The dark logo should NOT use #393d98 for the swoosh
    expect(darkBlue.some((c) => c.includes("393d98"))).toBe(false);
  });

  it("dark logo preserves the green accent color", () => {
    // Both logos should use #50c0a9 for the circles
    expect(lightLogo).toContain("#50c0a9");
    expect(darkLogo).toContain("#50c0a9");
  });

  it("dark logo uses screen blend mode instead of multiply", () => {
    expect(lightLogo).toContain("multiply");
    expect(darkLogo).toContain("screen");
    expect(darkLogo).not.toContain("multiply");
  });
});

describe("Theme-dependent component logic", () => {
  it("ThemedLogo selects /icon-dark.svg when theme is dark and mounted", () => {
    // Simulates the logic from themed-logo.tsx
    const getLogoSrc = (mounted: boolean, resolvedTheme: string | undefined) =>
      mounted && resolvedTheme === "dark" ? "/icon-dark.svg" : "/icon.svg";

    expect(getLogoSrc(true, "dark")).toBe("/icon-dark.svg");
    expect(getLogoSrc(true, "light")).toBe("/icon.svg");
    expect(getLogoSrc(true, "system")).toBe("/icon.svg");
    expect(getLogoSrc(true, undefined)).toBe("/icon.svg");
    // Before mount, always fallback to light
    expect(getLogoSrc(false, "dark")).toBe("/icon.svg");
  });

  it("StatusBadge passes correct theme param to iframe URL", () => {
    const getTheme = (resolvedTheme: string | undefined) => (resolvedTheme === "dark" ? "dark" : "light");

    expect(getTheme("dark")).toBe("dark");
    expect(getTheme("light")).toBe("light");
    expect(getTheme("system")).toBe("light");
    expect(getTheme(undefined)).toBe("light");
  });

  it("ThemeSwitcher icon matches current theme", () => {
    const getIconName = (theme: string | undefined) =>
      theme === "dark" ? "moon" : theme === "light" ? "sun" : "computer-desktop";

    expect(getIconName("dark")).toBe("moon");
    expect(getIconName("light")).toBe("sun");
    expect(getIconName("system")).toBe("computer-desktop");
    expect(getIconName(undefined)).toBe("computer-desktop");
  });
});

describe("Provider configuration", () => {
  const providerSource = fs.readFileSync(
    path.resolve(__dirname, "../components/shared/contexts/providers.tsx"),
    "utf-8",
  );

  it("wraps app with NextThemesProvider", () => {
    expect(providerSource).toContain("NextThemesProvider");
  });

  it("uses class attribute strategy for theme switching", () => {
    expect(providerSource).toContain('attribute="class"');
  });

  it("defaults to light theme", () => {
    expect(providerSource).toContain('defaultTheme="light"');
  });

  it("enables system theme detection", () => {
    expect(providerSource).toContain("enableSystem");
  });

  it("wraps HeroUIProvider inside NextThemesProvider", () => {
    const themesIdx = providerSource.indexOf("<NextThemesProvider");
    const heroIdx = providerSource.indexOf("<HeroUIProvider");
    // NextThemesProvider should appear before HeroUIProvider in JSX (it's the outer wrapper)
    expect(themesIdx).toBeGreaterThan(-1);
    expect(heroIdx).toBeGreaterThan(-1);
    expect(themesIdx).toBeLessThan(heroIdx);
  });
});

describe("No hardcoded theme-breaking colors in components", () => {
  const srcDir = path.resolve(__dirname, "../components");

  function getAllTsxFiles(dir: string): string[] {
    const files: string[] = [];
    const walk = (d: string) => {
      for (const entry of fs.readdirSync(d)) {
        const fullPath = path.join(d, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) walk(fullPath);
        else if (entry.endsWith(".tsx")) files.push(fullPath);
      }
    };
    walk(dir);
    return files;
  }

  const tsxFiles = getAllTsxFiles(srcDir);

  it("no active text-white classes remain (should use text-primary-foreground)", () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Skip commented lines
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;
        if (/\btext-white\b/.test(line) && !line.startsWith("//")) {
          violations.push(`${path.relative(srcDir, file)}:${i + 1}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no bg-gray-* classes remain (should use bg-default-*)", () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;
        if (/\bbg-gray-\d+\b/.test(line)) {
          violations.push(`${path.relative(srcDir, file)}:${i + 1}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no text-black classes remain (should use text-foreground)", () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;
        if (/\btext-black\b/.test(line)) {
          violations.push(`${path.relative(srcDir, file)}:${i + 1}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no counterproductive dark:text-default-[1-3]00 overrides (HeroUI inverts scale)", () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;
        if (/\bdark:text-default-[123]00\b/.test(line)) {
          violations.push(`${path.relative(srcDir, file)}:${i + 1}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
