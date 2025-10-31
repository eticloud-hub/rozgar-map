import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingStates = await ctx.db.query("states").first();
    if (existingStates) {
      return { message: "Data already seeded" };
    }

    // Seed States
    const maharashtraId = await ctx.db.insert("states", {
      name: "Maharashtra",
      code: "MH",
      region: "West",
      population: 112374333,
      totalDistricts: 36,
    });

    const karnatakaId = await ctx.db.insert("states", {
      name: "Karnataka",
      code: "KA",
      region: "South",
      population: 61095297,
      totalDistricts: 31,
    });

    const tamilNaduId = await ctx.db.insert("states", {
      name: "Tamil Nadu",
      code: "TN",
      region: "South",
      population: 72147030,
      totalDistricts: 38,
    });

    const uttarPradeshId = await ctx.db.insert("states", {
      name: "Uttar Pradesh",
      code: "UP",
      region: "North",
      population: 199812341,
      totalDistricts: 75,
    });

    // Seed Districts
    const mumbaiId = await ctx.db.insert("districts", {
      name: "Mumbai",
      stateId: maharashtraId,
      districtCode: "MH-01",
      population: 12442373,
      ruralPopulation: 2500000,
      latitude: 19.0760,
      longitude: 72.8777,
    });

    const puneId = await ctx.db.insert("districts", {
      name: "Pune",
      stateId: maharashtraId,
      districtCode: "MH-02",
      population: 9429408,
      ruralPopulation: 4500000,
      latitude: 18.5204,
      longitude: 73.8567,
    });

    const bangaloreId = await ctx.db.insert("districts", {
      name: "Bangalore",
      stateId: karnatakaId,
      districtCode: "KA-01",
      population: 12000000,
      ruralPopulation: 3000000,
      latitude: 12.9716,
      longitude: 77.5946,
    });

    const chennaiId = await ctx.db.insert("districts", {
      name: "Chennai",
      stateId: tamilNaduId,
      districtCode: "TN-01",
      population: 10000000,
      ruralPopulation: 2000000,
      latitude: 13.0827,
      longitude: 80.2707,
    });

    // Seed Sample Metrics for Mumbai
    const currentTime = Date.now();
    const cacheExpiry = currentTime + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("districtMetrics", {
      districtId: mumbaiId,
      financialYear: "2024-25",
      month: "2024-10",
      householdsRegistered: 50000,
      householdsEmployed: 45230,
      personDaysGenerated: 1250000,
      averageWagePerDay: 350,
      fundsAllocated: 15000,
      fundsReleased: 12550,
      fundsUtilized: 11000,
      totalWorksStarted: 450,
      totalWorksCompleted: 392,
      workCompletionPercentage: 87.1,
      womenEmploymentPercentage: 52.3,
      scStEmploymentPercentage: 28.5,
      dataSource: "SEED_DATA",
      lastUpdated: currentTime,
      isVerified: true,
      cacheExpiry: cacheExpiry,
    });

    // Seed Monthly Trends for Mumbai
    await ctx.db.insert("monthlyTrends", {
      districtId: mumbaiId,
      year: 2024,
      monthlyData: [
        { month: "Jan", monthNumber: 1, personDays: 95000, households: 38000, fundsUtilized: 850, workCompleted: 35 },
        { month: "Feb", monthNumber: 2, personDays: 105000, households: 41000, fundsUtilized: 920, workCompleted: 42 },
        { month: "Mar", monthNumber: 3, personDays: 115000, households: 43000, fundsUtilized: 1000, workCompleted: 48 },
        { month: "Apr", monthNumber: 4, personDays: 108000, households: 42000, fundsUtilized: 950, workCompleted: 45 },
        { month: "May", monthNumber: 5, personDays: 120000, households: 45000, fundsUtilized: 1050, workCompleted: 52 },
        { month: "Jun", monthNumber: 6, personDays: 125000, households: 45230, fundsUtilized: 1100, workCompleted: 55 },
        { month: "Jul", monthNumber: 7, personDays: 130000, households: 46000, fundsUtilized: 1150, workCompleted: 58 },
        { month: "Aug", monthNumber: 8, personDays: 135000, households: 47000, fundsUtilized: 1200, workCompleted: 62 },
        { month: "Sep", monthNumber: 9, personDays: 140000, households: 48000, fundsUtilized: 1250, workCompleted: 65 },
        { month: "Oct", monthNumber: 10, personDays: 125000, households: 45230, fundsUtilized: 1100, workCompleted: 60 },
      ],
      lastUpdated: currentTime,
    });

    return { 
      message: "Initial data seeded successfully",
      statesCreated: 4,
      districtsCreated: 4,
    };
  },
});
