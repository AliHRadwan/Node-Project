import cron from "node-cron";
import { truncate } from "fs/promises";
import { winstonLogger } from "../config/logger.js";

const startLogCleaner = () => {
  // Schedule: Every Friday at 5:00 AM ("0 5 * * 5")
  const logsCleaner = cron.schedule("0 * * * *", async () => {
    winstonLogger.info("[CRON] Starting weekly log cleanup.");

    try {
      await truncate("logs/error.log", 0);
      await truncate("logs/combined.log", 0);
      winstonLogger.info("[CRON] Log cleanup task completed.");
    } catch (error) {
      winstonLogger.error("[CRON] Failed to clear log files:", error);
    }
  });
}
export default startLogCleaner;