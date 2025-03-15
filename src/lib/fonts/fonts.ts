// import { IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";

// export const ibm = IBM_Plex_Sans_Arabic({
//   subsets: ["arabic"],
//   weight: ["400", "500", "600", "700"],
// });

export const ibm = localFont({
  src: [
    {
      path: "./IBMPlexSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./IBMPlexSansArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./IBMPlexSansArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./IBMPlexSansArabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});
