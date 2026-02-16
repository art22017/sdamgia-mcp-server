/**
 * Zod validation schemas for tool inputs
 */

import { z } from "zod";
import { Subject, ResponseFormat } from "../types.js";

/**
 * Schema for subject parameter
 */
export const SubjectSchema = z.nativeEnum(Subject, {
  errorMap: () => ({ message: "Invalid subject. Must be one of: math, mathb, rus, phys, chem, bio, geo, hist, soc, inf, en, de, fr, sp, lit" })
});

/**
 * Schema for response format parameter
 */
export const ResponseFormatSchema = z.nativeEnum(ResponseFormat, {
  errorMap: () => ({ message: "Invalid format. Must be 'json' or 'markdown'" })
}).default(ResponseFormat.MARKDOWN);

/**
 * Schema for problem ID
 */
export const ProblemIdSchema = z.string()
  .min(1, "Problem ID cannot be empty")
  .max(20, "Problem ID too long")
  .regex(/^\d+$/, "Problem ID must contain only digits")
  .describe("Problem ID (numeric string)");

/**
 * Schema for test ID
 */
export const TestIdSchema = z.string()
  .min(1, "Test ID cannot be empty")
  .max(20, "Test ID too long")
  .regex(/^\d+$/, "Test ID must contain only digits")
  .describe("Test ID (numeric string)");

/**
 * Schema for category ID
 */
export const CategoryIdSchema = z.string()
  .min(1, "Category ID cannot be empty")
  .max(20, "Category ID too long")
  .describe("Category ID");

/**
 * Schema for search query
 */
export const SearchQuerySchema = z.string()
  .min(3, "Query must be at least 3 characters")
  .max(500, "Query must not exceed 500 characters")
  .describe("Search query text");

/**
 * Schema for limit parameter
 */
export const LimitSchema = z.number()
  .int()
  .min(1, "Limit must be at least 1")
  .max(50, "Limit must not exceed 50")
  .default(20)
  .describe("Maximum number of results to return");

/**
 * Schema for similarity threshold
 */
export const ThresholdSchema = z.number()
  .min(0, "Threshold must be between 0 and 1")
  .max(1, "Threshold must be between 0 and 1")
  .default(0.6)
  .describe("Similarity threshold for fuzzy matching (0-1, higher = stricter)");

/**
 * Schema for sdamgia_get_problem tool
 */
export const GetProblemInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code (e.g., 'math', 'phys', 'inf')"),
  problem_id: ProblemIdSchema,
  response_format: ResponseFormatSchema.describe("Output format: 'markdown' for readable text or 'json' for structured data")
}).strict();

/**
 * Schema for sdamgia_search_problems tool
 */
export const SearchProblemsInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code to search in"),
  query: SearchQuerySchema,
  limit: LimitSchema,
  response_format: ResponseFormatSchema
}).strict();

/**
 * Schema for sdamgia_search_by_text tool
 */
export const SearchByTextInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code to search in"),
  condition_text: z.string()
    .min(10, "Condition text must be at least 10 characters")
    .max(1000, "Condition text must not exceed 1000 characters")
    .describe("Problem condition text to search for (supports fuzzy matching)"),
  threshold: ThresholdSchema,
  limit: LimitSchema,
  response_format: ResponseFormatSchema
}).strict();

/**
 * Schema for sdamgia_get_catalog tool
 */
export const GetCatalogInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code"),
  response_format: ResponseFormatSchema
}).strict();

/**
 * Schema for sdamgia_get_category_problems tool
 */
export const GetCategoryProblemsInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code"),
  category_id: CategoryIdSchema,
  limit: LimitSchema,
  response_format: ResponseFormatSchema
}).strict();

/**
 * Schema for sdamgia_get_test tool
 */
export const GetTestInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code"),
  test_id: TestIdSchema,
  response_format: ResponseFormatSchema
}).strict();

/**
 * Schema for sdamgia_batch_get_problems tool
 */
export const BatchGetProblemsInputSchema = z.object({
  subject: SubjectSchema.describe("Subject code"),
  problem_ids: z.array(ProblemIdSchema)
    .min(1, "Must provide at least 1 problem ID")
    .max(10, "Cannot fetch more than 10 problems at once")
    .describe("Array of problem IDs to fetch"),
  response_format: ResponseFormatSchema
}).strict();
