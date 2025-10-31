import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Update district metrics
export const updateDistrictMetrics = mutation({
  args: {
    districtId: v.id("districts"),
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
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();
    const cacheExpiry = currentTime + 24 * 60 * 60 * 1000; // 24 hours

    // Check if metrics already exist
    const existing = await ctx.db
      .query("districtMetrics")
      .withIndex("by_district_month", (q) =>
        q.eq("districtId", args.districtId).eq("month", args.month)
      )
      .first(); // ← FIX: Added closing parenthesis here

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        ...args,
        lastUpdated: currentTime,
        cacheExpiry: cacheExpiry,
        dataSource: "UPDATED",
        isVerified: false,
      });
      return { success: true, updated: true, id: existing._id };
    } else {
      // Create new
      const id = await ctx.db.insert("districtMetrics", {
        ...args,
        lastUpdated: currentTime,
        cacheExpiry: cacheExpiry,
        dataSource: "MANUAL",
        isVerified: false,
      });
      return { success: true, updated: false, id };
    }
  },
});

// Add new district
export const addDistrict = mutation({
  args: {
    name: v.string(),
    stateId: v.id("states"),
    districtCode: v.string(),
    population: v.optional(v.number()),
    ruralPopulation: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("districts", args);
    return { success: true, id };
  },
});
