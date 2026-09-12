import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor Configuration for FMS Academic System (Android)
 *
 * To connect to your Cloud Server / Domain or local testing server:
 * Set process.env.CAPACITOR_SERVER_URL or modify the url below.
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL || undefined;

const config: CapacitorConfig = {
  appId: "com.fms.app",
  appName: "FMS Academic",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#ffffff",
  },
};

export default config;
