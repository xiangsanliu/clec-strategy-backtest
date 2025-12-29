import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.qqq.backtester',
  appName: 'QQQ Backtester',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
