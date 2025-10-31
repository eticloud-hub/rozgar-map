import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Import real Maharashtra MGNREGA data
 * Run this from Convex dashboard with the processed JSON data
 */
export const importMaharashtraRealData = mutation({
  args: {
    data: v.array(v.object({
      districtCode: v.string(),
      districtName: v.string(),
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
    })),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();
    const cacheExpiry = currentTime + 30 * 24 * 60 * 60 * 1000; // 30 days

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const record of args.data) {
      try {
        // Find district by code
        const district = await ctx.db
          .query("districts")
          .withIndex("by_code", (q) => q.eq("districtCode", record.districtCode))
          .first();

        if (!district) {
          errors.push(`District ${record.districtCode} (${record.districtName}) not found`);
          skipped++;
          continue;
        }

        // Check if data already exists
        const existing = await ctx.db
          .query("districtMetrics")
          .withIndex("by_district_month", (q) =>
            q.eq("districtId", district._id).eq("month", record.month)
          )
          .first();

        const metricsData = {
          districtId: district._id,
          financialYear: record.financialYear,
          month: record.month,
          householdsRegistered: record.householdsRegistered,
          householdsEmployed: record.householdsEmployed,
          personDaysGenerated: record.personDaysGenerated,
          averageWagePerDay: record.averageWagePerDay,
          fundsAllocated: record.fundsAllocated,
          fundsReleased: record.fundsReleased,
          fundsUtilized: record.fundsUtilized,
          totalWorksStarted: record.totalWorksStarted,
          totalWorksCompleted: record.totalWorksCompleted,
          workCompletionPercentage: record.workCompletionPercentage,
          womenEmploymentPercentage: record.womenEmploymentPercentage,
          scStEmploymentPercentage: record.scStEmploymentPercentage,
          dataSource: "MGNREGA_OFFICIAL_DATA",
          lastUpdated: currentTime,
          isVerified: true,
          cacheExpiry: cacheExpiry,
        };

        if (existing) {
          await ctx.db.patch(existing._id, metricsData);
          updated++;
        } else {
          await ctx.db.insert("districtMetrics", metricsData);
          imported++;
        }
      } catch (error) {
        const errorMsg = `Error processing ${record.districtCode}: ${error}`;
        errors.push(errorMsg);
        skipped++;
      }
    }

    return {
      success: true,
      imported,
      updated,
      skipped,
      errors: errors.slice(0, 20), // Return first 20 errors
      totalRecords: args.data.length,
      summary: `Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`,
    };
  },
});
