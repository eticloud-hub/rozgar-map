import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedMaharashtraDistricts = mutation({
  args: {},
  handler: async (ctx) => {
    // Get Maharashtra state
    const maharashtra = await ctx.db
      .query("states")
      .withIndex("by_code", (q) => q.eq("code", "MH"))
      .first();

    if (!maharashtra) {
      throw new Error("Maharashtra state not found. Run seedInitialData first.");
    }

    // All 36 districts of Maharashtra with coordinates
    const maharashtraDistricts = [
      { name: "Ahmednagar", code: "MH-01", lat: 19.0948, lng: 74.7480 },
      { name: "Akola", code: "MH-02", lat: 20.7002, lng: 77.0082 },
      { name: "Amravati", code: "MH-03", lat: 20.9374, lng: 77.7796 },
      { name: "Chhatrapati Sambhaji Nagar", code: "MH-04", lat: 19.8762, lng: 75.3433 }, // Formerly Aurangabad
      { name: "Beed", code: "MH-05", lat: 18.9894, lng: 75.7585 },
      { name: "Bhandara", code: "MH-06", lat: 21.1704, lng: 79.6522 },
      { name: "Buldhana", code: "MH-07", lat: 20.5311, lng: 76.1841 },
      { name: "Chandrapur", code: "MH-08", lat: 19.9615, lng: 79.2961 },
      { name: "Dhule", code: "MH-09", lat: 20.9017, lng: 74.7749 },
      { name: "Gadchiroli", code: "MH-10", lat: 20.1809, lng: 80.0094 },
      { name: "Gondia", code: "MH-11", lat: 21.4557, lng: 80.1918 },
      { name: "Hingoli", code: "MH-12", lat: 19.7156, lng: 77.1547 },
      { name: "Jalgaon", code: "MH-13", lat: 21.0077, lng: 75.5626 },
      { name: "Jalna", code: "MH-14", lat: 19.8347, lng: 75.8800 },
      { name: "Kolhapur", code: "MH-15", lat: 16.7050, lng: 74.2433 },
      { name: "Latur", code: "MH-16", lat: 18.4088, lng: 76.5604 },
      { name: "Mumbai City", code: "MH-17", lat: 18.9750, lng: 72.8258 },
      { name: "Mumbai Suburban", code: "MH-18", lat: 19.0760, lng: 72.8777 },
      { name: "Nagpur", code: "MH-19", lat: 21.1458, lng: 79.0882 },
      { name: "Nanded", code: "MH-20", lat: 19.1383, lng: 77.3210 },
      { name: "Nandurbar", code: "MH-21", lat: 21.3700, lng: 74.2400 },
      { name: "Nashik", code: "MH-22", lat: 19.9975, lng: 73.7898 },
      { name: "Palghar", code: "MH-23", lat: 19.6967, lng: 72.7659 },
      { name: "Parbhani", code: "MH-24", lat: 19.2704, lng: 76.7749 },
      { name: "Pune", code: "MH-25", lat: 18.5204, lng: 73.8567 },
      { name: "Raigad", code: "MH-26", lat: 18.5204, lng: 73.0200 },
      { name: "Ratnagiri", code: "MH-27", lat: 16.9902, lng: 73.3120 },
      { name: "Sangli", code: "MH-28", lat: 16.8524, lng: 74.5815 },
      { name: "Satara", code: "MH-29", lat: 17.6805, lng: 74.0183 },
      { name: "Sindhudurg", code: "MH-30", lat: 16.0215, lng: 73.5181 },
      { name: "Solapur", code: "MH-31", lat: 17.6599, lng: 75.9064 },
      { name: "Thane", code: "MH-32", lat: 19.2183, lng: 72.9781 },
      { name: "Wardha", code: "MH-33", lat: 20.7453, lng: 78.6022 },
      { name: "Washim", code: "MH-34", lat: 20.1100, lng: 77.1400 },
      { name: "Yavatmal", code: "MH-35", lat: 20.3897, lng: 78.1307 },
      { name: "Dharashiv", code: "MH-36", lat: 18.2636, lng: 76.0554 }, // Formerly Osmanabad
    ];

    // Check if districts already exist
    const existingDistricts = await ctx.db
      .query("districts")
      .withIndex("by_state", (q) => q.eq("stateId", maharashtra._id))
      .collect();

    if (existingDistricts.length >= 36) {
      return { 
        message: "Maharashtra districts already seeded",
        existingCount: existingDistricts.length 
      };
    }

    // Insert all districts
    const insertedIds = [];
    for (const district of maharashtraDistricts) {
      // Check if district already exists
      const existing = await ctx.db
        .query("districts")
        .withIndex("by_code", (q) => q.eq("districtCode", district.code))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("districts", {
          name: district.name,
          stateId: maharashtra._id,
          districtCode: district.code,
          latitude: district.lat,
          longitude: district.lng,
        });
        insertedIds.push(id);
      }
    }

    return {
      message: "Maharashtra districts seeded successfully",
      totalDistricts: 36,
      newlyInserted: insertedIds.length,
      stateName: maharashtra.name,
    };
  },
});

