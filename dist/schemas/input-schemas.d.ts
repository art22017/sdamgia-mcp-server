/**
 * Zod validation schemas for tool inputs
 */
import { z } from "zod";
import { Subject, ResponseFormat } from "../types.js";
/**
 * Schema for subject parameter
 */
export declare const SubjectSchema: z.ZodNativeEnum<typeof Subject>;
/**
 * Schema for response format parameter
 */
export declare const ResponseFormatSchema: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
/**
 * Schema for problem ID
 */
export declare const ProblemIdSchema: z.ZodString;
/**
 * Schema for test ID
 */
export declare const TestIdSchema: z.ZodString;
/**
 * Schema for category ID
 */
export declare const CategoryIdSchema: z.ZodString;
/**
 * Schema for search query
 */
export declare const SearchQuerySchema: z.ZodString;
/**
 * Schema for limit parameter
 */
export declare const LimitSchema: z.ZodDefault<z.ZodNumber>;
/**
 * Schema for similarity threshold
 */
export declare const ThresholdSchema: z.ZodDefault<z.ZodNumber>;
/**
 * Schema for sdamgia_get_problem tool
 */
export declare const GetProblemInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    problem_id: z.ZodString;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    subject: Subject;
    problem_id: string;
    response_format: ResponseFormat;
}, {
    subject: Subject;
    problem_id: string;
    response_format?: ResponseFormat | undefined;
}>;
/**
 * Schema for sdamgia_search_problems tool
 */
export declare const SearchProblemsInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    subject: Subject;
    response_format: ResponseFormat;
    query: string;
    limit: number;
}, {
    subject: Subject;
    query: string;
    response_format?: ResponseFormat | undefined;
    limit?: number | undefined;
}>;
/**
 * Schema for sdamgia_search_by_text tool
 */
export declare const SearchByTextInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    condition_text: z.ZodString;
    threshold: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    subject: Subject;
    response_format: ResponseFormat;
    limit: number;
    condition_text: string;
    threshold: number;
}, {
    subject: Subject;
    condition_text: string;
    response_format?: ResponseFormat | undefined;
    limit?: number | undefined;
    threshold?: number | undefined;
}>;
/**
 * Schema for sdamgia_get_catalog tool
 */
export declare const GetCatalogInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    subject: Subject;
    response_format: ResponseFormat;
}, {
    subject: Subject;
    response_format?: ResponseFormat | undefined;
}>;
/**
 * Schema for sdamgia_get_category_problems tool
 */
export declare const GetCategoryProblemsInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    category_id: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    category_id: string;
    subject: Subject;
    response_format: ResponseFormat;
    limit: number;
}, {
    category_id: string;
    subject: Subject;
    response_format?: ResponseFormat | undefined;
    limit?: number | undefined;
}>;
/**
 * Schema for sdamgia_get_test tool
 */
export declare const GetTestInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    test_id: z.ZodString;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    subject: Subject;
    response_format: ResponseFormat;
    test_id: string;
}, {
    subject: Subject;
    test_id: string;
    response_format?: ResponseFormat | undefined;
}>;
/**
 * Schema for sdamgia_batch_get_problems tool
 */
export declare const BatchGetProblemsInputSchema: z.ZodObject<{
    subject: z.ZodNativeEnum<typeof Subject>;
    problem_ids: z.ZodArray<z.ZodString, "many">;
    response_format: z.ZodDefault<z.ZodNativeEnum<typeof ResponseFormat>>;
}, "strict", z.ZodTypeAny, {
    subject: Subject;
    response_format: ResponseFormat;
    problem_ids: string[];
}, {
    subject: Subject;
    problem_ids: string[];
    response_format?: ResponseFormat | undefined;
}>;
//# sourceMappingURL=input-schemas.d.ts.map