import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Rate limiter configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  retryDelay: 5000, // 5 seconds
  maxRetries: 3,
};

/**
 * Main cron job action to refresh MGNREGA data
 */
export const refreshMGNREGAData = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting MGNREGA data refresh...");
    
    try {
      // Fetch all districts - FIX: Changed to internalQuery
      const districts = await ctx.runQuery(internal.dataSync.getDistrictsForSync);
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process districts in batches to respect rate limits
      const batchSize = 5;
      for (let i = 0; i < districts.length; i += batchSize) {
        const batch = districts.slice(i, i + batchSize);
        
        // Process batch with delay
        for (const district of batch) {
          try {
            await fetchAndUpdateDistrictData(ctx, district);
            successCount++;
            
            // Delay between requests to respect rate limits
            await sleep(2000); // 2 seconds between requests
          } catch (error) {
            errorCount++;
            const errorMsg = `Failed to update ${district.name}: ${error}`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
        
        // Longer delay between batches
        if (i + batchSize < districts.length) {
          await sleep(5000); // 5 seconds between batches
        }
      }

      // Log sync result
      await ctx.runMutation(internal.dataSync.logSyncResult, {
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Store first 10 errors
      });

      console.log(`✅ Data refresh completed: ${successCount} success, ${errorCount} errors`);
      
      return { success: true, successCount, errorCount };
    } catch (error) {
      console.error("❌ Data refresh failed:", error);
      throw error;
    }
  },
});

/**
 * Fetch and update data for a single district
 * FIX: Added proper types
 */
async function fetchAndUpdateDistrictData(
  ctx: { runMutation: (fn: any, args: any) => Promise<any> },
  district: { _id: any; name: string; districtCode: string }
) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // MGNREGA API endpoint (replace with actual endpoint)
  const apiUrl = `https://nrega.nic.in/netnrega/api/district_data`;
  
  let retries = 0;
  while (retries < RATE_LIMIT.maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RozgarMap/1.0',
        },
        body: JSON.stringify({
          district_code: district.districtCode,
          year: year,
          month: month,
        }),
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        retries++;
        await sleep(RATE_LIMIT.retryDelay * retries);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update database
      await ctx.runMutation(internal.dataSync.updateDistrictMetrics, {
        districtId: district._id,
        data: transformAPIData(data),
      });
      
      return;
    } catch (error) {
      retries++;
      if (retries >= RATE_LIMIT.maxRetries) {
        throw error;
      }
      await sleep(RATE_LIMIT.retryDelay * retries);
    }
  }
}

/**
 * Transform API response to database format
 * FIX: Added proper types
 */
function transformAPIData(apiData: Record<string, any>) {
  return {
    financialYear: apiData.fin_year || "2025-2026",
    month: apiData.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    householdsRegistered: parseInt(apiData.households_registered) || 0,
    householdsEmployed: parseInt(apiData.households_employed) || 0,
    personDaysGenerated: parseInt(apiData.person_days) || 0,
    averageWagePerDay: parseFloat(apiData.avg_wage) || 0,
    fundsAllocated: parseFloat(apiData.funds_allocated) / 100000 || 0,
    fundsReleased: parseFloat(apiData.funds_released) / 100000 || 0,
    fundsUtilized: parseFloat(apiData.funds_utilized) / 100000 || 0,
    totalWorksStarted: parseInt(apiData.works_started) || 0,
    totalWorksCompleted: parseInt(apiData.works_completed) || 0,
    workCompletionPercentage: parseFloat(apiData.completion_pct) || 0,
    womenEmploymentPercentage: parseFloat(apiData.women_pct) || 0,
    scStEmploymentPercentage: parseFloat(apiData.sc_st_pct) || 0,
    dataSource: "MGNREGA_API",
    lastUpdated: Date.now(),
    isVerified: true,
    cacheExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}

/**
 * Helper function to sleep
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get districts for sync (internal query)
 * FIX: Changed from internalMutation to internalQuery
 */
export const getDistrictsForSync = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("districts").collect();
  },
});

/**
 * Update district metrics (internal mutation)
 */
export const updateDistrictMetrics = internalMutation({
  args: {
    districtId: v.id("districts"),
    data: v.object({
      financialYear: v.string(),
      month: v.string(),
      householdsRegistered: v.number(),
      householdsEmployed: v.number(),
      personDaysGenerated: v.number(),
      averageWagePerDay: v.number(),
      fundsAllocated: v.number(),
      fundsReleased: v.number(),
      fundsUtilized: v.number(),
      totalWorksStarted: v.number(),
      totalWorksCompleted: v.number(),
      workCompletionPercentage: v.number(),
      womenEmploymentPercentage: v.number(),
      scStEmploymentPercentage: v.number(),
      dataSource: v.string(),
      lastUpdated: v.number(),
      isVerified: v.boolean(),
      cacheExpiry: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Check if record exists for this month
    const existing = await ctx.db
      .query("districtMetrics")
      .withIndex("by_district_month", (q) =>
        q.eq("districtId", args.districtId).eq("month", args.data.month)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.data);
    } else {
      await ctx.db.insert("districtMetrics", {
        districtId: args.districtId,
        ...args.data,
      });
    }
  },
});

/**
 * Log sync result
 * FIX: Changed 'timestamp' to match schema
 */
export const logSyncResult = internalMutation({
  args: {
    successCount: v.number(),
    errorCount: v.number(),
    errors: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("syncLogs", {
      syncType: "daily_refresh",
      status: args.errorCount > 0 ? "partial" : "success",
      recordsProcessed: args.successCount,
      startTime: Date.now(),
      endTime: Date.now(),
      errorMessage: args.errors.join("; ") || undefined,
    });
  },
});

/**
 * Cleanup old cache entries
 */
export const cleanupOldCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Delete metrics older than 1 month
    const oldMetrics = await ctx.db
      .query("districtMetrics")
      .filter((q) => q.lt(q.field("cacheExpiry"), oneMonthAgo))
      .collect();

    for (const metric of oldMetrics) {
      await ctx.db.delete(metric._id);
    }

    console.log(`🧹 Cleaned up ${oldMetrics.length} old cache entries`);
  },
});
