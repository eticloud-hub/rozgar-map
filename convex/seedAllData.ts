import { mutation } from "./_generated/server";
import { seedInitialData } from "./seedData";
import { 
  seedMaharashtraDistricts, 
  seedMaharashtraMetrics, 
  seedMaharashtraMonthlyTrends 
} from "./seedMaharashtraDistricts";

export const seedEverything = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Step 1: Seeding initial data...");
    const step1 = await seedInitialData(ctx, {});
    
    console.log("Step 2: Seeding all Maharashtra districts...");
    const step2 = await seedMaharashtraDistricts(ctx, {});
    
    console.log("Step 3: Seeding Maharashtra metrics...");
    const step3 = await seedMaharashtraMetrics(ctx, {});
    
    console.log("Step 4: Seeding Maharashtra monthly trends...");
    const step4 = await seedMaharashtraMonthlyTrends(ctx, {});
    
    return {
      message: "All data seeded successfully!",
      steps: [step1, step2, step3, step4],
    };
  },
});
