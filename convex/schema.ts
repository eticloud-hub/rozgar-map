import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // States table - Master data
  states: defineTable({
    name: v.string(),
    code: v.string(), // e.g., "MH" for Maharashtra
    region: v.string(), // North, South, East, West, Central, Northeast
    population: v.optional(v.number()),
    totalDistricts: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_name", ["name"]),

  // Districts table - Master data
  districts: defineTable({
    name: v.string(),
    stateId: v.id("states"),
    districtCode: v.string(), // Unique identifier from MGNREGA
    population: v.optional(v.number()),
    ruralPopulation: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  })
    .index("by_state", ["stateId"])
    .index("by_code", ["districtCode"])
    .index("by_location", ["latitude", "longitude"]),

  // MGNREGA Performance Metrics - Time-series data
  districtMetrics: defineTable({
    districtId: v.id("districts"),
    
    // Financial Year
    financialYear: v.string(), // e.g., "2024-25"
    month: v.string(), // e.g., "2024-10" for October 2024
    
    // Core MGNREGA Metrics
    householdsRegistered: v.number(),
    householdsEmployed: v.number(),
    personDaysGenerated: v.number(),
    averageWagePerDay: v.number(),
    
    // Financial Data
    fundsAllocated: v.number(), // In lakhs
    fundsReleased: v.number(), // In lakhs
    fundsUtilized: v.number(), // In lakhs
    
    // Work Completion
    totalWorksStarted: v.number(),
    totalWorksCompleted: v.number(),
    workCompletionPercentage: v.number(),
    
    // Employment Metrics
    womenEmploymentPercentage: v.number(),
    scStEmploymentPercentage: v.number(),
    
    // Data Quality & Caching
    dataSource: v.string(), // "MGNREGA_API", "MANUAL", "CACHED"
    lastUpdated: v.number(), // Unix timestamp
    isVerified: v.boolean(), // Admin verification flag
    cacheExpiry: v.number(), // Unix timestamp for cache invalidation
  })
    .index("by_district", ["districtId"])
    .index("by_district_month", ["districtId", "month"])
    .index("by_financial_year", ["financialYear"])
    .index("by_cache_expiry", ["cacheExpiry"])
    .index("by_last_updated", ["lastUpdated"]),

  // State-level aggregated metrics for comparison
  stateMetrics: defineTable({
    stateId: v.id("states"),
    financialYear: v.string(),
    month: v.string(),
    
    // Aggregated metrics
    totalHouseholdsEmployed: v.number(),
    totalPersonDays: v.number(),
    averageWagePerDay: v.number(),
    totalFundsUtilized: v.number(),
    workCompletionPercentage: v.number(),
    
    // Caching
    lastUpdated: v.number(),
    cacheExpiry: v.number(),
  })
    .index("by_state", ["stateId"])
    .index("by_state_month", ["stateId", "month"])
    .index("by_financial_year", ["financialYear"]),

  // Historical trends for charts (monthly aggregations)
  monthlyTrends: defineTable({
    districtId: v.id("districts"),
    year: v.number(), // 2024
    
    // Monthly breakdown (12 months)
    monthlyData: v.array(v.object({
      month: v.string(), // "Jan", "Feb", etc.
      monthNumber: v.number(), // 1-12
      personDays: v.number(),
      households: v.number(),
      fundsUtilized: v.number(),
      workCompleted: v.number(),
    })),
    
    lastUpdated: v.number(),
  })
    .index("by_district", ["districtId"])
    .index("by_district_year", ["districtId", "year"]),

  // API Cache - Store external API responses
  apiCache: defineTable({
    cacheKey: v.string(), // Unique identifier for cached data
    endpoint: v.string(), // API endpoint
    requestParams: v.string(), // JSON string of request parameters
    responseData: v.string(), // JSON string of response
    createdAt: v.number(),
    expiresAt: v.number(),
    hitCount: v.number(), // Track cache usage
  })
    .index("by_key", ["cacheKey"])
    .index("by_expiry", ["expiresAt"])
    .index("by_endpoint", ["endpoint"]),

  // Data sync logs - Track MGNREGA API sync status
  syncLogs: defineTable({
    syncType: v.string(), // "DISTRICT", "STATE", "NATIONAL"
    entityId: v.optional(v.string()), // District or State ID
    status: v.string(), // "SUCCESS", "FAILED", "IN_PROGRESS"
    recordsProcessed: v.number(),
    errorMessage: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    nextScheduledSync: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_type", ["syncType"])
    .index("by_entity", ["entityId"])
    .index("by_next_sync", ["nextScheduledSync"]),

  // User preferences (future feature)
  userPreferences: defineTable({
    userId: v.string(), // From Convex Auth or your auth system
    favoriteDistricts: v.array(v.id("districts")),
    preferredLanguage: v.string(), // "en", "hi", etc.
    notificationSettings: v.object({
      emailEnabled: v.boolean(),
      smsEnabled: v.boolean(),
    }),
  })
    .index("by_user", ["userId"]),
});
