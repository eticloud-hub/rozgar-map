import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to fetch all jobs
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobs").collect();
  },
});

// Mutation to create a new job
export const create = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    location: v.object({
      lat: v.float64(),
      lng: v.float64(),
      address: v.string(),
    }),
    description: v.string(),
    salary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      ...args,
      postedAt: Date.now(),
    });
    return jobId;
  },
});