import { Config } from "@remotion/cli/config";

// Share the Next.js site's public/ folder (logos, team photos).
Config.setPublicDir("../public");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
