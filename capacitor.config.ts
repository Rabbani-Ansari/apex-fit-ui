import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ed72411483fc451a9f5faae5f46621ad',
  appName: 'FitnessPro',
  webDir: 'dist',
  server: {
    url: 'https://ed724114-83fc-451a-9f5f-aae5f46621ad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
