import path from "node:path";
import { Config } from "@remotion/cli/config";

// Share the Next.js site's public/ folder (logos, team photos).
Config.setPublicDir("../public");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// components/film/* (played live on the site by @remotion/player) is also
// registered here; make it resolve this project's single copy of remotion/react.
const own = (m: string) => path.resolve(process.cwd(), "node_modules", m);
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    alias: {
      ...(c.resolve?.alias as Record<string, string>),
      remotion: own("remotion"),
      react: own("react"),
      "react-dom": own("react-dom"),
    },
  },
}));
