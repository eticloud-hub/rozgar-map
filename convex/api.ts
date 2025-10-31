/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all districts with pagination
 */
export const getDistricts = query({
  args: {
    stateId: v.optional(v.id("states")),
    page: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const offset = (args.page - 1) * args.limit;
    
    // Fetch districts based on optional stateId filter
    let allDistricts;
    
    if (args.stateId) {
      // Filter by stateId using index
      allDistricts = await ctx.db
        .query("districts")
        .withIndex("by_state", (q) => q.eq("stateId", args.stateId as any))
        .collect();
    } else {
      // Get all districts
      allDistricts = await ctx.db
        .query("districts")
        .collect();
    }
    
    const paginatedDistricts = allDistricts.slice(offset, offset + args.limit);

    return {
      data: paginatedDistricts,
      pagination: {
        page: args.page,
        limit: args.limit,
        total: allDistricts.length,
        totalPages: Math.ceil(allDistricts.length / args.limit),
      },
    };
  },
});

/**
 * Get district performance data
 */
export const getDistrictPerformance = query({
  args: {
    districtCode: v.string(),
    months: v.number(),
  },
  handler: async (ctx, args) => {
    // Find district by code
    const district = await ctx.db
      .query("districts")
      .withIndex("by_code", (q) => q.eq("districtCode", args.districtCode))
      .first();

    if (!district) {
      throw new Error("District not found");
    }

    // Get metrics for last N months
    const metrics = await ctx.db
      .query("districtMetrics")
      .withIndex("by_district", (q) => q.eq("districtId", district._id))
      .order("desc")
      .take(args.months);

    // Get state information
    const state = await ctx.db.get(district.stateId);

    return {
      district: {
        code: district.districtCode,
        name: district.name,
        stateName: state?.name || "Unknown",
        stateId: district.stateId,
      },
      metrics: metrics.map(m => ({
        month: m.month,
        householdsEmployed: m.householdsEmployed,
        personDaysGenerated: m.personDaysGenerated,
        averageWage: m.averageWagePerDay,
        fundsUtilized: m.fundsUtilized,
        workCompletionPercentage: m.workCompletionPercentage,
        womenEmploymentPercentage: m.womenEmploymentPercentage,
      })),
      lastUpdated: metrics[0]?.lastUpdated || Date.now(),
    };
  },
});

/**
 * Get monthly trends across all districts
 */
export const getMonthlyTrends = query({
  args: { months: v.number() },
  handler: async (ctx, args) => {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - args.months);
    const cutoffMonth = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`;

    // Get all metrics from last N months
    const metrics = await ctx.db
      .query("districtMetrics")
      .filter((q) => q.gte(q.field("month"), cutoffMonth))
      .collect();

    // Group by month
    const monthlyData: Record<string, any> = {};

    for (const metric of metrics) {
      if (!monthlyData[metric.month]) {
        monthlyData[metric.month] = {
          month: metric.month,
          totalHouseholds: 0,
          totalPersonDays: 0,
          totalFundsUtilized: 0,
          districtCount: 0,
        };
      }

      monthlyData[metric.month].totalHouseholds += metric.householdsEmployed;
      monthlyData[metric.month].totalPersonDays += metric.personDaysGenerated;
      monthlyData[metric.month].totalFundsUtilized += metric.fundsUtilized;
      monthlyData[metric.month].districtCount += 1;
    }

    // Sort by month
    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  },
});

/**
 * Get state-wide average statistics
 */
export const getStateAverage = query({
  args: {},
  handler: async (ctx) => {
    // Get all districts
    const districts = await ctx.db.query("districts").collect();
    
    let totalHouseholds = 0;
    let totalPersonDays = 0;
    let totalWage = 0;
    let totalFundsUtilized = 0;
    let count = 0;

    // Aggregate latest metrics for each district
    for (const district of districts) {
      const latestMetric = await ctx.db
        .query("districtMetrics")
        .withIndex("by_district", (q) => q.eq("districtId", district._id))
        .order("desc")
        .first();

      if (latestMetric) {
        totalHouseholds += latestMetric.householdsEmployed;
        totalPersonDays += latestMetric.personDaysGenerated;
        totalWage += latestMetric.averageWagePerDay;
        totalFundsUtilized += latestMetric.fundsUtilized;
        count++;
      }
    }

    return {
      state: "Maharashtra",
      averageHouseholdsEmployed: Math.round(totalHouseholds / count),
      averagePersonDays: Math.round(totalPersonDays / count),
      averageWage: Math.round((totalWage / count) * 100) / 100,
      totalFundsUtilized: Math.round(totalFundsUtilized * 100) / 100,
      districtsCount: count,
      timestamp: Date.now(),
    };
  },
});
