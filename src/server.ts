import { CronJob } from "cron";
import app from "./app";
import { ENV } from "./config/env";

// Keep-alive cron job: Pings the server every 14 minutes
const job = CronJob.from({
  cronTime: "0 */14 * * * *", // Runs every 14 minutes
  onTick: async () => {
    console.log("⏳ Pinging server to keep it alive...");
    try {
      const response = await fetch(`${ENV.SERVER_URL}/ping`);
      if (response.ok) {
        console.log("✅ Ping successful:", await response.text());
      } else {
        console.error("❌ Ping failed with status:", response.status);
      }
    } catch (error) {
      console.error("❌ Error during ping:", error);
    }
  },
  start: true,
  timeZone: "UTC"
});

app.listen(ENV.PORT, () => {
  console.log(`✅ Server running on http://localhost:${ENV.PORT} in ${ENV.NODE_ENV} mode`);
  console.log(`⏰ Keep-alive cron job started (every 14 mins)`);
});
