import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 2 AM IST to refresh MGNREGA data
crons.daily(
  "refresh-mgnrega-data",
  { hourUTC: 20, minuteUTC: 30 }, // 2:00 AM IST = 20:30 UTC previous day
  internal.dataSync.refreshMGNREGAData
);

// Cleanup old cache entries weekly
crons.weekly(
  "cleanup-old-cache",
  { hourUTC: 3, minuteUTC: 0, dayOfWeek: "sunday" },
  internal.dataSync.cleanupOldCache
);

export default crons;
