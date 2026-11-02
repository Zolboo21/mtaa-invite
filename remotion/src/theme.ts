import { loadFont } from "@remotion/google-fonts/Montserrat";

// Same palette as app/globals.css on the site.
export const C = {
  bg: "#101419",
  bg2: "#1b2129",
  ink: "#eef2f6",
  ink2: "#9fb0c0",
  blue: "#1ea7e6",
  cyan: "#46c6f2",
  gold: "#e9c25f",
  goldBright: "#f6dd8f",
};

export const { fontFamily: FONT } = loadFont("normal", {
  weights: ["300", "500", "700", "800"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});
