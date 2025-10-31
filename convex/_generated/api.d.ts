/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as api_ from "../api.js";
import type * as crons from "../crons.js";
import type * as dataSync from "../dataSync.js";
import type * as http from "../http.js";
import type * as importRealMGNREGAData from "../importRealMGNREGAData.js";
import type * as jobs from "../jobs.js";
import type * as mutations from "../mutations.js";
import type * as queries from "../queries.js";
import type * as seedAllData from "../seedAllData.js";
import type * as seedData from "../seedData.js";
import type * as seedMaharashtraDistricts from "../seedMaharashtraDistricts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  api: typeof api_;
  crons: typeof crons;
  dataSync: typeof dataSync;
  http: typeof http;
  importRealMGNREGAData: typeof importRealMGNREGAData;
  jobs: typeof jobs;
  mutations: typeof mutations;
  queries: typeof queries;
  seedAllData: typeof seedAllData;
  seedData: typeof seedData;
  seedMaharashtraDistricts: typeof seedMaharashtraDistricts;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
