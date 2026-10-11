import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "bd.medsupply.b2b",
  appName: "MedSupplyBD",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
};

export default config;
