/**
 * Output formatters for JSON and Markdown
 */
import { Problem, Topic, ResponseFormat } from "../types.js";
/**
 * Format problem as markdown
 */
export declare function formatProblemMarkdown(problem: Problem): string;
/**
 * Format multiple problem IDs as markdown
 */
export declare function formatProblemIdsMarkdown(ids: string[], title?: string): string;
/**
 * Format catalog as markdown
 */
export declare function formatCatalogMarkdown(catalog: Topic[]): string;
/**
 * Format search results as markdown
 */
export declare function formatSearchResultsMarkdown(query: string, results: Array<{
    id: string;
    score?: number;
}>, subject: string): string;
/**
 * Format batch problems as markdown
 */
export declare function formatBatchProblemsMarkdown(problems: Problem[]): string;
/**
 * Format data based on response format
 */
export declare function formatResponse(data: any, format: ResponseFormat, markdownFormatter?: (data: any) => string): string;
//# sourceMappingURL=formatters.d.ts.map