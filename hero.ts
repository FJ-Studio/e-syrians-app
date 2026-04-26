import { heroui } from "@heroui/react";
// or import from theme package if you are using individual packages.
// import { heroui } from '@heroui/theme';
export default heroui({
  themes: {
    light: {
      colors: {
        background: "#ffffff",
        foreground: "#171717",
        primary: {
          DEFAULT: "#393d98",
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ededed",
        primary: {
          DEFAULT: "#5258b5",
          foreground: "#ffffff",
        },
      },
    },
  },
});
