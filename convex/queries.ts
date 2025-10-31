import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all districts
 */
export const getAllDistricts = query({
  args: {},
  handler: async (ctx) => {
    const districts = await ctx.db.query("districts").collect();
    return districts;
  },
});

/**
 * Get district by code
 */
export const getDistrictByCode = query({
  args: { districtCode: v.string() },
  handler: async (ctx, args) => {
    const district = await ctx.db
      .query("districts")
      .withIndex("by_code", (q) => q.eq("districtCode", args.districtCode))
      .first();

    if (!district) {
      return null;
    }

    // Get state information
    const state = await ctx.db.get(district.stateId);

    return {
      ...district,
      stateName: state?.name || "Unknown",
    };
  },
});

/**
 * Get district metrics
 */
export const getDistrictMetrics = query({
  args: {
    districtCode: v.string(),
    months: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find district
    const district = await ctx.db
      .query("districts")
      .withIndex("by_code", (q) => q.eq("districtCode", args.districtCode))
      .first();

    if (!district) {
      throw new Error("District not found");
    }

    // Get metrics
    const metricsQuery = ctx.db
      .query("districtMetrics")
      .withIndex("by_district", (q) => q.eq("districtId", district._id))
      .order("desc");

    const metrics = args.months
      ? await metricsQuery.take(args.months)
      : await metricsQuery.collect();

    // Get state
    const state = await ctx.db.get(district.stateId);

    return {
      district: {
        code: district.districtCode,
        name: district.name,
        stateName: state?.name || "Unknown",
      },
      metrics: metrics.map((m) => ({
        month: m.month,
        householdsEmployed: m.householdsEmployed,
        personDaysGenerated: m.personDaysGenerated,
        averageWage: m.averageWagePerDay,
        fundsUtilized: m.fundsUtilized,
        workCompletionPercentage: m.workCompletionPercentage,
        womenEmploymentPercentage: m.womenEmploymentPercentage,
        lastUpdated: m.lastUpdated,
      })),
    };
  },
});

/**
 * Get latest metrics for all districts
 */
export const getAllDistrictsLatestMetrics = query({
  args: {},
  handler: async (ctx) => {
    const districts = await ctx.db.query("districts").collect();
    const results = [];

    for (const district of districts) {
      const latestMetric = await ctx.db
        .query("districtMetrics")
        .withIndex("by_district", (q) => q.eq("districtId", district._id))
        .order("desc")
        .first();

      if (latestMetric) {
        results.push({
          districtCode: district.districtCode,
          districtName: district.name,
          householdsEmployed: latestMetric.householdsEmployed,
          personDaysGenerated: latestMetric.personDaysGenerated,
          averageWage: latestMetric.averageWagePerDay,
          fundsUtilized: latestMetric.fundsUtilized,
          workCompletionPercentage: latestMetric.workCompletionPercentage,
          womenEmploymentPercentage: latestMetric.womenEmploymentPercentage,
          month: latestMetric.month,
        });
      }
    }

    return results;
  },
});

/**
 * Compare multiple districts - NEW FUNCTION
 */
export const compareDistricts = query({
  args: {
    districtCodes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const comparisons = [];

    for (const code of args.districtCodes) {
      // Get district
      const district = await ctx.db
        .query("districts")
        .withIndex("by_code", (q) => q.eq("districtCode", code))
        .first();

      if (!district) continue;

      // Get latest metrics
      const latestMetric = await ctx.db
        .query("districtMetrics")
        .withIndex("by_district", (q) => q.eq("districtId", district._id))
        .order("desc")
        .first();

      // Get state
      const state = await ctx.db.get(district.stateId);

      if (latestMetric) {
        comparisons.push({
          district: {
            code: district.districtCode,
            name: district.name,
            stateName: state?.name || "Unknown",
          },
          metrics: {
            householdsEmployed: latestMetric.householdsEmployed,
            personDaysGenerated: latestMetric.personDaysGenerated,
            averageWage: latestMetric.averageWagePerDay,
            fundsUtilized: latestMetric.fundsUtilized,
            workCompletionPercentage: latestMetric.workCompletionPercentage,
            womenEmploymentPercentage: latestMetric.womenEmploymentPercentage,
            month: latestMetric.month,
          },
        });
      }
    }

    return comparisons;
  },
});

/**
 * Get top performing districts
 */
export const getTopPerformingDistricts = query({
  args: {
    limit: v.optional(v.number()),
    metric: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const metric = args.metric || "householdsEmployed";

    const districts = await ctx.db.query("districts").collect();
    const results = [];

    for (const district of districts) {
      const latestMetric = await ctx.db
        .query("districtMetrics")
        .withIndex("by_district", (q) => q.eq("districtId", district._id))
        .order("desc")
        .first();

      if (latestMetric) {
        results.push({
          districtCode: district.districtCode,
          districtName: district.name,
          value: (latestMetric as any)[metric] || 0,
          householdsEmployed: latestMetric.householdsEmployed,
          personDaysGenerated: latestMetric.personDaysGenerated,
          workCompletionPercentage: latestMetric.workCompletionPercentage,
        });
      }
    }

    // Sort by metric
    results.sort((a, b) => b.value - a.value);

    return results.slice(0, limit);
  },
});