// Seed sample metrics for all Maharashtra districts
export const seedMaharashtraMetrics = mutation({
  args: {},
  handler: async (ctx) => {
    const maharashtra = await ctx.db
      .query("states")
      .withIndex("by_code", (q) => q.eq("code", "MH"))
      .first();

    if (!maharashtra) {
      throw new Error("Maharashtra state not found");
    }

    const districts = await ctx.db
      .query("districts")
      .withIndex("by_state", (q) => q.eq("stateId", maharashtra._id))
      .collect();

    const currentTime = Date.now();
    const cacheExpiry = currentTime + 24 * 60 * 60 * 1000;

    let insertedCount = 0;

    // Generate sample metrics for each district
    for (const district of districts) {
      // Check if metrics already exist
      const existing = await ctx.db
        .query("districtMetrics")
        .withIndex("by_district_month", (q) => 
          q.eq("districtId", district._id).eq("month", "2024-10")
        )
        .first();

      if (!existing) {
        // Generate random but realistic metrics
        const baseHouseholds = Math.floor(Math.random() * 30000) + 20000;
        const householdsEmployed = Math.floor(baseHouseholds * (0.7 + Math.random() * 0.2));
        const personDays = Math.floor(householdsEmployed * (20 + Math.random() * 15));
        
        await ctx.db.insert("districtMetrics", {
          districtId: district._id,
          financialYear: "2024-25",
          month: "2024-10",
          householdsRegistered: baseHouseholds,
          householdsEmployed: householdsEmployed,
          personDaysGenerated: personDays,
          averageWagePerDay: Math.floor(300 + Math.random() * 100),
          fundsAllocated: Math.floor((8000 + Math.random() * 7000) * 100) / 100,
          fundsReleased: Math.floor((6000 + Math.random() * 5000) * 100) / 100,
          fundsUtilized: Math.floor((5000 + Math.random() * 4000) * 100) / 100,
          totalWorksStarted: Math.floor(300 + Math.random() * 200),
          totalWorksCompleted: Math.floor(200 + Math.random() * 150),
          workCompletionPercentage: Math.floor(70 + Math.random() * 25 * 100) / 100,
          womenEmploymentPercentage: Math.floor(45 + Math.random() * 15 * 100) / 100,
          scStEmploymentPercentage: Math.floor(20 + Math.random() * 15 * 100) / 100,
          dataSource: "SEED_DATA",
          lastUpdated: currentTime,
          isVerified: true,
          cacheExpiry: cacheExpiry,
        });
        insertedCount++;
      }
    }

    return {
      message: "Maharashtra district metrics seeded",
      totalDistricts: districts.length,
      metricsCreated: insertedCount,
    };
  },
});

// Seed monthly trends for all Maharashtra districts
export const seedMaharashtraMonthlyTrends = mutation({
  args: {},
  handler: async (ctx) => {
    const maharashtra = await ctx.db
      .query("states")
      .withIndex("by_code", (q) => q.eq("code", "MH"))
      .first();

    if (!maharashtra) {
      throw new Error("Maharashtra state not found");
    }

    const districts = await ctx.db
      .query("districts")
      .withIndex("by_state", (q) => q.eq("stateId", maharashtra._id))
      .collect();

    const currentTime = Date.now();
    let insertedCount = 0;

    for (const district of districts) {
      // Check if trends already exist
      const existing = await ctx.db
        .query("monthlyTrends")
        .withIndex("by_district_year", (q) => 
          q.eq("districtId", district._id).eq("year", 2024)
        )
        .first();

      if (!existing) {
        // Generate monthly trend data
        const baseHouseholds = Math.floor(Math.random() * 30000) + 20000;
        const monthlyData = [];

        for (let i = 1; i <= 10; i++) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
          const variation = 0.9 + Math.random() * 0.2; // ±10% variation
          
          monthlyData.push({
            month: monthNames[i - 1],
            monthNumber: i,
            personDays: Math.floor((baseHouseholds * 25 * variation)),
            households: Math.floor(baseHouseholds * 0.8 * variation),
            fundsUtilized: Math.floor((5000 + Math.random() * 3000) * variation * 100) / 100,
            workCompleted: Math.floor((40 + Math.random() * 20) * variation),
          });
        }

        await ctx.db.insert("monthlyTrends", {
          districtId: district._id,
          year: 2024,
          monthlyData: monthlyData,
          lastUpdated: currentTime,
        });
        insertedCount++;
      }
    }

    return {
      message: "Maharashtra monthly trends seeded",
      totalDistricts: districts.length,
      trendsCreated: insertedCount,
    };
  },
});
