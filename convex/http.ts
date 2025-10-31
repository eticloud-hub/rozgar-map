import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * GET /api/districts
 * Get all districts with pagination
 */
http.route({
  path: "/api/districts",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const state = url.searchParams.get("state") || "Maharashtra";

    try {
      const districts = await ctx.runQuery(api.api.getDistricts, {
        state,
        page,
        limit,
      });

      return new Response(JSON.stringify(districts), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch districts" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * GET /api/district/:code/performance
 * Get performance data for a specific district
 */
http.route({
  path: "/api/district/:code/performance",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.pathname.split("/")[3];
    const months = parseInt(url.searchParams.get("months") || "6");

    try {
      const performance = await ctx.runQuery(api.api.getDistrictPerformance, {
        districtCode: code,
        months,
      });

      return new Response(JSON.stringify(performance), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=1800", // Cache for 30 minutes
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "District not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * GET /api/trends/monthly
 * Get monthly trends across all districts
 */
http.route({
  path: "/api/trends/monthly",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get("months") || "12");

    try {
      const trends = await ctx.runQuery(api.api.getMonthlyTrends, { months });

      return new Response(JSON.stringify(trends), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch trends" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * GET /api/state/average
 * Get state-wide averages
 */
http.route({
  path: "/api/state/average",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const average = await ctx.runQuery(api.api.getStateAverage);

      return new Response(JSON.stringify(average), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=1800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch state average" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
